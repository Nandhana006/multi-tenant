"""Pydantic Request & Response Schemas"""
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class LoginRequest(BaseModel):
    email: str
    password: str
    required_role: Optional[str] = None  # "HR" or "EMPLOYEE"


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    invite_code: str

class CreateEmployeeRequest(BaseModel):
    name: str
    email: str
    password: Optional[str] = "Demo1234!"
    role: Optional[str] = "EMPLOYEE"
    title: Optional[str] = None


class RegisterCompanyRequest(BaseModel):
    company_name: str
    industry: Optional[str] = "Enterprise"
    admin_name: str
    admin_email: str
    admin_password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    company_id: Optional[str] = None
    company_name: Optional[str] = None
    role: str
    created_at: Optional[str] = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    industry: Optional[str] = None
    invite_code: Optional[str] = None
    hr_name: Optional[str] = None
    hr_email: Optional[str] = None
    created_at: Optional[str] = None
    user_count: Optional[int] = 0
    document_count: Optional[int] = 0

class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company_id: str
    company_name: Optional[str] = None
    uploaded_by: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    created_at: Optional[str] = None

class SourceCitation(BaseModel):
    document_id: str
    document_name: str
    chunk_id: str
    snippet: str
    score: float

class ChatMessageHistory(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    top_k: Optional[int] = 4
    history: Optional[List[ChatMessageHistory]] = None

class ChatResponse(BaseModel):
    question: str
    answer: str
    company_id: str
    company_name: str
    sources: List[SourceCitation]
    grounded: bool = True

class PlatformStatsResponse(BaseModel):
    total_companies: int
    total_users: int
    total_documents: int
    total_chunks_indexed: int
    isolation_status: str
    companies: List[CompanyResponse]

TokenResponse.model_rebuild()
