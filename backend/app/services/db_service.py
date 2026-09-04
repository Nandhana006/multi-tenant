"""MongoDB Database Service Layer

Serves as the primary data store for the HR Multi-Tenant Platform,
managing users, companies, documents, chat messages, and audit logs.
"""
import os
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
import certifi
import pymongo
from pymongo import MongoClient
from app.config import settings

logger = logging.getLogger(__name__)

class CompanyDoc:
    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.name = data.get("name")
        self.industry = data.get("industry")
        self.invite_code = data.get("invite_code")
        self.created_at = data.get("created_at")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "industry": self.industry,
            "invite_code": self.invite_code,
            "created_at": self.created_at
        }

class UserDoc:
    def __init__(self, data: Dict[str, Any], company: Optional[CompanyDoc] = None):
        self.id = data.get("id")
        self.name = data.get("name")
        self.email = data.get("email")
        self.password_hash = data.get("password_hash")
        self.company_id = data.get("company_id")
        self.role = data.get("role")
        self.created_at = data.get("created_at")
        self.company = company

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "company_id": self.company_id,
            "company_name": self.company.name if self.company else None,
            "role": self.role,
            "created_at": self.created_at
        }

class DocumentDoc:
    def __init__(self, data: Dict[str, Any], company_name: Optional[str] = None):
        self.id = data.get("id")
        self.company_id = data.get("company_id")
        self.company_name = company_name or data.get("company_name")
        self.uploaded_by = data.get("uploaded_by")
        self.filename = data.get("filename")
        self.file_type = data.get("file_type", "txt")
        self.file_size = data.get("file_size", 0)
        self.chunk_count = data.get("chunk_count", 0)
        self.status = data.get("status", "PROCESSED")
        self.created_at = data.get("created_at")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "company_id": self.company_id,
            "company_name": self.company_name,
            "uploaded_by": self.uploaded_by,
            "filename": self.filename,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "chunk_count": self.chunk_count,
            "status": self.status,
            "created_at": self.created_at
        }

class DatabaseService:
    def __init__(self):
        self.uri = settings.MONGO_URI
        self.db_name = settings.MONGO_DB or "hr_platform_db"
        self.client: Optional[MongoClient] = None
        self.db = None
        self._connected = False
        self._local_memory: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "companies": [],
            "documents": [],
            "chat_messages": []
        }
        self.init_database()

    def init_database(self):
        """Connect to MongoDB Atlas or fallback gracefully."""
        if not self.uri:
            logger.warning("No MONGO_URI provided. Running with in-memory fallback.")
            return

        try:
            self.client = MongoClient(
                self.uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                socketTimeoutMS=5000,
                tlsAllowInvalidCertificates=True
            )
            self.db = self.client[self.db_name]
            # Verify connection
            self.client.admin.command("ping")
            self._connected = True
            logger.info(f"Connected to MongoDB Atlas database: '{self.db_name}'")

            # Create Indexes
            self.db.users.create_index("email", unique=True)
            self.db.users.create_index("company_id")
            self.db.companies.create_index("invite_code", unique=True)
            self.db.documents.create_index("company_id")
            self.db.chat_messages.create_index([("company_id", pymongo.ASCENDING), ("created_at", pymongo.ASCENDING)])
        except Exception as e:
            logger.warning(f"MongoDB Atlas connection notice: {e}. Running with graceful fallback.")
            self._connected = False

    def is_connected(self) -> bool:
        return self._connected and self.db is not None

    # ================= COMPANIES =================
    def get_companies(self) -> List[CompanyDoc]:
        if self.is_connected():
            docs = list(self.db.companies.find({}, {"_id": 0}))
            return [CompanyDoc(d) for d in docs]
        return [CompanyDoc(d) for d in self._local_memory["companies"]]

    def get_company_by_id(self, company_id: str) -> Optional[CompanyDoc]:
        if not company_id:
            return None
        if self.is_connected():
            d = self.db.companies.find_one({"id": company_id}, {"_id": 0})
            return CompanyDoc(d) if d else None
        for d in self._local_memory["companies"]:
            if d.get("id") == company_id:
                return CompanyDoc(d)
        return None

    def get_company_by_invite_code(self, code: str) -> Optional[CompanyDoc]:
        if not code:
            return None
        norm_code = code.strip().upper()
        if self.is_connected():
            d = self.db.companies.find_one({"invite_code": norm_code}, {"_id": 0})
            if not d:
                # Also check by ID fallback (e.g. comp_apex)
                d = self.db.companies.find_one({"id": code.strip().lower()}, {"_id": 0})
            return CompanyDoc(d) if d else None
        for d in self._local_memory["companies"]:
            if d.get("invite_code") == norm_code or d.get("id") == code.strip().lower():
                return CompanyDoc(d)
        return None

    def create_company(self, data: Dict[str, Any]) -> CompanyDoc:
        doc = {
            "id": data["id"],
            "name": data["name"],
            "industry": data.get("industry", "Enterprise"),
            "invite_code": data["invite_code"],
            "created_at": data.get("created_at") or datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.companies.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
        else:
            self._local_memory["companies"] = [c for c in self._local_memory["companies"] if c["id"] != doc["id"]]
            self._local_memory["companies"].append(doc)
        return CompanyDoc(doc)

    # ================= USERS =================
    def get_user_by_email(self, email: str) -> Optional[UserDoc]:
        if not email:
            return None
        clean_email = email.strip().lower()
        doc = None
        if self.is_connected():
            doc = self.db.users.find_one({"email": clean_email}, {"_id": 0})
        else:
            for u in self._local_memory["users"]:
                if u.get("email") == clean_email:
                    doc = u
                    break
        if not doc:
            return None
        comp = self.get_company_by_id(doc.get("company_id")) if doc.get("company_id") else None
        return UserDoc(doc, company=comp)

    def get_user_by_id(self, user_id: str) -> Optional[UserDoc]:
        if not user_id:
            return None
        doc = None
        if self.is_connected():
            doc = self.db.users.find_one({"id": user_id}, {"_id": 0})
        else:
            for u in self._local_memory["users"]:
                if u.get("id") == user_id:
                    doc = u
                    break
        if not doc:
            return None
        comp = self.get_company_by_id(doc.get("company_id")) if doc.get("company_id") else None
        return UserDoc(doc, company=comp)

    def get_users_by_company(self, company_id: str) -> List[UserDoc]:
        if not company_id:
            return []
        comp = self.get_company_by_id(company_id)
        if self.is_connected():
            docs = list(self.db.users.find({"company_id": company_id}, {"_id": 0}))
            return [UserDoc(d, company=comp) for d in docs]
        return [UserDoc(d, company=comp) for d in self._local_memory["users"] if d.get("company_id") == company_id]

    def count_users_in_company(self, company_id: str) -> int:
        if not company_id:
            return 0
        if self.is_connected():
            return self.db.users.count_documents({"company_id": company_id})
        return len([u for u in self._local_memory["users"] if u.get("company_id") == company_id])

    def create_user(self, data: Dict[str, Any]) -> UserDoc:
        doc = {
            "id": data["id"],
            "name": data["name"],
            "email": data["email"].strip().lower(),
            "password_hash": data["password_hash"],
            "company_id": data.get("company_id"),
            "role": data.get("role", "EMPLOYEE"),
            "created_at": data.get("created_at") or datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.users.update_one({"email": doc["email"]}, {"$set": doc}, upsert=True)
        else:
            self._local_memory["users"] = [u for u in self._local_memory["users"] if u["email"] != doc["email"]]
            self._local_memory["users"].append(doc)
        comp = self.get_company_by_id(doc.get("company_id")) if doc.get("company_id") else None
        return UserDoc(doc, company=comp)

    def delete_user(self, user_id: str) -> bool:
        if self.is_connected():
            res = self.db.users.delete_one({"id": user_id})
            return res.deleted_count > 0
        initial_len = len(self._local_memory["users"])
        self._local_memory["users"] = [u for u in self._local_memory["users"] if u["id"] != user_id]
        return len(self._local_memory["users"]) < initial_len

    # ================= DOCUMENTS =================
    def get_documents_by_company(self, company_id: str) -> List[DocumentDoc]:
        comp = self.get_company_by_id(company_id)
        comp_name = comp.name if comp else None
        if self.is_connected():
            docs = list(self.db.documents.find({"company_id": company_id}, {"_id": 0}))
            return [DocumentDoc(d, company_name=comp_name) for d in docs]
        return [DocumentDoc(d, company_name=comp_name) for d in self._local_memory["documents"] if d.get("company_id") == company_id]

    def get_document_by_id(self, doc_id: str) -> Optional[DocumentDoc]:
        if not doc_id:
            return None
        doc = None
        if self.is_connected():
            doc = self.db.documents.find_one({"id": doc_id}, {"_id": 0})
        else:
            for d in self._local_memory["documents"]:
                if d.get("id") == doc_id:
                    doc = d
                    break
        if not doc:
            return None
        comp = self.get_company_by_id(doc.get("company_id"))
        return DocumentDoc(doc, company_name=comp.name if comp else None)

    def count_documents_in_company(self, company_id: str) -> int:
        if not company_id:
            return 0
        if self.is_connected():
            return self.db.documents.count_documents({"company_id": company_id})
        return len([d for d in self._local_memory["documents"] if d.get("company_id") == company_id])

    def create_document(self, data: Dict[str, Any]) -> DocumentDoc:
        doc = {
            "id": data["id"],
            "company_id": data["company_id"],
            "uploaded_by": data["uploaded_by"],
            "filename": data["filename"],
            "file_type": data.get("file_type", "txt"),
            "file_size": data.get("file_size", 0),
            "chunk_count": data.get("chunk_count", 0),
            "status": data.get("status", "PROCESSED"),
            "created_at": data.get("created_at") or datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.documents.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
        else:
            self._local_memory["documents"] = [d for d in self._local_memory["documents"] if d["id"] != doc["id"]]
            self._local_memory["documents"].append(doc)
        comp = self.get_company_by_id(doc["company_id"])
        return DocumentDoc(doc, company_name=comp.name if comp else None)

    def delete_document(self, doc_id: str) -> bool:
        if self.is_connected():
            res = self.db.documents.delete_one({"id": doc_id})
            return res.deleted_count > 0
        initial_len = len(self._local_memory["documents"])
        self._local_memory["documents"] = [d for d in self._local_memory["documents"] if d["id"] != doc_id]
        return len(self._local_memory["documents"]) < initial_len

    # ================= CHAT MESSAGES =================
    def save_chat_message(self, data: Dict[str, Any]) -> Dict[str, Any]:
        msg = {
            "id": data.get("id") or f"msg_{datetime.utcnow().timestamp()}",
            "company_id": data["company_id"],
            "user_id": data["user_id"],
            "user_name": data.get("user_name", "Employee"),
            "question": data["question"],
            "answer": data["answer"],
            "sources": data.get("sources", []),
            "created_at": data.get("created_at") or datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.chat_messages.insert_one(msg)
        else:
            self._local_memory["chat_messages"].append(msg)
        return msg

    def get_chat_history(self, company_id: str, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {"company_id": company_id}
        if user_id:
            query["user_id"] = user_id
        if self.is_connected():
            msgs = list(self.db.chat_messages.find(query, {"_id": 0}).sort("created_at", pymongo.ASCENDING).limit(limit))
            return msgs
        filtered = [m for m in self._local_memory["chat_messages"] if m.get("company_id") == company_id]
        if user_id:
            filtered = [m for m in filtered if m.get("user_id") == user_id]
        return filtered[-limit:]

    # ================= CLEAR ALL / RESET =================
    def clear_all(self):
        """Clear collections for testing or complete reset."""
        if self.is_connected():
            self.db.users.delete_many({})
            self.db.companies.delete_many({})
            self.db.documents.delete_many({})
            self.db.chat_messages.delete_many({})
        self._local_memory = {
            "users": [],
            "companies": [],
            "documents": [],
            "chat_messages": []
        }

db_service = DatabaseService()
