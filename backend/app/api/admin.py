"""Super Admin Platform Management Endpoints"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, User, Document
from app.schemas import PlatformStatsResponse, CompanyResponse, UserResponse
from app.dependencies import require_super_admin

router = APIRouter(prefix="/admin", tags=["Super Admin"])

@router.get("/overview", response_model=PlatformStatsResponse)
def get_platform_overview(
    admin_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Platform statistics and company breakdown for Super Admin."""
    companies = db.query(Company).all()
    total_users = db.query(User).count()
    total_docs = db.query(Document).count()
    
    comp_responses = []
    total_chunks = 0
    for comp in companies:
        user_cnt = db.query(User).filter(User.company_id == comp.id).count()
        docs = db.query(Document).filter(Document.company_id == comp.id).all()
        doc_cnt = len(docs)
        chunks_for_comp = sum(d.chunk_count for d in docs)
        total_chunks += chunks_for_comp
        
        comp_responses.append(CompanyResponse(
            id=comp.id,
            name=comp.name,
            industry=comp.industry,
            created_at=comp.created_at.isoformat() if comp.created_at else None,
            user_count=user_cnt,
            document_count=doc_cnt
        ))

    return PlatformStatsResponse(
        total_companies=len(companies),
        total_users=total_users,
        total_documents=total_docs,
        total_chunks_indexed=total_chunks,
        isolation_status="ACTIVE (Strict Vector Filtering by company_id)",
        companies=comp_responses
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """List all registered users across all tenant companies."""
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            company_id=u.company_id,
            company_name=u.company.name if u.company else None,
            role=u.role,
            created_at=u.created_at.isoformat() if u.created_at else None
        )
        for u in users
    ]
