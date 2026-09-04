"""Super Admin Platform Management Endpoints with MongoDB"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas import PlatformStatsResponse, CompanyResponse, UserResponse
from app.dependencies import require_super_admin
from app.services.db_service import db_service, UserDoc

router = APIRouter(prefix="/admin", tags=["Super Admin"])

@router.get("/overview", response_model=PlatformStatsResponse)
def get_platform_overview(
    admin_user: UserDoc = Depends(require_super_admin)
):
    """Platform statistics and company breakdown for Super Admin from MongoDB."""
    companies = db_service.get_companies()
    
    total_users = 0
    total_docs = 0
    total_chunks = 0
    comp_responses = []

    for comp in companies:
        user_cnt = db_service.count_users_in_company(comp.id)
        docs = db_service.get_documents_by_company(comp.id)
        doc_cnt = len(docs)
        chunks_for_comp = sum(d.chunk_count for d in docs)
        
        total_users += user_cnt
        total_docs += doc_cnt
        total_chunks += chunks_for_comp
        
        comp_responses.append(CompanyResponse(
            id=comp.id,
            name=comp.name,
            industry=comp.industry,
            invite_code=comp.invite_code,
            created_at=comp.created_at,
            user_count=user_cnt,
            document_count=doc_cnt
        ))

    return PlatformStatsResponse(
        total_companies=len(companies),
        total_users=total_users,
        total_documents=total_docs,
        total_chunks_indexed=total_chunks,
        isolation_status="ACTIVE (Strict MongoDB Collection & Vector Filtering by company_id)",
        companies=comp_responses
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin_user: UserDoc = Depends(require_super_admin)
):
    """List all registered users across all tenant companies from MongoDB."""
    users = []
    companies = db_service.get_companies()
    for comp in companies:
        users.extend(db_service.get_users_by_company(comp.id))
    
    # Also include platform admin
    admin = db_service.get_user_by_email("admin@platform.com")
    if admin and admin not in users:
        users.insert(0, admin)

    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            company_id=u.company_id,
            company_name=u.company.name if u.company else None,
            role=u.role,
            created_at=u.created_at
        )
        for u in users
    ]
