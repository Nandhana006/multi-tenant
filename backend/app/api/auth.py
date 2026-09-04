"""Authentication API Endpoints"""
import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Company, UserRole
from app.schemas import (
    LoginRequest, 
    RegisterRequest, 
    RegisterCompanyRequest, 
    TokenResponse, 
    UserResponse
)
from app.services.auth_service import verify_password, get_password_hash, create_access_token
from app.services.mongo_service import mongo_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user with email/password and return JWT token."""
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Strict Portal Role Enforcement
    if req.required_role and req.required_role.upper() == "HR":
        if user.role not in [UserRole.HR.value, UserRole.SUPER_ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: This portal is exclusively for HR Managers. Please switch to the Employee Sign-In portal."
            )
    elif req.required_role and req.required_role.upper() == "EMPLOYEE":
        if user.role in [UserRole.HR.value, UserRole.SUPER_ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: This account belongs to an HR Manager. Please switch to the HR Portal to sign in."
            )
        elif user.role != UserRole.EMPLOYEE.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: Only verified employees may sign in through this portal."
            )


    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id,
        "company_name": user.company.name if user.company else None
    }
    access_token = create_access_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        company_id=user.company_id,
        company_name=user.company.name if user.company else None,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else None
    )

    # Log Sign-In event to MongoDB Atlas
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Web Browser")
    mongo_service.log_auth_event(
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        company_id=user.company_id,
        company_name=user.company.name if user.company else None,
        event_type="SIGN_IN",
        ip_address=client_ip,
        user_agent=user_agent
    )

    return TokenResponse(access_token=access_token, user=user_resp)


@router.post("/register")
def register(request: Request):
    """
    Self-registration is disabled per enterprise governance.
    Employee accounts must be provisioned directly by an authorized HR Manager via the HR Portal.
    """
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Self-registration is disabled. Employee accounts must be provisioned directly by an authorized HR Manager via the HR Portal."
    )



@router.post("/register-company", response_model=TokenResponse)
def register_company(req: RegisterCompanyRequest, request: Request, db: Session = Depends(get_db)):
    """
    Onboard a brand new company tenant with its own isolated data partition
    and create the initial HR Manager account for that company.
    """
    admin_email = req.admin_email.strip().lower()
    existing_user = db.query(User).filter(User.email == admin_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Generate clean company ID slug
    base_slug = re.sub(r'[^a-zA-Z0-9]', '_', req.company_name.lower().strip())
    slug = f"comp_{base_slug[:12]}"
    
    # Ensure uniqueness
    counter = 1
    company_id = slug
    while db.query(Company).filter(Company.id == company_id).first():
        company_id = f"{slug}_{counter}"
        counter += 1

    invite_code = f"{base_slug[:6].upper()}-{uuid.uuid4().hex[:4].upper()}"
    new_company = Company(
        id=company_id,
        name=req.company_name.strip(),
        industry=req.industry.strip() if req.industry else "Enterprise",
        invite_code=invite_code
    )
    db.add(new_company)
    db.commit()

    # Create the HR admin user for this company
    user_id = f"user_{uuid.uuid4().hex[:10]}"
    new_user = User(
        id=user_id,
        name=req.admin_name.strip(),
        email=admin_email,
        password_hash=get_password_hash(req.admin_password),
        company_id=new_company.id,
        role=UserRole.HR.value
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token_data = {
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "company_id": new_company.id,
        "company_name": new_company.name
    }
    access_token = create_access_token(token_data)

    user_resp = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        company_id=new_user.company_id,
        company_name=new_company.name,
        role=new_user.role,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None
    )

    # Log Register Company to MongoDB Atlas
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Web Browser")
    mongo_service.log_auth_event(
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        company_id=new_company.id,
        company_name=new_company.name,
        event_type="REGISTER_COMPANY",
        ip_address=client_ip,
        user_agent=user_agent
    )

    return TokenResponse(access_token=access_token, user=user_resp)

@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user)):
    """Log user sign out event into MongoDB audit collection."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Web Browser")
    mongo_service.log_auth_event(
        user_id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        company_id=current_user.company_id,
        company_name=current_user.company.name if current_user.company else None,
        event_type="SIGN_OUT",
        ip_address=client_ip,
        user_agent=user_agent
    )
    return {"message": "Signed out successfully", "logged": True}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user info."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        company_id=current_user.company_id,
        company_name=current_user.company.name if current_user.company else None,
        role=current_user.role,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )

