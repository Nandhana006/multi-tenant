"""Multi-Tenant Chat API Endpoints with MongoDB"""
import uuid
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import ChatRequest, ChatResponse
from app.dependencies import get_current_user
from app.services.rag_service import rag_service
from app.services.mongo_service import mongo_service
from app.services.db_service import db_service, UserDoc

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat & RAG Assistant"])

@router.post("", response_model=ChatResponse)
def ask_chat(
    req: ChatRequest,
    current_user: UserDoc = Depends(get_current_user)
):
    """
    Ask a question to the AI HR Assistant.
    Mandatorily enforces multi-tenant vector isolation based on current_user's company_id.
    """
    if not req.question or not req.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    # Determine company context strictly from authenticated user
    company_id = current_user.company_id
    company_name = current_user.company.name if current_user.company else "Company"

    if not company_id:
        companies = db_service.get_companies()
        if companies:
            company_id = companies[0].id
            company_name = companies[0].name
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Super Admin must select a company to query."
            )

    logger.info(f" Chat request from {current_user.email} (Role: {current_user.role}, Tenant: {company_id})")

    # Format history payload if provided
    history_payload = [h.model_dump() for h in req.history] if req.history else []

    # Execute tenant-isolated RAG retrieval and answer generation
    response = rag_service.query(
        company_id=company_id,
        company_name=company_name,
        question=req.question.strip(),
        top_k=req.top_k or 4,
        history=history_payload
    )

    sources_payload = [s.model_dump() for s in response.sources]

    # 1. Save to MongoDB via db_service
    try:
        msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        db_service.save_chat_message({
            "id": msg_id,
            "company_id": company_id,
            "user_id": current_user.id,
            "user_name": current_user.name,
            "question": req.question.strip(),
            "answer": response.answer,
            "sources": sources_payload
        })
    except Exception as e:
        logger.error(f" Failed to save chat message to MongoDB: {e}")

    # 2. Save full conversation history and grounded citations to MongoDB Atlas
    mongo_service.log_chat_conversation(
        company_id=company_id,
        company_name=company_name,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        question=req.question.strip(),
        answer=response.answer,
        sources=sources_payload,
        grounded=response.grounded
    )

    return response


@router.get("/history")
def get_chat_history(
    current_user: UserDoc = Depends(get_current_user)
):
    """Get chat history for current user from MongoDB."""
    if not current_user.company_id:
        return []
    messages = db_service.get_chat_history(company_id=current_user.company_id, user_id=current_user.id, limit=50)
    return messages


@router.delete("/history")
def clear_chat_history(
    current_user: UserDoc = Depends(get_current_user)
):
    """Clear chat history for current user in MongoDB."""
    try:
        if db_service.is_connected():
            db_service.db.chat_messages.delete_many({"user_id": current_user.id})
        db_service._local_memory["chat_messages"] = [
            m for m in db_service._local_memory["chat_messages"] if m.get("user_id") != current_user.id
        ]
        return {"message": "Chat history cleared successfully", "cleared": True}
    except Exception as e:
        logger.error(f"Failed to clear chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear chat history."
        )
