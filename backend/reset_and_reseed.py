"""Database Full Reset and Re-seed Utility

Drops old users/companies/messages/documents and seeds fresh demo data
where EVERY user has the exact same reliable password: 'Demo1234!'
"""
import sys
import io
import logging

# Ensure UTF-8 output encoding for Windows command line
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from app.database import get_engine, SessionLocal
from app.models import Base, Company, User, Document, ChatMessage
from app.services.seed_service import seed_database_and_vectors, DEMO_PASSWORD, USERS_DATA, COMPANIES_DATA
from app.services.auth_service import verify_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_reset")

def reset_and_reseed():
    print("=" * 70)
    print(">>> STARTING COMPLETE DATABASE RESET AND RE-SEED")
    print("=" * 70)

    db = SessionLocal()

    try:
        # 1. Clear old records
        print("\n[1/3] Removing all old records from SQLite database...")
        db.query(ChatMessage).delete()
        db.query(Document).delete()
        db.query(User).delete()
        db.query(Company).delete()
        db.commit()
        print("Done: All old logins, chat messages, and companies removed cleanly.")

        # 2. Re-create and seed fresh data
        print("\n[2/3] Seeding fresh companies, users, policies, and chat histories...")
        seed_database_and_vectors(db)
        print("Done: Database seeding complete.")

        # 3. Verify logins
        print("\n[3/3] Verifying all user credentials and passwords...")
        all_users = db.query(User).order_by(User.company_id.asc(), User.role.asc()).all()
        print(f"Total Users in DB: {len(all_users)}")
        
        success_count = 0
        for u in all_users:
            is_valid = verify_password(DEMO_PASSWORD, u.password_hash)
            comp_name = u.company.name if u.company else "Platform (No Company)"
            status_text = "PASS" if is_valid else "FAIL"
            if is_valid:
                success_count += 1
            print(f"  [{status_text}] Email: {u.email:<30} | Role: {u.role:<12} | Company: {comp_name}")

        print("\n" + "=" * 70)
        if success_count == len(all_users):
            print(f"SUCCESS: ALL {success_count} ACCOUNTS VERIFIED WITH PASSWORD: {DEMO_PASSWORD}")
        else:
            print(f"WARNING: {success_count}/{len(all_users)} accounts verified.")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"\nERROR during reset: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_reseed()
