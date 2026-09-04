"""Company API Endpoints with MongoDB"""
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models import UserRole
from app.schemas import CompanyResponse, CreateEmployeeRequest
from app.dependencies import get_current_user
from app.services.auth_service import get_password_hash
from app.services.mongo_service import mongo_service
from app.services.db_service import db_service, UserDoc

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyResponse])
def list_companies():
    """List all registered companies from MongoDB."""
    companies = db_service.get_companies()
    results = []
    for comp in companies:
        user_cnt = db_service.count_users_in_company(comp.id)
        doc_cnt = db_service.count_documents_in_company(comp.id)
        company_users = db_service.get_users_by_company(comp.id)
        hr_user = next((u for u in company_users if u.role == "HR"), None)
        results.append(CompanyResponse(
            id=comp.id,
            name=comp.name,
            industry=comp.industry,
            invite_code=comp.invite_code,
            hr_name=hr_user.name if hr_user else "HR Department",
            hr_email=hr_user.email if hr_user else None,
            created_at=comp.created_at,
            user_count=user_cnt,
            document_count=doc_cnt
        ))
    return results

@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: str):
    """Get single company details from MongoDB."""
    comp = db_service.get_company_by_id(company_id)
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    
    user_cnt = db_service.count_users_in_company(comp.id)
    doc_cnt = db_service.count_documents_in_company(comp.id)
    company_users = db_service.get_users_by_company(comp.id)
    hr_user = next((u for u in company_users if u.role == "HR"), None)
    
    return CompanyResponse(
        id=comp.id,
        name=comp.name,
        industry=comp.industry,
        invite_code=comp.invite_code,
        hr_name=hr_user.name if hr_user else "HR Department",
        hr_email=hr_user.email if hr_user else None,
        created_at=comp.created_at,
        user_count=user_cnt,
        document_count=doc_cnt
    )

@router.get("/my/employees")
def get_company_employees(
    current_user: UserDoc = Depends(get_current_user)
):
    """Get list of all employees in the logged-in HR's company."""
    if not current_user.company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No company associated with user.")
    
    users = db_service.get_users_by_company(current_user.company_id)
    
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "company_id": u.company_id,
            "company_name": u.company.name if u.company else None,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.get("/my/logs")
def get_company_audit_logs(
    current_user: UserDoc = Depends(get_current_user)
):
    """Get real-time sign-in/out audit logs and chat history from MongoDB for HR's company."""
    if not current_user.company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No company associated with user.")

    auth_logs = mongo_service.get_company_auth_logs(current_user.company_id, limit=30)
    chat_logs = mongo_service.get_company_chat_history(current_user.company_id, limit=30)
    is_connected = mongo_service.is_connected() or db_service.is_connected()

    return {
        "mongo_connected": is_connected,
        "auth_logs": auth_logs,
        "chat_logs": chat_logs
    }


@router.post("/my/employees", status_code=status.HTTP_201_CREATED)
def create_employee_by_hr(
    req: CreateEmployeeRequest,
    current_user: UserDoc = Depends(get_current_user)
):
    """
    Strict HR-Only Action: Create a new employee account directly from the HR Portal into MongoDB.
    """
    if current_user.role not in [UserRole.HR.value, UserRole.SUPER_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only authorized HR Managers can provision employee accounts."
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user is not associated with an active company."
        )

    clean_email = req.email.strip().lower()
    existing_user = db_service.get_user_by_email(clean_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{clean_email}' already exists."
        )

    emp_password = req.password.strip() if req.password and req.password.strip() else "Demo1234!"
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    display_name = req.name.strip()
    if req.title and req.title.strip():
        display_name = f"{display_name} ({req.title.strip()})"

    new_user = db_service.create_user({
        "id": user_id,
        "name": display_name,
        "email": clean_email,
        "password_hash": get_password_hash(emp_password),
        "company_id": current_user.company_id,
        "role": UserRole.EMPLOYEE.value,
        "created_at": datetime.utcnow().isoformat()
    })

    # Log employee creation event in MongoDB Atlas
    mongo_service.log_auth_event(
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        company_id=new_user.company_id,
        company_name=current_user.company.name if current_user.company else "Company",
        event_type="HR_PROVISIONED_EMPLOYEE",
        details={
            "created_by_hr_id": current_user.id,
            "created_by_hr_email": current_user.email,
            "assigned_role": new_user.role
        }
    )

    return {
        "success": True,
        "message": "Employee account provisioned successfully.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "company_id": new_user.company_id,
            "company_name": current_user.company.name if current_user.company else None,
            "created_at": new_user.created_at
        },
        "credentials": {
            "email": new_user.email,
            "initial_password": emp_password
        }
    }


@router.get("/my/employees/{user_id}/chat-history")
def get_employee_chat_history(
    user_id: str,
    current_user: UserDoc = Depends(get_current_user)
):
    """
    Get past AI assistant conversation history for a specific employee from MongoDB.
    Enforces strict tenant isolation.
    """
    if current_user.role not in [UserRole.HR.value, UserRole.SUPER_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only HR Managers and Super Admins can inspect employee conversation history."
        )

    target_user = db_service.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )

    # Tenant check
    if current_user.role != UserRole.SUPER_ADMIN.value and target_user.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant Isolation: You cannot view conversations of an employee from another company."
        )

    conversations = db_service.get_chat_history(company_id=target_user.company_id, user_id=user_id, limit=100)

    return {
        "employee": {
            "id": target_user.id,
            "name": target_user.name,
            "email": target_user.email,
            "role": target_user.role,
            "company_id": target_user.company_id,
            "company_name": target_user.company.name if target_user.company else None
        },
        "conversations": conversations,
        "total": len(conversations)
    }
