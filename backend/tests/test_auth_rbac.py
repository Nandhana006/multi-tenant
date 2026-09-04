"""RBAC and Authentication Unit Tests"""
import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, email: str, password: str = "Demo1234!") -> str:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]

def test_login_success(client: TestClient):
    """Test login for different roles."""
    hr_token = get_auth_token(client, "hr.a@demo.com")
    assert hr_token is not None

    emp_token = get_auth_token(client, "employee.a@demo.com")
    assert emp_token is not None

    admin_token = get_auth_token(client, "admin@platform.com")
    assert admin_token is not None

def test_invalid_login(client: TestClient):
    """Test login with wrong password."""
    response = client.post("/api/auth/login", json={"email": "hr.a@demo.com", "password": "WrongPassword"})
    assert response.status_code == 401

def test_employee_cannot_upload(client: TestClient):
    """Verify that Employee is FORBIDDEN from uploading documents."""
    emp_token = get_auth_token(client, "employee.a@demo.com")
    headers = {"Authorization": f"Bearer {emp_token}"}
    
    files = {"file": ("test.txt", b"Employee trying to upload policy", "text/plain")}
    response = client.post("/api/documents/upload", headers=headers, files=files)
    assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"

def test_employee_can_view_documents_list(client: TestClient):
    """Verify that Employee can view company policies in read-only mode."""
    emp_token = get_auth_token(client, "employee.a@demo.com")
    headers = {"Authorization": f"Bearer {emp_token}"}
    response = client.get("/api/documents", headers=headers)
    assert response.status_code == 200

def test_unauthenticated_cannot_view_documents(client: TestClient):
    """Verify that unauthenticated user cannot access documents."""
    response = client.get("/api/documents")
    assert response.status_code in [401, 403]

def test_employee_cannot_delete(client: TestClient):
    """Verify that Employee cannot delete documents."""
    emp_token = get_auth_token(client, "employee.a@demo.com")
    headers = {"Authorization": f"Bearer {emp_token}"}
    response = client.delete("/api/documents/doc_apex_leave_policy", headers=headers)
    assert response.status_code == 403

def test_hr_can_view_documents(client: TestClient):
    """Verify that HR can view their own company documents."""
    hr_token = get_auth_token(client, "hr.a@demo.com")
    headers = {"Authorization": f"Bearer {hr_token}"}
    response = client.get("/api/documents", headers=headers)
    assert response.status_code == 200
    docs = response.json()
    assert isinstance(docs, list)
    for d in docs:
        assert d["company_id"] == "comp_apex"
