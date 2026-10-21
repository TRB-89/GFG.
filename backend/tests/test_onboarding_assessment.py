import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_onboarding_assessment_generates_all_9_deliverables():
    # 1. Authenticate as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "ananya.raman@example.com",
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "previous_job_title": "Senior Data Analyst",
        "industry": "Financial Services",
        "experience_years": 4.5,
        "highest_qualification": "Bachelor's Degree",
        "existing_skills": ["SQL", "Python", "Tableau"],
        "career_break_months": 24,
        "target_role": "Lead Analytics Engineer",
        "weekly_learning_hours": 15,
        "projects": [
            {
                "title": "Customer Churn Prediction",
                "description": "Built churn classifier in Python with 87% accuracy.",
                "technologies": ["Python", "scikit-learn", "PostgreSQL"]
            }
        ]
    }

    response = client.post("/api/ai/onboarding-assessment", json=payload, headers=headers)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]

    # Verify deliverable 1: personal_skill_inventory
    assert "personal_skill_inventory" in data
    assert len(data["personal_skill_inventory"]) >= 3
    assert any(item["skill"] == "SQL" for item in data["personal_skill_inventory"])

    # Verify deliverable 2: relevant_career_options
    assert "relevant_career_options" in data
    assert len(data["relevant_career_options"]) >= 2
    assert any("Lead Analytics Engineer" in opt["role"] for opt in data["relevant_career_options"])

    # Verify deliverable 3: job_specific_skill_gaps
    assert "job_specific_skill_gaps" in data
    assert len(data["job_specific_skill_gaps"]) >= 1

    # Verify deliverable 4: transferable_strengths
    assert "transferable_strengths" in data
    assert len(data["transferable_strengths"]) >= 2

    # Verify deliverable 5: recommended_learning_modules
    assert "recommended_learning_modules" in data
    assert len(data["recommended_learning_modules"]) >= 1

    # Verify deliverable 6: suggested_projects
    assert "suggested_projects" in data
    assert len(data["suggested_projects"]) >= 1

    # Verify deliverable 7 & 8: action plan and 30/60/90 roadmap
    assert "career_readiness_action_plan" in data
    assert len(data["career_readiness_action_plan"]) >= 3
    assert "personalized_roadmap" in data
    assert "day_30" in data["personalized_roadmap"]
    assert "day_60" in data["personalized_roadmap"]
    assert "day_90" in data["personalized_roadmap"]

    # Verify deliverable 9: verified_opportunities
    assert "verified_opportunities" in data
    assert len(data["verified_opportunities"]) >= 1

    # Verify non-judgmental scoring
    assert data["preliminary_readiness_score"] >= 75
    assert data["confidence_score"] >= 0.8
    assert "career-break reasons" in data["limitations_notice"].lower()
