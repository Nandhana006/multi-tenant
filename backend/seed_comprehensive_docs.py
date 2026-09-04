"""
Script to seed comprehensive enterprise HR documents into Qdrant Vector DB & SQLite/Postgres.
Includes Remote Work Stipends, Health Benefits Guides, PTO Policies, and Employee Handbooks.
"""
import uuid
import sys
import os

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models import Company, Document, User
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.document_processor import document_processor

DOCUMENTS_DATA = {
    "comp_apex": [
        {
            "filename": "Apex_Corp_Remote_Work_and_Equipment_Stipend_Policy_2026.txt",
            "content": """APEX CORP - REMOTE WORK, HYBRID CULTURE & EQUIPMENT STIPEND POLICY (2026)

1. HYBRID WORKPLACE FRAMEWORK
Apex Corp operates on an intentional Hybrid Workplace Model designed to blend collaborative in-office teamwork with focused remote execution. Full-time employees are expected to maintain a 3-day in-office and 2-day remote schedule, coordinated within their respective functional teams.

2. HOME OFFICE & ERGONOMIC EQUIPMENT STIPEND
To ensure our team members maintain an ergonomic, high-productivity home working environment, Apex Corp provides the following allowances:
- One-Time Home Office Setup Grant: All new full-time employees are eligible for a $1,000 one-time reimbursement upon joining. This stipend covers ergonomic chairs, motorized standing desks, dual 4K monitors, docking stations, noise-canceling headsets, and supportive lighting.
- Eligibility & Claims: Purchases must be submitted via the HR Expensify portal within 60 days of your start date with valid itemized receipts.
- Asset Ownership: Equipment purchased under the $1,000 home office stipend remains the personal property of the employee upon completion of 12 months of service.

3. MONTHLY CONNECTIVITY & MOBILE REIMBURSEMENT
- Internet & Cellphone Allowance: Apex Corp provides an automated monthly tax-free stipend of $80 per month directly deposited with standard payroll. This covers high-speed home fiber internet and business mobile phone usage.
- No receipts are required for the standard $80 monthly connectivity allowance.

4. CORE COLLABORATION HOURS & TIME ZONES
Remote team members are expected to be available for synchronous collaboration, team standups, and client engagements during core hours of 10:00 AM to 4:00 PM Eastern Standard Time (EST). Flexible working outside of core hours is encouraged.

5. CO-WORKING SPACE PASSES
For employees traveling or needing temporary workspace outside the New York HQ, Apex Corp provides on-demand access to premium co-working spaces via LiquidSpace and WeWork passes. Contact benefits@apex.demo for booking reservations.
"""
        },
        {
            "filename": "Apex_Corp_Comprehensive_Benefits_and_Leave_Guide_2026.txt",
            "content": """APEX CORP - COMPREHENSIVE EMPLOYEE BENEFITS & LEAVE HANDBOOK (2026)

1. ANNUAL PAID TIME OFF (PTO) & VACATION
- Allocation: Full-time employees receive 20 Paid Time Off (PTO) days per calendar year, accrued at a rate of 1.67 days per completed month of service.
- Rollover Policy: Up to 5 unused PTO days can be rolled over into the first quarter (Q1) of the subsequent calendar year. Any remaining rollover days beyond 5 will be cashed out or expire on March 31st.
- Requesting Time Off: PTO requests of 3 consecutive days or more should be submitted via the HR Portal at least 2 weeks in advance.

2. SICK LEAVE & MENTAL HEALTH DAYS
- Employees receive 10 Paid Sick & Wellness Days annually. These days cover physical illness, medical appointments, caregiving for dependent family members, and personal mental wellbeing days.
- Medical certificates are only required for sick leave exceeding 3 consecutive business days.

3. PARENTAL LEAVE & FAMILY CARE
- Maternity & Primary Caregiver Leave: 16 weeks of 100% fully paid leave following the birth, adoption, or foster placement of a child.
- Secondary Caregiver / Paternity Leave: 12 weeks of 100% fully paid leave, which can be taken consecutively or split across the child's first 12 months.

4. HEALTHCARE, DENTAL & VISION INSURANCE
- Medical Plan: 80% employer-subsidized Apex Care Comprehensive Plan through UnitedHealthcare Choice Plus Network. Individual in-network deductible is $250 / year; family deductible is $500 / year.
- Dental & Orthodontics: 100% coverage for bi-annual cleanings, checkups, and routine dental care; 80% coverage for major procedures up to $2,500 annually.
- Vision Care: Annual comprehensive eye exam covered at 100%, plus a $350 annual eyewear and contact lens prescription allowance.

5. MENTAL WELLBEING & COUNSELING (SPRING HEALTH)
- All employees and their dependents receive 12 free, confidential 1-on-1 psychotherapy sessions per year through Spring Health.
- Complimentary premium memberships to Calm and Headspace apps.

6. 401(k) RETIREMENT PLAN & COMPANY MATCHING
- Apex Corp matches 100% of employee 401(k) contributions up to 5% of base annual salary.
- Employer matching contributions vest immediately at 100% with zero cliff.

7. PROFESSIONAL DEVELOPMENT & LEARNING STIPEND
- Apex Corp provides an annual $2,000 Learning & Growth Budget per employee. This budget covers CFA / CPA / MBA certifications, professional memberships, online courses (Coursera, Udemy), technical books, and industry conference registrations.
"""
        }
    ],
    "comp_nexus": [
        {
            "filename": "Nexus_Tech_Remote_First_Culture_and_Workspace_Guide_2026.txt",
            "content": """NEXUS TECH - REMOTE-FIRST CULTURE & WORKSPACE STIPEND FRAMEWORK (2026)

1. 100% REMOTE-FIRST PHILOSOPHY
Nexus Tech is a distributed-first organization with engineers and researchers located globally. We prioritize asynchronous documentation, clear written communication, and autonomous execution.

2. WORKSPACE EQUIPMENT & REFRESH STIPEND
- Initial Home Office Setup Grant: $1,500 one-time grant upon joining to build a high-performance workstation (MacBook Pro/Linux workstation accessories, 4K displays, mechanical keyboards, Herman Miller/ergonomic chairs).
- Annual Equipment Refresh: $500 annual workspace upgrade stipend provided every 12 months.
- Monthly Internet & Mobile Subsidy: $120 monthly stipend deposited automatically with payroll for high-speed fiber internet and unlimited 5G cellular plans.

3. GLOBAL CO-WORKING ACCESS
Every Nexus Tech team member is entitled to a fully subsidized WeWork All-Access Global Pass or monthly reimbursement for a verified local co-working space up to $350/month.

4. ANNUAL LEAVE & FLEXIBLE TIME OFF
- 30 Paid Vacation Days per year with zero expiration. Employees may roll over up to 10 unused days or convert them to a cash bonus at the end of December.
- Unlimited Wellness & Mental Health Days: We operate on a trust-based system for sick and mental health recovery.
- 20 Weeks Fully Paid Parental Leave for all new parents (birthing, non-birthing, adoption, surrogacy).

5. HEALTHCARE & WELLNESS (100% COMPANY PAID)
- Nexus Health Elite: 100% employer-covered health, dental, and vision insurance premiums for employees and 80% coverage for dependents.
- Modern Health Mental Wellness: Unlimited 1-on-1 coaching, 10 therapy sessions per year, and annual wellness retreat sponsorships.
- $3,000 Annual AI Research, Learning & Conference Budget.
"""
        }
    ],
    "comp_global": [
        {
            "filename": "Global_Logistics_Operations_and_Workforce_Policy_2026.txt",
            "content": """GLOBAL LOGISTICS - WORKFORCE POLICY & SHIFT ALLOWANCE GUIDE (2026)

1. SHIFT OPERATIONS & DISPATCH STANDARDS
Global Logistics operates dedicated 24/7 freight, cold chain, and regional terminal dispatch hubs. Shift schedules are posted 14 days in advance with built-in rest periods.

2. SAFETY EQUIPMENT & COMMUTER ALLOWANCES
- Safety Gear & Boot Allowance: $300 annual reimbursement for steel-toe composite safety footwear, high-visibility outerwear, and protective equipment.
- Communication Allowance: $60 monthly mobile subsidy for shift managers and field operations dispatchers.
- Free on-site secured parking provided at all terminal hubs.

3. LEAVE & OVERTIME PROVISIONS
- 22 Paid Vacation Days annually structured across operating shift windows.
- Overtime Rates: 1.5x hourly rate for shifts exceeding 40 hours/week, and 2.0x for scheduled federal holiday shifts.
- 12 Paid Sick Days per year with automatic coverage scheduling.
- 14 Weeks fully paid maternity leave, 8 weeks paid paternity leave.

4. HEALTH & DISABILITY COVERAGE
- Global Standard Health Plus via BlueCross BlueShield Network.
- Specialized hazardous logistics disability and 2x base salary life insurance.
- 401(k) retirement plan with 4% company matching contribution.
"""
        }
    ]
}

