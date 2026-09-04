"""Document Management API Endpoints (HR Only) with MongoDB"""
import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.schemas import DocumentResponse
from app.dependencies import require_hr, get_current_user
from app.services.document_processor import document_processor
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.db_service import db_service, UserDoc

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])

SUPPORTED_EXTENSIONS = {"pdf", "docx", "doc", "txt", "md"}

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserDoc = Depends(require_hr)
):
    """
    Upload a company document (PDF, DOCX, TXT), process text into chunks,
    generate embeddings, and index into Qdrant with company_id isolation.
    Saves document record in MongoDB. HR role required.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company to upload documents."
        )

    filename = file.filename or "uploaded_document.txt"
    ext = filename.lower().split(".")[-1]
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: .{ext}. Supported formats: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        # 1. Extract text
        text = document_processor.extract_text(file_bytes, filename)
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract any readable text from the uploaded document."
            )

        # 2. Chunk text
        chunks = document_processor.chunk_text(text)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document text too short to generate chunks."
            )

        # 3. Generate embeddings
        embeddings = embedding_service.embed_texts(chunks)

        # 4. Generate unique document ID
        doc_id = f"doc_{uuid.uuid4().hex[:10]}"

        # 5. Store in Qdrant with company_id
        vector_store.upsert_chunks(
            company_id=current_user.company_id,
            document_id=doc_id,
            document_name=filename,
            uploaded_by=current_user.email,
            chunks=chunks,
            embeddings=embeddings
        )

        # 6. Save metadata in MongoDB
        db_doc = db_service.create_document({
            "id": doc_id,
            "company_id": current_user.company_id,
            "uploaded_by": current_user.email,
            "filename": filename,
            "file_type": ext,
            "file_size": len(file_bytes),
            "chunk_count": len(chunks),
            "status": "PROCESSED"
        })

        logger.info(f" Successfully processed doc {filename} for tenant {current_user.company_id}")

        return DocumentResponse(
            id=db_doc.id,
            company_id=db_doc.company_id,
            company_name=current_user.company.name if current_user.company else None,
            uploaded_by=db_doc.uploaded_by,
            filename=db_doc.filename,
            file_type=db_doc.file_type,
            file_size=db_doc.file_size,
            chunk_count=db_doc.chunk_count,
            status=db_doc.status,
            created_at=db_doc.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f" Error processing document upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and index document: {str(e)}"
        )

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    current_user: UserDoc = Depends(get_current_user)
):
    """List all uploaded documents belonging to the authenticated user's company from MongoDB."""
    if not current_user.company_id:
        return []
    
    docs = db_service.get_documents_by_company(current_user.company_id)

    return [
        DocumentResponse(
            id=d.id,
            company_id=d.company_id,
            company_name=current_user.company.name if current_user.company else None,
            uploaded_by=d.uploaded_by,
            filename=d.filename,
            file_type=d.file_type,
            file_size=d.file_size,
            chunk_count=d.chunk_count,
            status=d.status,
            created_at=d.created_at
        )
        for d in docs
    ]

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: UserDoc = Depends(require_hr)
):
    """
    Delete a document and all its vector chunks from Qdrant and MongoDB.
    Strictly verifies ownership by current_user's company_id.
    """
    doc = db_service.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    if current_user.role != "SUPER_ADMIN" and doc.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document does not belong to your company."
        )

    # 1. Delete vectors from Qdrant
    vector_store.delete_document_vectors(doc.company_id, doc.id)

    # 2. Delete metadata from MongoDB
    db_service.delete_document(doc_id)

    logger.info(f" Deleted document {doc_id} for tenant {doc.company_id}")
    return {"message": "Document and associated vectors deleted successfully", "document_id": doc_id}
