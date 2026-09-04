import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "hr_platform.db")
print(f"Migrating database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(companies)")
columns = [col[1] for col in cursor.fetchall()]
print("Current columns in companies:", columns)

if "invite_code" not in columns:
    cursor.execute("ALTER TABLE companies ADD COLUMN invite_code VARCHAR(20)")
    print("Successfully added invite_code column to companies table.")

cursor.execute("UPDATE companies SET invite_code = 'APEX-2026' WHERE id = 'comp_apex'")
cursor.execute("UPDATE companies SET invite_code = 'NEXUS-2026' WHERE id = 'comp_nexus'")
cursor.execute("UPDATE companies SET invite_code = 'GLOBAL-2026' WHERE id = 'comp_global'")
cursor.execute("UPDATE companies SET invite_code = 'CORP-2026' WHERE invite_code IS NULL OR invite_code = ''")
conn.commit()

print("\nVerified Companies:")
for row in cursor.execute("SELECT id, name, industry, invite_code FROM companies").fetchall():
    print(f"  Company: id={row[0]}, name={row[1]}, invite_code={row[3]}")

conn.close()
print("\nMigration completed successfully.")