def seed_documents():
    init_db()
    db = SessionLocal()

    print("--- Seeding Comprehensive Enterprise HR Documents into Qdrant & DB ---")

    for company_id, doc_list in DOCUMENTS_DATA.items():
        # Ensure company exists in DB
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            print(f"[!] Company {company_id} not found in DB. Skipping.")
            continue

        print(f"\nProcessing documents for {company.name} ({company_id})...")

        for doc_info in doc_list:
            filename = doc_info["filename"]
            raw_text = doc_info["content"]

            # Check if document already exists
            existing_doc = db.query(Document).filter(
                Document.company_id == company_id,
                Document.filename == filename
            ).first()

            doc_id = existing_doc.id if existing_doc else f"doc_{uuid.uuid4().hex[:10]}"

            # Chunk document
            chunks = document_processor.chunk_text(raw_text, chunk_size=400, chunk_overlap=60)
            print(f" -> Generated {len(chunks)} chunks for {filename}")

            # Generate embeddings
            embeddings = embedding_service.embed_texts(chunks)

            # Store in Qdrant with company_id metadata
            vector_store.store_chunks(
                company_id=company_id,
                document_id=doc_id,
                document_name=filename,
                chunks=chunks,
                embeddings=embeddings
            )

            # Save in SQL database
            if existing_doc:
                existing_doc.chunk_count = len(chunks)
                existing_doc.status = "PROCESSED"
                db.commit()
                print(f" -> Updated DB entry for {filename} (ID: {doc_id})")
            else:
                db_doc = Document(
                    id=doc_id,
                    company_id=company_id,
                    filename=filename,
                    file_type="txt",
                    file_size=len(raw_text.encode("utf-8")),
                    uploaded_by="System HR Admin",
                    chunk_count=len(chunks),
                    status="PROCESSED"
                )
                db.add(db_doc)
                db.commit()
                print(f" -> Created new DB entry for {filename} (ID: {doc_id})")

    db.close()
    print("\n[✓] All comprehensive policy documents seeded successfully into Qdrant Vector Cloud!")

if __name__ == "__main__":
    seed_documents()
