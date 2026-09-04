"""MongoDB Atlas Integration Service for Audit Logs and Conversation History"""
import logging
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional
import certifi
import pymongo
from pymongo import MongoClient
from app.config import settings

logger = logging.getLogger(__name__)

class MongoService:
    def __init__(self):
        self.uri = settings.MONGO_URI
        self.db_name = settings.MONGO_DB or "hr_platform_db"
        self.client: Optional[MongoClient] = None
        self.db = None
        self._connected = False
        self._init_connection()

    def _init_connection(self):
        if not self.uri:
            logger.warning(" No MONGO_URI provided. MongoDB logging will run in offline fallback mode.")
            return

        def _connect():
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
                # Test connection
                self.client.admin.command("ping")
                self._connected = True
                logger.info(f" Successfully connected to MongoDB Atlas database: '{self.db_name}'")
                
                # Ensure indexes
                self.db.auth_logs.create_index([("company_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])
                self.db.chat_conversations.create_index([("company_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])
            except Exception as e:
                logger.warning(f" MongoDB Atlas background connection notice: {e} (App will continue running with graceful local fallback until IP whitelist is active)")
                self._connected = False

        # Run connection in background thread to avoid blocking application startup
        thread = threading.Thread(target=_connect, daemon=True)
        thread.start()

    def is_connected(self) -> bool:
        return self._connected and self.db is not None

    def log_auth_event(
        self,
        user_id: str,
        email: str,
        name: str,
        role: str,
        company_id: Optional[str],
        company_name: Optional[str],
        event_type: str,  # "SIGN_IN", "SIGN_OUT", "REGISTER"
        ip_address: Optional[str] = "127.0.0.1",
        user_agent: Optional[str] = "Web Browser",
        details: Optional[Dict[str, Any]] = None
    ):
        """Asynchronously log auth sign-in / sign-out / register events into MongoDB."""
        def _async_log():
            try:
                if self.is_connected():
                    doc = {
                        "user_id": user_id,
                        "email": email,
                        "name": name,
                        "role": role,
                        "company_id": company_id,
                        "company_name": company_name,
                        "event_type": event_type,
                        "ip_address": ip_address,
                        "user_agent": user_agent,
                        "timestamp": datetime.utcnow().isoformat(),
                        "details": details or {}
                    }
                    self.db.auth_logs.insert_one(doc)
                    logger.info(f" [MongoDB] Logged auth event '{event_type}' for {email}")
            except Exception as e:
                logger.debug(f" MongoDB auth log skipped: {e}")

        threading.Thread(target=_async_log, daemon=True).start()

    def log_chat_conversation(
        self,
        company_id: str,
        company_name: str,
        user_id: str,
        user_name: str,
        user_email: str,
        question: str,
        answer: str,
        sources: List[Dict[str, Any]],
        grounded: bool = True
    ):
        """Asynchronously log full chat interactions and citations to MongoDB."""
        def _async_log():
            try:
                if self.is_connected():
                    doc = {
                        "company_id": company_id,
                        "company_name": company_name,
                        "user_id": user_id,
                        "user_name": user_name,
                        "user_email": user_email,
                        "question": question,
                        "answer": answer,
                        "sources": sources,
                        "grounded": grounded,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    self.db.chat_conversations.insert_one(doc)
                    logger.info(f" [MongoDB] Logged chat question for {user_email} at {company_name}")
            except Exception as e:
                logger.debug(f" MongoDB chat log skipped: {e}")

        threading.Thread(target=_async_log, daemon=True).start()

    def get_company_auth_logs(self, company_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent auth logs (Sign in, Sign out, Register) for a company."""
        if not self.is_connected():
            return []
        try:
            logs = list(
                self.db.auth_logs.find(
                    {"company_id": company_id},
                    {"_id": 0}
                )
                .sort("timestamp", pymongo.DESCENDING)
                .limit(limit)
            )
            return logs
        except Exception as e:
            logger.error(f" Failed to fetch auth logs from MongoDB: {e}")
            return []

    def get_company_chat_history(self, company_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent chat interactions across the company."""
        if not self.is_connected():
            return []
        try:
            chats = list(
                self.db.chat_conversations.find(
                    {"company_id": company_id},
                    {"_id": 0}
                )
                .sort("timestamp", pymongo.DESCENDING)
                .limit(limit)
            )
            return chats
        except Exception as e:
            logger.error(f" Failed to fetch chat logs from MongoDB: {e}")
            return []

mongo_service = MongoService()
