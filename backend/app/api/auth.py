"""Authentication API Endpoints with MongoDB"""
import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models import UserRole
from app.schemas import (
    LoginRequest, 
    RegisterRequest, 
    RegisterCompanyRequest, 
    TokenResponse, 
    UserResponse
)
from app.services.auth_service import verify_password, get_password_hash, create_access_token
from app.services.mongo_service import mongo_service
from app.services.db_service import db_service, UserDoc
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request):
    """Authenticate user with email/password against MongoDB and return JWT token."""
    user = db_service.get_user_by_email(req.email)
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
        created_at=user.created_at
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


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, request: Request):
    """
    Register an employee account with a valid company invite code in MongoDB.
    """
    email = req.email.strip().lower()
    existing_user = db_service.get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Locate company via invite code or company_id
    company = None
    if req.invite_code and req.invite_code.strip():
        company = db_service.get_company_by_invite_code(req.invite_code.strip())

    if not company and req.company_id:
        company = db_service.get_company_by_id(req.company_id.strip())

    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid company invite code. Please enter a valid invite code (e.g. POLCA-2026, APEX-2026, NEXUS-2026, GLOBAL-2026)."
        )

    user_role = UserRole.EMPLOYEE.value
    if req.role and req.role.upper() in [UserRole.EMPLOYEE.value, UserRole.HR.value]:
        user_role = req.role.upper()

    user_id = f"user_{uuid.uuid4().hex[:10]}"
    new_user = db_service.create_user({
        "id": user_id,
        "name": req.name.strip(),
        "email": email,
        "password_hash": get_password_hash(req.password),
        "company_id": company.id,
        "role": user_role
    })

    token_data = {
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "company_id": company.id,
        "company_name": company.name
    }
    access_token = create_access_token(token_data)

    user_resp = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        company_id=company.id,
        company_name=company.name,
        role=new_user.role,
        created_at=new_user.created_at
    )

    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Web Browser")
    mongo_service.log_auth_event(
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        company_id=company.id,
        company_name=company.name,
        event_type="REGISTER_EMPLOYEE",
        ip_address=client_ip,
        user_agent=user_agent
    )

    return TokenResponse(access_token=access_token, user=user_resp)


@router.post("/register-company", response_model=TokenResponse)
def register_company(req: RegisterCompanyRequest, request: Request):
    """
    Onboard a brand new company tenant into MongoDB Atlas
    and create the initial HR Manager account for that company.
    """
    admin_email = req.admin_email.strip().lower()
    existing_user = db_service.get_user_by_email(admin_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Generate clean company ID slug
    base_slug = re.sub(r'[^a-zA-Z0-9]', '_', req.company_name.lower().strip())
    slug = f"comp_{base_slug[:12]}"
    
    counter = 1
    company_id = slug
    while db_service.get_company_by_id(company_id):
        company_id = f"{slug}_{counter}"
        counter += 1

    invite_code = f"{base_slug[:6].upper()}-{uuid.uuid4().hex[:4].upper()}"
    new_company = db_service.create_company({
        "id": company_id,
        "name": req.company_name.strip(),
        "industry": req.industry.strip() if req.industry else "Enterprise",
        "invite_code": invite_code
    })

    # Create the HR admin user for this company
    user_id = f"user_{uuid.uuid4().hex[:10]}"
    new_user = db_service.create_user({
        "id": user_id,
        "name": req.admin_name.strip(),
        "email": admin_email,
        "password_hash": get_password_hash(req.admin_password),
        "company_id": new_company.id,
        "role": UserRole.HR.value
    })

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
        created_at=new_user.created_at
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
def logout(request: Request, current_user: UserDoc = Depends(get_current_user)):
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
def get_me(current_user: UserDoc = Depends(get_current_user)):
    """Return currently authenticated user info from MongoDB."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        company_id=current_user.company_id,
        company_name=current_user.company.name if current_user.company else None,
        role=current_user.role,
        created_at=current_user.created_at
    )
