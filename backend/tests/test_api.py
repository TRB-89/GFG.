import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_candidate():
    response = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    })
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "access_token" in res["data"]
    assert res["data"]["user"]["role"] == "candidate"

def test_login_demo_employer():
    response = client.post("/api/auth/login", json={
        "email": "hr@novatech.com",
        "password": "Password@123"
    })
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["user"]["role"] == "employer"

def test_unauthorized_access_blocked():
    response = client.get("/api/candidates/me")
    assert response.status_code == 401

def test_candidate_dashboard_and_matching():
    # Login as Priya
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch candidate dashboard
    dash_res = client.get("/api/dashboard/candidate", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()["data"]
    assert dash_data["profile_completion"] > 50
    assert len(dash_data["recommended_jobs"]) > 0

    # Verify compatibility score structure
    first_job = dash_data["recommended_jobs"][0]
    assert "compatibility" in first_job
    assert "match_score" in first_job["compatibility"]
    assert "reasons" in first_job["compatibility"]
    assert len(first_job["compatibility"]["reasons"]) > 0

def test_employer_dashboard():
    login_res = client.post("/api/auth/login", json={
        "email": "hr@novatech.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get("/api/dashboard/employer", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()["data"]
    assert data["active_jobs"] >= 1

def test_prevent_duplicate_application():
    # Login as Priya
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get a job
    jobs_res = client.get("/api/jobs").json()
    first_job_id = jobs_res["data"]["data"][0]["id"]

    # Try applying
    app1 = client.post(f"/api/jobs/{first_job_id}/apply", headers=headers, json={
        "cover_note": "Application test 1"
    }).json()

    # Try duplicate applying to the exact same job
    app2 = client.post(f"/api/jobs/{first_job_id}/apply", headers=headers, json={
        "cover_note": "Application test 2 duplicate"
    }).json()

    assert app2["success"] is False
    assert app2["error"]["code"] == "DUPLICATE_APPLICATION"
