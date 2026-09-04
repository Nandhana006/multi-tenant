"""Qdrant Vector Database Integration with Multi-Tenant Filtering"""
import logging
import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """Manages Qdrant vector operations with strict tenant isolation."""

    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.vector_size = settings.EMBEDDING_DIMENSION
        self.client: Optional[QdrantClient] = None
        self._init_client()
        self._ensure_collection()

    def _init_client(self):
        try:
            if settings.QDRANT_API_KEY:
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    check_compatibility=False
                )
            else:
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    check_compatibility=False
                )
            logger.info(" Connected to Qdrant vector database.")
        except Exception as e:
            logger.error(f" Failed to connect to Qdrant: {e}")
            self.client = None

    def _ensure_collection(self):
        """Ensure collection exists and has keyword index on company_id."""
        if not self.client:
            return
        try:
            collections = self.client.get_collections()
            existing_names = [c.name for c in collections.collections]
            
            if self.collection_name not in existing_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f" Created Qdrant collection: {self.collection_name}")
                
                # Create payload index on company_id and document_id for instant filtered lookups
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="company_id",
                    field_schema=models.PayloadSchemaType.KEYWORD
                )
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="document_id",
                    field_schema=models.PayloadSchemaType.KEYWORD
                )
                logger.info(" Created payload indexes for 'company_id' and 'document_id'")
            else:
                logger.info(f" Qdrant collection ready: {self.collection_name}")
        except Exception as e:
            logger.error(f" Error ensuring collection {self.collection_name}: {e}")


    def upsert_chunks(
        self,
        company_id: str,
        document_id: str,
        document_name: str,
        uploaded_by: str,
        chunks: List[str],
        embeddings: List[List[float]]
    ) -> int:
        """Store document chunks with tenant metadata."""
        if not self.client or not chunks:
            return 0
        
        points = []
        for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{company_id}_{document_id}_{idx}"))
            payload = {
                "company_id": company_id,
                "document_id": document_id,
                "document_name": document_name,
                "uploaded_by": uploaded_by,
                "chunk_id": f"{document_id}_chk_{idx}",
                "chunk_index": idx,
                "text": chunk_text
            }
            points.append(models.PointStruct(id=point_id, vector=embedding, payload=payload))

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        logger.info(f" Upserted {len(points)} vectors for doc {document_id} [tenant: {company_id}]")
        return len(points)

    def search_chunks(
        self,
        company_id: str,
        query_embedding: List[float],
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Search vectors with STRICT company_id filter enforcement.
        NEVER searches across tenants.
        """
        if not self.client:
            return []
        
        tenant_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="company_id",
                    match=models.MatchValue(value=company_id)
                )
            ]
        )

        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=tenant_filter,
                limit=top_k,
                with_payload=True
            )
            
            chunks = []
            for hit in results:
                chunks.append({
                    "score": hit.score,
                    "document_id": hit.payload.get("document_id"),
                    "document_name": hit.payload.get("document_name"),
                    "chunk_id": hit.payload.get("chunk_id"),
                    "company_id": hit.payload.get("company_id"),
                    "text": hit.payload.get("text", "")
                })
            return chunks
        except Exception as e:
            logger.error(f" Vector search failed: {e}")
            return []

    def delete_document_vectors(self, company_id: str, document_id: str) -> bool:
        """Delete all vectors for a specific document belonging to a company."""
        if not self.client:
            return False
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(key="company_id", match=models.MatchValue(value=company_id)),
                            models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))
                        ]
                    )
                )
            )
            logger.info(f" Deleted vectors for doc {document_id} [tenant: {company_id}]")
            return True
        except Exception as e:
            logger.error(f" Failed to delete vectors: {e}")
            return False

vector_store = VectorStoreManager()
