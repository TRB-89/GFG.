import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.ai.skill_normalizer import normalize_skill_name, normalize_skills_list

client = TestClient(app)

def test_skill_normalizer():
    assert normalize_skill_name("js") == "JavaScript"
    assert normalize_skill_name("postgres") == "PostgreSQL"
    assert normalize_skill_name("powerbi") == "Power BI"
    assert normalize_skill_name("springboot") == "Spring Boot"
    normalized = normalize_skills_list(["JS", "Javascript", "Python", "PY", "Power BI"])
    assert "JavaScript" in normalized
    assert "Python" in normalized
    assert "Power BI" in normalized
    assert len(normalized) == 3

def test_ai_skill_gap_analysis():
    # Login as Priya
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Request skill gap analysis for target role "Data Analyst"
    res = client.post("/api/ai/skill-gap", headers=headers, json={"target_role": "Data Analyst"})
    assert res.status_code == 200
    data = res.json()["data"]
    assert "existing_strengths" in data
    assert "skills_to_learn" in data
    assert len(data["skills_to_learn"]) > 0
    # SQL should be recognized as transferable/existing strength
    assert any("sql" in s.lower() for s in data["existing_strengths"])
    # Power BI or Python recommended
    assert any("power bi" in item["skill"].lower() or "python" in item["skill"].lower() for item in data["skills_to_learn"])

def test_ai_roadmap_generation():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/ai/roadmap", headers=headers, json={
        "target_role": "Data Analyst",
        "skills_to_learn": ["Power BI", "Pandas"]
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "weekly_plan" in data
    assert len(data["weekly_plan"]) >= 4
    assert data["available_hours_per_day"] == 4

def test_ai_job_matches_hybrid():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/ai/job-matches", headers=headers)
    assert res.status_code == 200
    matches = res.json()["data"]
    assert len(matches) > 0
    top_match = matches[0]
    assert "match_score" in top_match
    assert "alignment" in top_match
    assert top_match["alignment"] in ["Excellent Alignment", "Strong Alignment", "Moderate Alignment", "Developing Alignment"]
    assert "breakdown" in top_match
    assert "semantic" in top_match["breakdown"]
    assert "context" in top_match["breakdown"]
    assert "explanation" in top_match

def test_return_readiness_score():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/ai/readiness", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "readiness_score" in data
    assert 50 <= data["readiness_score"] <= 100
    assert "readiness_narrative" in data

def test_career_passport_ai():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/ai/passport", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "executive_summary" in data
    assert "readiness_tier" in data
    # Motherhood is not negatively framed
    assert "despite" not in data["executive_summary"].lower()

def test_skill_simulation_what_if():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get first job
    jobs_res = client.get("/api/jobs").json()
    job_id = jobs_res["data"]["data"][0]["id"]

    res = client.post("/api/ai/simulate-skill", headers=headers, json={
        "job_id": job_id,
        "skill_name": "Power BI"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["projected_score"] >= data["current_score"]
    assert data["score_increase"] > 0
