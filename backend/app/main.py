"""FastAPI Application Main Entrypoint"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.services.seed_service import seed_database_and_vectors
from app.api import auth, companies, documents, chat, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hr_platform")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed demo data
    logger.info(" Initializing Multi-Tenant HR Platform backend...")
    init_db()
    
    db = SessionLocal()
    try:
        seed_database_and_vectors(db)
    except Exception as e:
        logger.error(f" Error during database seed: {e}")
    finally:
        db.close()
        
    logger.info(" HR Platform backend initialized and ready.")
    yield
    logger.info(" Shutting down HR Platform backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Company AI HR Chatbot Platform with Strict Qdrant Vector Data Isolation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes with /api prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(companies.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# Also mount routes without /api prefix for maximum deployment resilience
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(admin.router)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0",
        "multi_tenant_isolation": "ENFORCED"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {
        "status": "healthy",
        "qdrant_collection": settings.QDRANT_COLLECTION_NAME,
        "embedding_model": settings.EMBEDDING_MODEL_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
