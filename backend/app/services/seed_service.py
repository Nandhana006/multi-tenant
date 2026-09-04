"""Database and Vector Store Seeding Service for Demo"""
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Company, User, Document, UserRole
from app.services.auth_service import get_password_hash
from app.services.document_processor import document_processor
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "Demo1234!"

COMPANIES_DATA = [
    {"id": "comp_apex", "name": "Apex Corp", "industry": "Financial Services & Investment", "invite_code": "APEX-2026"},
    {"id": "comp_nexus", "name": "Nexus Tech", "industry": "Enterprise AI & Cloud Infrastructure", "invite_code": "NEXUS-2026"},
    {"id": "comp_global", "name": "Global Logistics", "industry": "Supply Chain & Shipping", "invite_code": "GLOBAL-2026"}
]

USERS_DATA = [
    # Super Admin
    {"id": "user_admin", "name": "Arjun Mehta (Platform Admin)", "email": "admin@platform.com", "company_id": None, "role": UserRole.SUPER_ADMIN.value},
    
    # Apex Corp (Company A)
    {"id": "user_apex_hr", "name": "Priya Sharma (HR Lead)", "email": "hr.a@demo.com", "company_id": "comp_apex", "role": UserRole.HR.value},
    {"id": "user_apex_emp", "name": "Rahul Verma (Financial Analyst)", "email": "employee.a@demo.com", "company_id": "comp_apex", "role": UserRole.EMPLOYEE.value},
    
    # Nexus Tech (Company B)
    {"id": "user_nexus_hr", "name": "Nandhana Menon (VP People)", "email": "hr.b@demo.com", "company_id": "comp_nexus", "role": UserRole.HR.value},
    {"id": "user_nexus_emp", "name": "Meera Tiwari (Senior Engineer)", "email": "employee.b@demo.com", "company_id": "comp_nexus", "role": UserRole.EMPLOYEE.value},

    # Global Logistics (Company C)
    {"id": "user_global_hr", "name": "Ananya Iyer (HR Director)", "email": "hr.c@demo.com", "company_id": "comp_global", "role": UserRole.HR.value},
    {"id": "user_global_emp", "name": "Rohan Gupta (Operations Manager)", "email": "employee.c@demo.com", "company_id": "comp_global", "role": UserRole.EMPLOYEE.value},
]

DEMO_DOCUMENTS = [
    {
        "company_id": "comp_apex",
        "doc_id": "doc_apex_leave_policy",
        "filename": "Apex Corp - Employee Leave & Benefits Policy 2026.txt",
        "uploaded_by": "hr.a@demo.com",
        "content": """APEX CORP - EMPLOYEE HANDBOOK & LEAVE POLICY (2026)

1. ANNUAL LEAVE ENTITLEMENT
Employees at Apex Corp are entitled to 20 days of paid annual leave per calendar year. 
Leave accrues at a rate of 1.67 days per full month of active employment. 
A maximum of 5 unused annual leave days may be rolled over into the following calendar year, expiring on March 31st.

2. SICK & MEDICAL LEAVE
Apex Corp provides 10 days of paid sick leave per year. 
If an absence exceeds three (3) consecutive working days, a formal medical certificate signed by a licensed physician must be submitted to HR.

3. HEALTH & DENTAL INSURANCE
Our 'Apex Care' plan covers 80% of eligible medical, dental, and prescription expenses up to an annual maximum of $5,000 per employee. Family coverage is available with a 30% employee copay.

4. WORKPLACE ARRANGEMENTS & HYBRID POLICY
Apex Corp operates on a hybrid schedule. Employees are permitted to work remotely for up to two (2) days per week, subject to direct manager approval. Core office hours are 9:00 AM to 5:00 PM EST.

5. MATERNITY & PATERNITY LEAVE
Mothers receive 12 weeks of fully paid maternity leave. Spouses and partners receive 4 weeks of paid paternity leave."""
    },
    {
        "company_id": "comp_nexus",
        "doc_id": "doc_nexus_leave_policy",
        "filename": "Nexus Tech - Global Benefits & Remote Culture Guide 2026.txt",
        "uploaded_by": "hr.b@demo.com",
        "content": """NEXUS TECH - COMPREHENSIVE BENEFITS & WORKPLACE POLICY (2026)

1. ANNUAL LEAVE & VACATION POLICY
Nexus Tech offers 30 days of fully paid annual leave per year for all full-time team members. 
Employees can roll over up to 10 unused leave days into the next calendar year with zero expiration deadline.

2. WELLNESS & SICK LEAVE
We offer 15 days of fully paid wellness and sick leave each year. 
No medical notes or doctor certificates are required for sick leaves under five (5) consecutive business days. Mental health days are fully covered under this policy.

3. HEALTHCARE & WELLBEING (NEXUS HEALTH ELITE)
Nexus Tech covers 100% of comprehensive medical, dental, optical, and mental health therapy premiums through 'Nexus Health Elite'. There are zero deductibles for in-network medical visits.

4. REMOTE-FIRST WORK CULTURE & EQUIPMENT ALLOWANCE
Nexus Tech is 100% Remote-First. Work from anywhere in your designated timezone. 
Every new employee receives a $1,200 annual home-office stipend for monitors, ergonomic seating, or co-working space subscriptions.

5. PARENTAL LEAVE
Nexus Tech provides 18 weeks of 100% paid parental leave for all new parents (birth, adoption, or surrogacy)."""
    }
]

