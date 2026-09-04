"""
Comprehensive Seeding Script:
1. Adds 20+ employees to every company in the platform with realistic corporate profiles.
2. Ensures all companies have their policy guides vectorized in Qdrant with company_id isolation.
3. Generates realistic, policy-grounded chat conversation histories for employees across all companies.
4. Syncs auth logs and chat history into MongoDB Atlas.
"""
import sys
import os
import uuid
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import Company, User, Document, ChatMessage, UserRole
from app.services.auth_service import get_password_hash
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.document_processor import document_processor
from app.services.mongo_service import mongo_service

# 1. POLICIES FOR COMPANIES
COMPANY_DOCUMENTS = {
    "comp_global": {
        "filename": "Global_Logistics_Operations_and_Field_Policy_2026.txt",
        "title": "Global Logistics Operations & Field Staff Policy Handbook",
        "content": """GLOBAL LOGISTICS - EMPLOYEE POLICY & OPERATIONS HANDBOOK (2026)

1. ANNUAL LEAVE & SHIFT TIME OFF
- Full-time logistics and warehouse personnel receive 22 Paid Time Off (PTO) days per calendar year.
- Shift differential: Operational staff working overnight or weekend shifts receive an additional 3 floating personal days.
- Overtime: 1.5x regular pay rate for all hours beyond 40 hours in a standard workweek.

2. HEALTH, SAFETY & PPE PROVISIONS
- All warehouse and field personnel are provided with high-visibility jackets, steel-toe boot reimbursement of $250 annually, and safety helmets.
- Mandatory safety briefing is held at the start of every shift.

3. BENEFITS & HEALTHCARE
- 85% employer-paid health coverage through Blue Cross Blue Shield Logistics Care network.
- 401(k) company match up to 4.5% of annual compensation, immediately vested.
- $1,500 annual tuition and logistics CDL / forklift license certification stipend.

4. SICK LEAVE & ATTENDANCE
- 8 paid sick days annually. Absences of more than 2 consecutive days require a physician's release to resume operations.
"""
    },
    "comp_apps": {
        "filename": "APPS_Engineering_and_Agile_Culture_Guide_2026.txt",
        "title": "APPS Engineering Workplace & Benefits Guide",
        "content": """APPS - ENGINEERING CULTURE & TEAM BENEFITS HANDBOOK (2026)

1. FLEXIBLE WORKING & REMOTE OPTIONS
- APPS operates as a hybrid software company. Core collaboration hours are 10:00 AM to 3:00 PM local time.
- Engineers and product managers can work up to 3 days remotely per week.
- Home office tech grant: $800 one-time reimbursement for standing desks, monitors, and ergonomic gear.

2. LEAVE & VACATION
- 25 Paid Vacation Days annually with flexible carry-over of up to 7 days into Q1.
- 12 weeks of 100% paid parental leave for all primary and secondary caregivers.
- 10 paid wellness and mental health recovery days.

3. HEALTHCARE & WELLBEING
- Premium medical and dental insurance with 90% company contribution.
- $100/month fitness and gym membership reimbursement.
- $2,500 annual engineering learning and conference allowance (AWS, Google Cloud, PyCon).
"""
    },
    "comp_datalab": {
        "filename": "DATALAB_Research_and_Staff_Policy_2026.txt",
        "title": "DATALAB AI & Research Operations Guide",
        "content": """DATALAB - RESEARCH STAFF HANDBOOK & BENEFITS GUIDE (2026)

1. RESEARCH ENVIRONMENT & INTELLECTUAL PROPERTY
- DATALAB provides GPU cluster credits and workstation allowances for research staff and data scientists.
- Inventions and patents produced during work hours remain company property with inventor recognition bonuses of $5,000 per granted patent.

2. TIME OFF & SABBATICALS
- 28 Paid Vacation Days annually.
- Sabbatical program: After 4 years of continuous service, research leads are eligible for a 4-week paid academic sabbatical.
- 14 days of paid medical and family care leave.

3. COMPENSATION & 401(k)
- Annual merit review conducted in November with market benchmarking.
- 6% company match on 401(k) retirement contributions with immediate vesting.
- $3,000 annual budget for attending academic conferences (NeurIPS, ICML, CVPR).
"""
    }
}

