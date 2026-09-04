"""Multi-Tenant Chat API Endpoints"""
import uuid
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatMessage, Company
from app.schemas import ChatRequest, ChatResponse
from app.dependencies import get_current_user
from app.services.rag_service import rag_service
from app.services.mongo_service import mongo_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat & RAG Assistant"])

@router.post("", response_model=ChatResponse)
def ask_chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        # Super admin fallback
        comp = db.query(Company).first()
        if comp:
            company_id = comp.id
            company_name = comp.name
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

    # 1. Save to relational DB
    try:
        msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        db_msg = ChatMessage(
            id=msg_id,
            company_id=company_id,
            user_id=current_user.id,
            user_name=current_user.name,
            question=req.question.strip(),
            answer=response.answer,
            sources=sources_payload
        )
        db.add(db_msg)
        db.commit()
    except Exception as e:
        logger.error(f" Failed to save chat history to relational DB: {e}")

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for current user."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(50)
        .all()
    )
    return [m.to_dict() for m in reversed(messages)]


@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear chat history for current user."""
    try:
        db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
        db.commit()
        return {"message": "Chat history cleared successfully", "cleared": True}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear chat history."
        )
