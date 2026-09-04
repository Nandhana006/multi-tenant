"""FastAPI Authentication and Authorization Dependencies"""
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import UserRole
from app.services.db_service import db_service, UserDoc
from app.services.auth_service import decode_access_token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserDoc:
    """Validate JWT token and return authenticated User from MongoDB."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_role(allowed_roles: List[str]):
    """Role-based authorization dependency guard."""
    def role_checker(current_user: UserDoc = Depends(get_current_user)) -> UserDoc:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' is not authorized to perform this action. Required: {allowed_roles}"
            )
        return current_user
    return role_checker

# Convenience role guards
require_hr = require_role([UserRole.HR.value, UserRole.SUPER_ADMIN.value])
require_super_admin = require_role([UserRole.SUPER_ADMIN.value])
require_any_authenticated = get_current_user