# 2. 25 REALISTIC EMPLOYEE PROFILES TO DRAW FROM
EMPLOYEE_TEMPLATES = [
    ("Aarav Mehta", "Senior Frontend Engineer"),
    ("Sneha Patel", "Product Marketing Lead"),
    ("Vikram Singh", "Cloud Infrastructure Architect"),
    ("Ananya Roy", "People Operations Specialist"),
    ("Kavita Nair", "Corporate Legal Counsel"),
    ("Rohan Deshmukh", "Financial Planning & Analysis Lead"),
    ("Deepika Iyer", "DevOps & SRE Engineer"),
    ("Aditya Kulkarni", "Client Solutions Director"),
    ("Pooja Hegde", "Talent Acquisition Manager"),
    ("Manish Tiwari", "Operations & Logistics Associate"),
    ("Sunita Reddy", "Data Platform Engineer"),
    ("Amitabh Sen", "Security & Compliance Auditor"),
    ("Meera Nambiar", "UI/UX Design Systems Lead"),
    ("Harish Bhatt", "Backend Systems Engineer"),
    ("Divya Joshi", "Enterprise Customer Success Manager"),
    ("Siddharth Ghosh", "Quantitative Business Analyst"),
    ("Swati Saxena", "Technical Writer & Documentation Specialist"),
    ("Karan Malhotra", "Product Operations Manager"),
    ("Neha Kapoor", "Payroll & Compensation Analyst"),
    ("Varun Pillai", "Full Stack Software Developer"),
    ("Tanvi Chauhan", "Engineering Manager"),
    ("Gaurav Bansal", "Systems Integration Specialist")
]

SAMPLE_QUESTIONS_ANSWERS = [
    {
        "q": "How many annual leave days do I get and how does it work?",
        "a_templates": {
            "comp_apex": "According to the **Apex Corp Benefits & Leave Guide**, full-time employees receive **20 Paid Time Off (PTO) days** per year, accrued at 1.67 days per month. You can roll over up to 5 unused days into Q1 of the following year.",
            "comp_nexus": "Under the **Nexus Tech Remote-First Culture Guide**, you receive **30 Paid Vacation Days** annually with zero expiration. Up to 10 unused days can be rolled over or cashed out in December.",
            "comp_global": "According to the **Global Logistics Operations Handbook**, full-time staff receive **22 Paid Time Off (PTO) days** per calendar year, plus 3 floating personal days for overnight/weekend shifts.",
            "comp_apps": "According to the **APPS Engineering Culture Guide**, you are entitled to **25 Paid Vacation Days** annually, with carry-over of up to 7 days into Q1.",
            "comp_datalab": "Under the **DATALAB Research Staff Handbook**, full-time research staff receive **28 Paid Vacation Days** per year, plus eligibility for a 4-week paid sabbatical after 4 years.",
            "comp_apex_crop": "According to Section 14 (Leave & Time-Off Policy) in the **Employee & Corporate Policy Handbook**, Paid Time Off (PTO) is accrued per pay period and increases with tenure. Balances are managed through the HR system."
        }
    },
    {
        "q": "What is the policy for home office setup and equipment reimbursement?",
        "a_templates": {
            "comp_apex": "Under Section 2 of the **Apex Corp Remote Work Policy**, all full-time hires receive a **$1,000 one-time Home Office Grant** for desks, chairs, monitors, and accessories, plus a **$80/month connectivity stipend**.",
            "comp_nexus": "According to the **Nexus Tech Workspace Guide**, you receive a **$1,500 one-time Home Office Grant**, a **$500 annual equipment refresh stipend**, and a **$120 monthly internet and mobile subsidy**.",
            "comp_global": "Per the **Global Logistics Operations Handbook**, field and warehouse personnel receive a **$250 annual steel-toe boot reimbursement** and all company PPE provided at no charge.",
            "comp_apps": "According to the **APPS Engineering Guide**, employees can claim a **$800 one-time home office grant** for ergonomic workstation equipment, plus a **$100/month wellness allowance**.",
            "comp_datalab": "Under the **DATALAB Policy**, staff receive GPU cluster credits and hardware workstation grants to support high-performance data science research.",
            "comp_apex_crop": "Per Section 10 of the **Employee & Corporate Policy Handbook**, approved remote/hybrid workers are provided company-issued managed devices and ergonomic assessments upon request."
        }
    },
    {
        "q": "How does parental leave work for new parents?",
        "a_templates": {
            "comp_apex": "According to Section 3 of the **Apex Corp Leave Handbook**, primary caregivers receive **16 weeks of 100% fully paid leave**, and secondary caregivers receive **12 weeks of 100% fully paid leave**.",
            "comp_nexus": "Per the **Nexus Tech Benefits Guide**, we provide **20 weeks of 100% fully paid parental leave** for all new parents (birthing, non-birthing, adoption, and surrogacy).",
            "comp_global": "Under the **Global Logistics Policy**, parental leave is provided consistent with applicable regional family leave laws with job protection and benefits continuation.",
            "comp_apps": "According to the **APPS Benefits Handbook**, employees receive **12 weeks of 100% paid parental leave** for both primary and secondary caregivers.",
            "comp_datalab": "Under the **DATALAB Research Handbook**, new parents receive **14 weeks of paid family leave** with full benefits continuation.",
            "comp_apex_crop": "According to Section 14 of the **Employee & Corporate Policy Handbook**, paid parental leave is available for the birth, adoption, or foster placement of a child for primary and secondary caregivers."
        }
    },
    {
        "q": "What is our 401(k) company match and retirement plan?",
        "a_templates": {
            "comp_apex": "Under Section 6 of the **Apex Corp Benefits Guide**, Apex matches **100% of employee 401(k) contributions up to 5%** of base annual salary, with immediate 100% vesting.",
            "comp_nexus": "According to the **Nexus Tech Guide**, Nexus matches **100% of contributions up to 6% of base salary**, vesting immediately on day one.",
            "comp_global": "Per the **Global Logistics Handbook**, the company provides a **4.5% 401(k) retirement match**, immediately vested with zero cliff.",
            "comp_apps": "Under the **APPS Guide**, we provide a 401(k) plan with a **5% company match** and comprehensive retirement financial advisory.",
            "comp_datalab": "According to the **DATALAB Handbook**, the retirement plan features a **6% company match** with immediate vesting and advisory support.",
            "comp_apex_crop": "Per Section 13 of the **Employee & Corporate Policy Handbook**, the company provides a tax-advantaged retirement savings plan (401k) with company matching contributions."
        }
    }
]

