"""Multi-Tenant Vector and RAG Isolation Tests"""
import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, email: str, password: str = "Demo1234!") -> str:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]

def test_company_a_employee_leave_policy(client: TestClient):
    """Verify Company A employee gets Company A leave policy (20 days)."""
    token = get_auth_token(client, "employee.a@demo.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/chat", json={"question": "How many days of annual leave do I get?"}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["company_id"] == "comp_apex"
    answer = data["answer"].lower()
    assert "20" in answer, f"Expected 20 days for Company A, got: {data['answer']}"
    assert "30 days" not in answer, f"Company A answer should not contain 30 days: {data['answer']}"

def test_company_b_employee_leave_policy(client: TestClient):
    """Verify Company B employee gets Company B leave policy (30 days)."""
    token = get_auth_token(client, "employee.b@demo.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/chat", json={"question": "How many days of annual leave do I get?"}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["company_id"] == "comp_nexus"
    answer = data["answer"].lower()
    assert "30" in answer, f"Expected 30 days for Company B, got: {data['answer']}"
    assert "20 days" not in answer, f"Company B answer should not contain 20 days: {data['answer']}"

def test_cross_tenant_isolation_no_leakage(client: TestClient):
    """
    Verify Company B employee cannot retrieve Company A specific policy ('Apex Care' health insurance).
    The system must state the information could not be found.
    """
    token = get_auth_token(client, "employee.b@demo.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/chat", json={"question": "What is the annual maximum benefit for Apex Care insurance?"}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Company B vector search with company_id="comp_nexus" must not match Company A's Apex Care doc
    for source in data["sources"]:
        assert source["document_id"] != "doc_apex_leave_policy", "Leaked Company A document to Company B user!"

def test_cross_tenant_document_delete_forbidden(client: TestClient):
    """Verify Company A HR cannot delete Company B document."""
    hr_a_token = get_auth_token(client, "hr.a@demo.com")
    headers = {"Authorization": f"Bearer {hr_a_token}"}
    
    # Attempt to delete Company B document
    response = client.delete("/api/documents/doc_nexus_leave_policy", headers=headers)
    assert response.status_code == 404, "Company A HR should not be able to delete Company B document!"
