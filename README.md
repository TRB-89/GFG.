# GFG 2.0 — Career Continuity & Returnship Platform

> **RETURN. REBUILD. RISE.**  
> A minimal, cinematic editorial career platform designed to help women rebuild skills, regain confidence, and return to meaningful work after a career break.

---

## 🌟 Overview

GFG is an AI-guided career continuity platform engineered for professionals returning to tech and leadership after maternity, caregiving, health, or sabbatical breaks.

- **Editorial UI/UX**: Minimalist aesthetic with generous whitespace, dark palette (`#111111`, `#181818`, `#D8C2A6`, `#A56F7C`), and magazine-style typography.
- **Career Continuity Passport**: Official cryptographic audit of pre-break tenure, intentional sabbaticals, upskilled credentials, and verified capstone projects.
- **AI Career Intelligence**:
  - Quantified skill gap analysis and confidence matching.
  - Adaptive learning roadmaps calibrated by daily capacity (`2h` to `8h/day`).
  - Interactive skill simulation engine (*"What if I learn this skill?"*).
  - AI Interview Coach with career-break framing strategies.
- **Employer Desk (Nova Technologies)**:
  - Real-time candidate pipeline telemetry and returnship shortlisting.
  - Transparent rubrics balancing rules-based criteria (70%) and AI compatibility (30%).

---

## 🏗️ Architecture

```
GFG 2.0/
├── backend/                  # Python 3.10+ FastAPI REST API
│   ├── app/
│   │   ├── routers/          # Auth, Candidates, Jobs, Applications, AI
│   │   ├── services/ai/      # Skill normalizer, gap analyzer, matching engine
│   │   ├── models/           # SQLAlchemy / Supabase models
│   │   └── schemas/          # Pydantic validation schemas
│   ├── database/             # Schema & Seed SQL migrations
│   └── tests/                # Pytest integration test suite
│
├── my-website/               # Next.js 16 (React 19) + Tailwind CSS v4
│   ├── src/app/              # App router & global styles
│   ├── src/components/       # Editorial navigation, modals, geometry
│   ├── src/lib/              # Typed API client & data utilities
│   └── public/images/        # High-fashion editorial portraits & visuals
│
└── gfg_local.db              # Local SQLite database (offline demo fallback)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Start Backend API
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Start Next.js Frontend
```bash
cd my-website
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000)

### 4. Run Automated Tests
```bash
python -m pytest backend/tests/test_api.py -v
```

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Candidate** | Priya Sharma | `priya.sharma@example.com` | `Password@123` |
| **Employer** | Nova Technologies HR | `hr@novatech.com` | `Password@123` |

---

## 📄 License

MIT © 2026 GFG. All rights reserved.
