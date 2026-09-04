"""MongoDB Database Full Reset and Re-seed Utility

Clears old collections in MongoDB Atlas and seeds fresh demo data
where EVERY user has the exact same reliable password: 'Demo1234!'
"""
import sys
import io
import logging

# Ensure UTF-8 output encoding for Windows command line
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from app.services.db_service import db_service
from app.services.seed_service import seed_database_and_vectors, DEMO_PASSWORD, USERS_DATA, COMPANIES_DATA
from app.services.auth_service import verify_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mongo_reset")

def reset_and_reseed():
    print("=" * 70)
    print(">>> STARTING COMPLETE MONGODB ATLAS RESET AND RE-SEED")
    print("=" * 70)

    try:
        # 1. Clear old records
        print("\n[1/3] Removing all old records from MongoDB collections...")
        db_service.clear_all()
        print("Done: All old users, companies, chat messages, and documents cleared from MongoDB.")

        # 2. Re-create and seed fresh data
        print("\n[2/3] Seeding fresh companies, users, policies, and chat histories into MongoDB...")
        seed_database_and_vectors()
        print("Done: MongoDB seeding complete.")

        # 3. Verify logins
        print("\n[3/3] Verifying all user credentials and passwords from MongoDB...")
        companies = db_service.get_companies()
        all_users = []
        for comp in companies:
            all_users.extend(db_service.get_users_by_company(comp.id))
        admin = db_service.get_user_by_email("admin@platform.com")
        if admin:
            all_users.insert(0, admin)

        print(f"Total Users in MongoDB: {len(all_users)}")
        
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
            print(f"SUCCESS: ALL {success_count} ACCOUNTS VERIFIED IN MONGODB WITH PASSWORD: {DEMO_PASSWORD}")
        else:
            print(f"WARNING: {success_count}/{len(all_users)} accounts verified.")
        print("=" * 70)

    except Exception as e:
        print(f"\nERROR during MongoDB reset: {e}")
        raise e

if __name__ == "__main__":
    reset_and_reseed()
