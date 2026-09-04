# Multi-Company AI HR Chatbot Platform (Enterprise Multi-Tenant RAG)

A role-based, multi-tenant AI HR chatbot platform built with **FastAPI**, **React (Vite)**, **Qdrant Vector DB**, **PostgreSQL / SQLite**, and **Sentence-Transformers**.

---

## 🌟 Key Features

1. **Strict Multi-Tenancy & Vector Isolation**:
   - Every document, chunk, and vector payload contains `company_id`.
   - Vector retrieval in Qdrant **strictly enforces** `FieldCondition(key="company_id", match=MatchValue(value=current_user.company_id))`.
   - The authenticated user's `company_id` is derived from verified JWT tokens on the backend—never trusted from frontend parameters.
   - Company A users can **never** retrieve or leak Company B documents.

2. **Role-Based Access Control (RBAC)**:
   - **`SUPER_ADMIN`**: View platform overview, all registered tenant companies, user rosters, and vector partition health.
   - **`HR`**: Upload company policy documents (PDF, DOCX, TXT), view uploaded repository, delete documents, and chat with AI.
   - **`EMPLOYEE`**: Query the AI HR Assistant for policy answers with grounded citations. Document upload and delete endpoints return **`403 Forbidden`**.

3. **Document Ingestion & RAG Pipeline**:
   - Text extraction for **PDF**, **DOCX**, and **TXT**.
   - Recursive character chunking with overlap.
   - Local embeddings using `all-MiniLM-L6-v2` (384 dimensions) for zero rate-limiting and low latency.
   - Grounded LLM answering (Groq / OpenAI compatible) with exact source citations and relevance scores.

---

## 🚀 Quick Start Guide

### 1. Start the Backend

```bash
cd backend

# Activate the virtual environment:
# Windows (PowerShell / Command Prompt):
.venv\Scripts\activate

# Install dependencies (if not already installed):
pip install -r requirements.txt

# Start FastAPI server on port 8000:
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will automatically:
- Initialize database tables.
- Create the Qdrant `company_documents` collection with a keyword payload index on `company_id`.
- Seed demo companies (**Apex Corp**, **Nexus Tech**, **Global Logistics**), demo users, and sample policies.

Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies:
npm install

# Run Vite dev server:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Personas & Credentials

All demo accounts share the password: **`Demo1234!`**

| Persona | Email | Role | Company (Tenant) | Key Policy In Seed |
| :--- | :--- | :--- | :--- | :--- |
| **Apex Corp HR Lead** | `hr.a@demo.com` | `HR` | Apex Corp (`comp_apex`) | Manage Apex Docs |
| **Apex Corp Employee** | `employee.a@demo.com` | `EMPLOYEE` | Apex Corp (`comp_apex`) | **20 Days Annual Leave**, 10 Sick, 80% Apex Care |
| **Nexus Tech HR VP** | `hr.b@demo.com` | `HR` | Nexus Tech (`comp_nexus`) | Manage Nexus Docs |
| **Nexus Tech Employee** | `employee.b@demo.com` | `EMPLOYEE` | Nexus Tech (`comp_nexus`) | **30 Days Annual Leave**, 15 Sick, 100% Nexus Elite |
| **Global Logistics HR** | `hr.c@demo.com` | `HR` | Global Logistics (`comp_global`) | Manage Global Docs |
| **Global Logistics Employee** | `employee.c@demo.com` | `EMPLOYEE` | Global Logistics (`comp_global`) | General Policies |
| **Platform Super Admin** | `admin@platform.com` | `SUPER_ADMIN` | Platform Master | Platform Stats & Roster |

*(Tip: The UI features a **1-Click Demo Login** bar on the login page and a **Switch Persona** dropdown in the top navbar for effortless live demonstrations!)*

---

## 🧪 Running Automated Tests

Run unit and tenant isolation tests:

```bash
cd backend
python -m pytest tests -v
```

This verifies:
- `test_login_success`: Authentication for all roles.
- `test_employee_cannot_upload`: Employee receives `403 Forbidden` on upload.
- `test_employee_cannot_delete`: Employee receives `403 Forbidden` on delete.
- `test_company_a_employee_leave_policy`: Company A employee gets 20 days.
- `test_company_b_employee_leave_policy`: Company B employee gets 30 days.
- `test_cross_tenant_isolation_no_leakage`: Querying Company A terms from Company B returns 0 hits.
- `test_cross_tenant_document_delete_forbidden`: Cross-company delete returns `404 Not Found`.

---

## 📁 Project Structure

```text
hr-rag-platform/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, documents, chat, companies, admin)
│   │   ├── services/        # vector_store, embedding, rag, document_processor, seed
│   │   ├── config.py        # Settings & environment configuration
│   │   ├── database.py      # PostgreSQL & SQLite fallback engine
│   │   ├── dependencies.py  # JWT & RBAC guards
│   │   ├── models.py        # SQLAlchemy schema
│   │   ├── schemas.py       # Pydantic validation
│   │   └── main.py          # FastAPI entrypoint
│   ├── seed_data/           # Sample DOCX/PDF policies for demo
│   ├── tests/               # Pytest suite
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # HRDashboard, EmployeeChat, SuperAdminDashboard, DemoLoginCards
│   │   ├── context/         # AuthContext
│   │   ├── services/        # Axios API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```
