"""Database and Vector Store Seeding Service for Demo"""
import logging
from app.models import UserRole
from app.services.db_service import db_service
from app.services.auth_service import get_password_hash
from app.services.document_processor import document_processor

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "Demo1234!"

COMPANIES_DATA = [
    {"id": "comp_apex", "name": "Apex Corp", "industry": "Financial Services & Investment", "invite_code": "APEX-2026"},
    {"id": "comp_nexus", "name": "Nexus Tech", "industry": "Enterprise AI & Cloud Infrastructure", "invite_code": "NEXUS-2026"},
    {"id": "comp_global", "name": "Global Logistics", "industry": "Supply Chain & Shipping", "invite_code": "GLOBAL-2026"},
    {"id": "comp_polca", "name": "Polca Confections", "industry": "Artisanal Sweets & Confectionery", "invite_code": "POLCA-2026"}
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

    # Polca Confections (Company D)
    {"id": "user_polca_hr", "name": "Polcasan (HR Lead)", "email": "polcasan@gmail.com", "company_id": "comp_polca", "role": UserRole.HR.value},
    {"id": "user_polca_emp", "name": "Maya Sen (Operations Associate)", "email": "employee.polca@demo.com", "company_id": "comp_polca", "role": UserRole.EMPLOYEE.value},
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
    },
    {
        "company_id": "comp_polca",
        "doc_id": "doc_polca_policy",
        "filename": "Polca Confections - Employee Handbook & Safety Standards 2026.txt",
        "uploaded_by": "polcasan@gmail.com",
        "content": """POLCA CONFECTIONS - EMPLOYEE HANDBOOK & SAFETY STANDARDS (2026)

1. ANNUAL LEAVE & PAID TIME OFF
Polca Confections provides 22 days of paid annual vacation leave per calendar year. Employees also receive 12 fully paid sick and wellness days.

2. WORK SHIFTS & OVERTIME
Production and fulfillment shifts operate as:
- Morning Shift: 7:00 AM - 3:30 PM
- Afternoon Shift: 3:00 PM - 11:30 PM
All hours worked beyond 40 hours per week are paid at 1.5x regular base pay rate.

3. HEALTHCARE & WORKPLACE SAFETY
100% employer-covered health and dental insurance including mandatory food safety sanitization screenings and quarterly dental checkups.

4. PRODUCT DISCOUNT & PERKS
Full-time staff receive a 40% discount on all artisan confections, sweets, and gift sets, plus a $100 monthly sweet voucher."""
    }
]

def seed_database_and_vectors(db=None):
    """Seed initial companies, users, and policy documents into MongoDB."""
    logger.info(" Checking database seed data...")

    # 1. Seed Companies
    for comp in COMPANIES_DATA:
        existing = db_service.get_company_by_id(comp["id"])
        if not existing:
            db_service.create_company(comp)
            logger.info(f" Seeded company: {comp['name']}")

    # 2. Seed Users & Ensure Universal Password
    hashed_pwd = get_password_hash(DEMO_PASSWORD)
    for u in USERS_DATA:
        user_data = dict(u)
        user_data["password_hash"] = hashed_pwd
        db_service.create_user(user_data)
        logger.info(f" Seeded user: {u['email']} [{u['role']}]")

    # 3. Seed Documents (Metadata into MongoDB; vectors already exist in Qdrant)
    for doc_data in DEMO_DOCUMENTS:
        existing_doc = db_service.get_document_by_id(doc_data["doc_id"])
        if not existing_doc:
            content = doc_data["content"]
            chunks = document_processor.chunk_text(content)

            # Store in MongoDB without invoking heavy embedding models during startup
            new_doc = {
                "id": doc_data["doc_id"],
                "company_id": doc_data["company_id"],
                "uploaded_by": doc_data["uploaded_by"],
                "filename": doc_data["filename"],
                "file_type": "txt",
                "file_size": len(content.encode("utf-8")),
                "chunk_count": len(chunks),
                "status": "PROCESSED"
            }
            db_service.create_document(new_doc)
            logger.info(f" Seeded document: {doc_data['filename']} ({len(chunks)} chunks)")

    # 4. Seed Employee AI Conversation History
    DEMO_CHATS = [
        {
            "id": "chat_apex_1",
            "company_id": "comp_apex",
            "user_id": "user_apex_emp",
            "user_name": "Rahul Verma",
            "question": "How many days of paid annual leave do I have per year?",
            "answer": "At Apex Corp, you are entitled to 20 days of paid annual leave per calendar year. Leave accrues at a rate of 1.67 days per month. A maximum of 5 unused days can be carried over into the following year, expiring March 31st.",
            "sources": ["Apex Corp - Employee Leave & Benefits Policy 2026.txt"]
        },
        {
            "id": "chat_apex_2",
            "company_id": "comp_apex",
            "user_id": "user_apex_emp",
            "user_name": "Rahul Verma",
            "question": "What is our medical insurance coverage under Apex Care?",
            "answer": "Apex Care covers 80% of eligible medical, dental, and prescription expenses up to an annual maximum of $5,000 per employee. Family coverage is available with a 30% employee copay.",
            "sources": ["Apex Corp - Employee Leave & Benefits Policy 2026.txt"]
        },
        {
            "id": "chat_nexus_1",
            "company_id": "comp_nexus",
            "user_id": "user_nexus_emp",
            "user_name": "Meera Tiwari",
            "question": "What is the policy on annual leave rollover?",
            "answer": "At Nexus Tech, you receive 30 days of paid leave per year. You can roll over up to 10 unused leave days into the next calendar year with zero expiration deadline.",
            "sources": ["Nexus Tech - Global Benefits & Remote Culture Guide 2026.txt"]
        },
        {
            "id": "chat_nexus_2",
            "company_id": "comp_nexus",
            "user_id": "user_nexus_emp",
            "user_name": "Meera Tiwari",
            "question": "What equipment stipend do we receive for home office?",
            "answer": "Every new employee receives a $1,200 annual home-office stipend for monitors, ergonomic seating, or co-working space subscriptions as part of our remote-first culture.",
            "sources": ["Nexus Tech - Global Benefits & Remote Culture Guide 2026.txt"]
        },
        {
            "id": "chat_polca_1",
            "company_id": "comp_polca",
            "user_id": "user_polca_emp",
            "user_name": "Maya Sen",
            "question": "What are the confectionery production shifts and holiday schedule?",
            "answer": "Polca production operates on two shifts: Morning (7:00 AM - 3:30 PM) and Afternoon (3:00 PM - 11:30 PM). Employees receive 22 paid annual leave days and full safety gear allowances.",
            "sources": ["Polca Confections - Employee Handbook & Safety Standards 2026.txt"]
        }
    ]

    for chat in DEMO_CHATS:
        db_service.save_chat_message(chat)

    logger.info(" Seed verification complete.")
