"""Quick test to verify demo passwords"""
from app.services.auth_service import verify_password
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "hr.a@demo.com").first()

print(f"Email: {user.email}")
print(f"Hash: {user.password_hash}")
print(f"Verify 'Demo1234!': {verify_password('Demo1234!', user.password_hash)}")
print(f"Verify 'password': {verify_password('password', user.password_hash)}")
print(f"Verify 'demo1234': {verify_password('demo1234', user.password_hash)}")

db.close()
