"""Database Connection and Session Management"""
import os
import logging
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _normalize_postgres_url(url: str) -> str:
    """Ensure SSL mode is applied properly for Supabase cloud PostgreSQL."""
    if not url:
        return url
    parsed = urlparse(url)
    if parsed.scheme not in {'postgresql', 'postgresql+psycopg2'}:
        return url
    if 'supabase.co' in parsed.netloc.lower():
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        query['sslmode'] = 'require'
        parsed = parsed._replace(query=urlencode(query))
        return urlunparse(parsed)
    return url

def get_engine():
    """Create SQLAlchemy engine with automatic fallback to SQLite."""
    primary_url = _normalize_postgres_url(settings.DATABASE_URL)
    sqlite_url = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'hr_platform.db')}"
    
    # Try PostgreSQL if configured
    if primary_url and primary_url.startswith("postgresql"):
        try:
            parsed = urlparse(primary_url)
            host = parsed.hostname
            port = parsed.port or 5432
            
            # Quick 1.5s probe to check if host and port are actually reachable
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1.5)
            sock.connect((host, port))
            sock.close()

            logger.info("Connecting to PostgreSQL database...")
            connect_args = {"connect_timeout": 3}
            if "sslmode=require" in primary_url:
                connect_args["sslmode"] = "require"
            
            eng = create_engine(
                primary_url,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_recycle=3600
            )
            with eng.connect() as conn:
                pass
            logger.info(" Connected to PostgreSQL successfully.")
            return eng
        except Exception as e:
            logger.warning(f"  PostgreSQL unavailable ({e}). Using local SQLite.")
            
    logger.info(f" Using SQLite database: {sqlite_url}")
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    logger.info(" Database tables verified/created.")

def get_db():
    """Dependency for yielding DB sessions."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