def seed_database_and_vectors(db: Session):
    """Seed initial companies, users, and policy documents."""
    logger.info(" Checking database seed data...")

    # 1. Seed Companies
    for comp in COMPANIES_DATA:
        existing = db.query(Company).filter(Company.id == comp["id"]).first()
        if not existing:
            new_comp = Company(
                id=comp["id"],
                name=comp["name"],
                industry=comp["industry"],
                invite_code=comp.get("invite_code")
            )
            db.add(new_comp)
            logger.info(f" Seeded company: {comp['name']}")
        else:
            if not existing.invite_code and comp.get("invite_code"):
                existing.invite_code = comp.get("invite_code")
    db.commit()

    # 2. Seed Users & Update Names to Indian Personas
    hashed_pwd = get_password_hash(DEMO_PASSWORD)
    for u in USERS_DATA:
        existing_user = db.query(User).filter(User.email == u["email"]).first()
        if not existing_user:
            new_user = User(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                password_hash=hashed_pwd,
                company_id=u["company_id"],
                role=u["role"]
            )
            db.add(new_user)
            logger.info(f" Seeded user: {u['email']} [{u['role']}]")
        else:
            # Update name if previously seeded with old names
            if existing_user.name != u["name"]:
                existing_user.name = u["name"]
                logger.info(f" Updated user name to Indian persona: {u['name']}")
    db.commit()

    # 3. Seed Documents & Vectors
    for doc_data in DEMO_DOCUMENTS:
        existing_doc = db.query(Document).filter(Document.id == doc_data["doc_id"]).first()
        if not existing_doc:
            content = doc_data["content"]
            chunks = document_processor.chunk_text(content)
            embeddings = embedding_service.embed_texts(chunks)

            # Store in DB
            new_doc = Document(
                id=doc_data["doc_id"],
                company_id=doc_data["company_id"],
                uploaded_by=doc_data["uploaded_by"],
                filename=doc_data["filename"],
                file_type="txt",
                file_size=len(content.encode("utf-8")),
                chunk_count=len(chunks),
                status="PROCESSED"
            )
            db.add(new_doc)
            db.commit()

            # Store in Qdrant
            vector_store.upsert_chunks(
                company_id=doc_data["company_id"],
                document_id=doc_data["doc_id"],
                document_name=doc_data["filename"],
                uploaded_by=doc_data["uploaded_by"],
                chunks=chunks,
                embeddings=embeddings
            )
            logger.info(f" Seeded document & {len(chunks)} vectors: {doc_data['filename']}")

    logger.info(" Seed verification complete.")
