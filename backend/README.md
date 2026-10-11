# GFG Platform — Module 2 Backend, Database & Authentication

This directory contains the production-grade Python FastAPI backend, database schemas, Supabase configurations, and REST APIs for the **GFG Career Continuity Platform**.

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (for Next.js frontend in `my-website`)

### 2. Start the Backend API
From the root directory (`GFG 2.0`):
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API and Swagger documentation will be live at:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Start the Next.js Frontend
From `my-website`:
```bash
npm run dev
```
Access the application at [http://localhost:3001](http://localhost:3001).

---

## 🗄️ Database & Supabase Integration

### Connecting to Supabase Cloud
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run:
   - [`backend/database/schema.sql`](file:///c:/Users/TRB/modified%20mindspace%20sdg/CrediAI/GFG%202.0/backend/database/schema.sql) — Sets up all 15 normalized tables, foreign keys, indexes, and Row Level Security (RLS) policies.
   - [`backend/database/seed.sql`](file:///c:/Users/TRB/modified%20mindspace%20sdg/CrediAI/GFG%202.0/backend/database/seed.sql) — Seeds standard skills and interests.
3. In `backend/.env`, configure:
   ```env
   SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   DATABASE_URL=postgresql://postgres:<password>@db.<your-project-id>.supabase.co:5432/postgres
   ```
4. *Note on Offline Demonstration:* If `DATABASE_URL` is unset or points to SQLite, the backend automatically maintains the exact same relational schema locally so college presentations and demos never fail even without internet connectivity.

---

## 🎓 College Presentation Demo Flow (Section 40)

To perform the exact presentation flow:

1. **Open Frontend:** Visit [http://localhost:3001](http://localhost:3001).
2. **Candidate Session (Priya Sharma):**
   - Automatically authenticated as **Priya Sharma** (`priya.sharma@example.com`).
   - Observe **Profile Completion** (82%) and **Career Break Information** (*Maternity Break, 14 months*).
   - Observe **Featured Returnship:** *Data Analyst Returnship at Nova Technologies* with live **88% Compatibility Score** breakdown.
   - Click **"Apply to Returnship"**. The application is committed to the database. The status turns to `APPLIED ✓` and `Application Status: SUBMITTED`.
3. **Switch to Employer Session (Nova Technologies):**
   - In the top navbar, click **"Switch: Nova Tech"** (or use the role toggle).
   - Authenticated as **Nova Technologies HR** (`hr@novatech.com`).
   - The dashboard updates to display employer telemetry.
   - In Card 4 (*Review & Shortlist*), observe **Priya Sharma's application** with her 88% match score.
   - Click **"Shortlist Candidate"**. The status is updated to `shortlisted` in the database.
4. **Switch Back to Candidate (Priya Sharma):**
   - Click **"Switch: Priya"**.
   - Priya's live application telemetry updates to show **`SHORTLISTED`** in real time!
5. **View Career Continuity Passport:**
   - Click **"View Career Continuity Passport"** to showcase verified pre-break tenure, 14-month maternity pause, upskilled credentials, and verified skills.

---

## 🧪 Running Automated Tests

Run the test suite via pytest:
```bash
python -m pytest backend/tests/test_api.py -v
```
All 7 critical integration tests (registration, login, role authorization, candidate dashboard, employer dashboard, duplicate application prevention) will execute.
