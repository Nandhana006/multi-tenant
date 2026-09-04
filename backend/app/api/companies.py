"""Company API Endpoints"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Company, User, Document, UserRole, ChatMessage
from app.schemas import CompanyResponse, CreateEmployeeRequest
from app.dependencies import get_current_user
from app.services.auth_service import get_password_hash
from app.services.mongo_service import mongo_service


router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyResponse])
def list_companies(db: Session = Depends(get_db)):
    """List all registered companies (Public for demo selection / exploration)."""
    companies = db.query(Company).all()
    results = []
    for comp in companies:
        user_cnt = db.query(User).filter(User.company_id == comp.id).count()
        doc_cnt = db.query(Document).filter(Document.company_id == comp.id).count()
        hr_user = db.query(User).filter(User.company_id == comp.id, User.role == "HR").first()
        results.append(CompanyResponse(
            id=comp.id,
            name=comp.name,
            industry=comp.industry,
            invite_code=comp.invite_code,
            hr_name=hr_user.name if hr_user else "HR Department",
            hr_email=hr_user.email if hr_user else None,
            created_at=comp.created_at.isoformat() if comp.created_at else None,
            user_count=user_cnt,
            document_count=doc_cnt
        ))
    return results

@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: str, db: Session = Depends(get_db)):
    """Get single company details."""
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    
    user_cnt = db.query(User).filter(User.company_id == comp.id).count()
    doc_cnt = db.query(Document).filter(Document.company_id == comp.id).count()
    hr_user = db.query(User).filter(User.company_id == comp.id, User.role == "HR").first()
    
    return CompanyResponse(
        id=comp.id,
        name=comp.name,
        industry=comp.industry,
        invite_code=comp.invite_code,
        hr_name=hr_user.name if hr_user else "HR Department",
        hr_email=hr_user.email if hr_user else None,
        created_at=comp.created_at.isoformat() if comp.created_at else None,
        user_count=user_cnt,
        document_count=doc_cnt
    )

@router.get("/my/employees")
def get_company_employees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of all employees in the logged-in HR's company.
    """
    if not current_user.company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No company associated with user.")
    
    users = db.query(User).filter(User.company_id == current_user.company_id).order_by(User.created_at.desc()).all()
    
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "company_id": u.company_id,
            "company_name": u.company.name if u.company else None,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

@router.get("/my/logs")
def get_company_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get real-time sign-in/out audit logs and chat history from MongoDB for HR's company.
    """
    from app.services.mongo_service import mongo_service
    if not current_user.company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No company associated with user.")

    auth_logs = mongo_service.get_company_auth_logs(current_user.company_id, limit=30)
    chat_logs = mongo_service.get_company_chat_history(current_user.company_id, limit=30)
    is_connected = mongo_service.is_connected()

    return {
        "mongo_connected": is_connected,
        "auth_logs": auth_logs,
        "chat_logs": chat_logs
    }


@router.post("/my/employees", status_code=status.HTTP_201_CREATED)
def create_employee_by_hr(
    req: CreateEmployeeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Strict HR-Only Action: Create a new employee account directly from the HR Portal.
    Self-registration by outside parties is disabled; HR assigns credentials to staff.
    """
    import uuid
    from datetime import datetime


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
    existing_user = db.query(User).filter(User.email == clean_email).first()
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

    new_user = User(
        id=user_id,
        name=display_name,
        email=clean_email,
        password_hash=get_password_hash(emp_password),
        company_id=current_user.company_id,
        role=UserRole.EMPLOYEE.value,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

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
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None
        },
        "credentials": {
            "email": new_user.email,
            "initial_password": emp_password
        }
    }


@router.get("/my/employees/{user_id}/chat-history")
def get_employee_chat_history(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get past AI assistant conversation history for a specific employee.
    Enforces strict tenant isolation.
    """
    if current_user.role not in [UserRole.HR.value, UserRole.SUPER_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only HR Managers and Super Admins can inspect employee conversation history."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
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

    # 1. Query from Relational Database
    sql_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.company_id == target_user.company_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(100)
        .all()
    )
    conversations = [m.to_dict() for m in sql_messages]

    # 2. If empty in SQL, check MongoDB Atlas as fallback
    if not conversations and mongo_service.is_connected():
        try:
            import pymongo
            mongo_chats = list(
                mongo_service.db.chat_conversations.find(
                    {"user_id": user_id, "company_id": target_user.company_id},
                    {"_id": 0}
                )
                .sort("timestamp", pymongo.ASCENDING)
                .limit(100)
            )
            if mongo_chats:
                conversations = [
                    {
                        "id": f"mongo_{idx}",
                        "company_id": c.get("company_id"),
                        "user_id": c.get("user_id"),
                        "user_name": c.get("user_name"),
                        "question": c.get("question"),
                        "answer": c.get("answer"),
                        "sources": c.get("sources", []),
                        "created_at": c.get("timestamp")
                    }
                    for idx, c in enumerate(mongo_chats)
                ]
        except Exception:
            pass

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