def seed():
    db = SessionLocal()
    default_hash = get_password_hash("Demo1234!")

    print("--- 1. Indexing Missing Company Policy Documents into Qdrant ---")
    companies = db.query(Company).all()
    
    for comp in companies:
        if comp.id in COMPANY_DOCUMENTS:
            doc_info = COMPANY_DOCUMENTS[comp.id]
            existing_doc = db.query(Document).filter(
                Document.company_id == comp.id,
                Document.filename == doc_info["filename"]
            ).first()

            if not existing_doc:
                print(f"Indexing policy document for {comp.name} ({comp.id})...")
                chunks = document_processor.chunk_text(doc_info["content"])
                embeddings = embedding_service.embed_texts(chunks)
                doc_id = f"doc_{uuid.uuid4().hex[:10]}"

                vector_store.upsert_chunks(
                    company_id=comp.id,
                    document_id=doc_id,
                    document_name=doc_info["filename"],
                    uploaded_by=f"hr@{comp.id}.com",
                    chunks=chunks,
                    embeddings=embeddings
                )

                db_doc = Document(
                    id=doc_id,
                    company_id=comp.id,
                    uploaded_by=f"hr@{comp.id}.com",
                    filename=doc_info["filename"],
                    file_type="txt",
                    file_size=len(doc_info["content"].encode("utf-8")),
                    chunk_count=len(chunks),
                    status="PROCESSED"
                )
                db.add(db_doc)
                db.commit()
                print(f" Saved document '{doc_info['filename']}' ({len(chunks)} chunks).")

    print("\n--- 2. Expanding Employee Rosters (At least 20 per company) ---")
    for comp in companies:
        current_users = db.query(User).filter(User.company_id == comp.id).all()
        current_count = len(current_users)
        needed = max(0, 20 - current_count)

        domain = comp.name.lower().replace(" ", "").replace("_", "") + ".com"
        print(f"Company: {comp.name} (Current staff: {current_count}, Adding: {needed})")

        created_this_comp = []
        for i in range(needed):
            tmpl_name, tmpl_title = EMPLOYEE_TEMPLATES[i % len(EMPLOYEE_TEMPLATES)]
            first_name = tmpl_name.split()[0].lower()
            last_name = tmpl_name.split()[1].lower()
            emp_email = f"{first_name}.{last_name}{i+1}@{domain}"

            # Check if email exists
            if db.query(User).filter(User.email == emp_email).first():
                emp_email = f"{first_name}.{last_name}_{uuid.uuid4().hex[:4]}@{domain}"

            days_ago = random.randint(30, 750)
            join_date = datetime.utcnow() - timedelta(days=days_ago)

            user_id = f"usr_{uuid.uuid4().hex[:10]}"
            new_emp = User(
                id=user_id,
                name=f"{tmpl_name} ({tmpl_title})",
                email=emp_email,
                password_hash=default_hash,
                company_id=comp.id,
                role=UserRole.EMPLOYEE.value,
                created_at=join_date
            )
            db.add(new_emp)
            created_this_comp.append(new_emp)

            # Log to MongoDB auth_logs
            mongo_service.log_auth_event(
                user_id=user_id,
                email=emp_email,
                name=tmpl_name,
                role="EMPLOYEE",
                company_id=comp.id,
                company_name=comp.name,
                event_type="REGISTER",
                details={"title": tmpl_title}
            )

        db.commit()

        # Add recent SIGN_IN events to MongoDB for realism
        for emp in created_this_comp[:5]:
            mongo_service.log_auth_event(
                user_id=emp.id,
                email=emp.email,
                name=emp.name,
                role="EMPLOYEE",
                company_id=comp.id,
                company_name=comp.name,
                event_type="SIGN_IN"
            )

    print("\n--- 3. Generating Realistic Chat History for Employees ---")
    all_users = db.query(User).filter(User.role == UserRole.EMPLOYEE.value).all()
    
    chat_created = 0
    for user in all_users:
        # Check existing chat count for this user
        user_chats = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).count()
        if user_chats >= 2:
            continue

        # Pick 2-3 sample queries
        selected_samples = random.sample(SAMPLE_QUESTIONS_ANSWERS, k=2)
        comp_id = user.company_id

        for s in selected_samples:
            q_text = s["q"]
            a_text = s["a_templates"].get(comp_id, s["a_templates"].get("comp_apex_crop", "According to company policy, please check the HR portal."))
            
            hours_ago = random.randint(1, 140)
            msg_time = datetime.utcnow() - timedelta(hours=hours_ago)

            doc_source = db.query(Document).filter(Document.company_id == comp_id).first()
            source_payload = [
                {
                    "document_id": doc_source.id if doc_source else "doc_policy",
                    "document_name": doc_source.filename if doc_source else "Company Policy Handbook",
                    "chunk_id": f"{doc_source.id if doc_source else 'doc'}_chk_1",
                    "snippet": a_text[:180] + "...",
                    "score": round(random.uniform(0.75, 0.92), 4)
                }
            ]

            msg_id = f"msg_{uuid.uuid4().hex[:10]}"
            chat_msg = ChatMessage(
                id=msg_id,
                company_id=comp_id,
                user_id=user.id,
                user_name=user.name,
                question=q_text,
                answer=a_text,
                sources=source_payload,
                created_at=msg_time
            )
            db.add(chat_msg)
            chat_created += 1

            # Sync to MongoDB chat_conversations
            mongo_service.log_chat_conversation(
                company_id=comp_id,
                company_name=user.company.name if user.company else "Company",
                user_id=user.id,
                user_name=user.name,
                user_email=user.email,
                question=q_text,
                answer=a_text,
                sources=source_payload,
                grounded=True
            )

    db.commit()
    db.close()
    print(f" Created {chat_created} realistic chat interactions across company employees.")
    print(" Complete multi-tenant employee and chat history expansion finished successfully!")

if __name__ == "__main__":
    seed()
