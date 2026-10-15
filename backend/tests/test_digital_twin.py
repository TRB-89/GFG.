import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_candidate_token():
    res = client.post("/api/auth/login", json={
        "email": "ananya.raman@example.com",
        "password": "Password@123"
    }).json()
    return res["data"]["access_token"]

def test_digital_twin_unauthorized():
    res = client.get("/api/digital-twin/profile")
    assert res.status_code == 401

def test_digital_twin_profile():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/digital-twin/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]

    # Verify profile structure per Module 3 specifications
    assert "career_history" in data
    assert "skills_inventory" in data
    assert "qualifications" in data
    assert "desired_career_paths" in data
    assert "learning_availability" in data
    assert "portfolio_projects" in data
    assert "work_preferences" in data
    assert "readiness_metrics" in data
    assert data["twin_metadata"]["model_type"] == "Career-Planning Digital Twin"

def test_digital_twin_skill_inventory_provenance():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/digital-twin/skills", headers=headers)
    assert res.status_code == 200
    skills = res.json()["data"]
    assert len(skills) > 0

    valid_provenances = {"self_reported", "ai_inferred", "assessment_supported", "independently_verified"}
    for skill in skills:
        assert skill["provenance"] in valid_provenances
        assert "confidence_score" in skill
        assert "source_detail" in skill

def test_digital_twin_skill_confirm_correct_remove():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add / Confirm a skill
    res_confirm = client.post("/api/digital-twin/skills/confirm", json={
        "skill_name": "Data Modeling",
        "proficiency": "advanced"
    }, headers=headers)
    assert res_confirm.status_code == 200
    assert res_confirm.json()["success"] is True

    # 2. Correct the skill proficiency
    res_correct = client.post("/api/digital-twin/skills/correct", json={
        "skill_id_or_name": "Data Modeling",
        "proficiency": "expert",
        "years_experience": 4.0
    }, headers=headers)
    assert res_correct.status_code == 200

    # 3. Remove skill
    res_del = client.delete("/api/digital-twin/skills/Data Modeling", headers=headers)
    assert res_del.status_code == 200

def test_digital_twin_gap_analysis():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/digital-twin/gap-analysis?target_role=Data Analyst", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]

    assert "existing_transferable_skills" in data
    assert "missing_essential_skills" in data
    assert "recommended_refreshers" in data
    assert "new_industry_tools" in data
    assert "portfolio_evidence_requirements" in data
    assert data["estimated_learning_weeks"] >= 1

def test_digital_twin_pathways_and_explanations():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/digital-twin/pathways", headers=headers)
    assert res.status_code == 200
    pathways = res.json()["data"]
    assert len(pathways) <= 5
    assert len(pathways) > 0

    top_pathway = pathways[0]
    assert "job_role" in top_pathway
    assert "match_percentage" in top_pathway
    assert "why_matched" in top_pathway
    assert "why_recommended_explanation" in top_pathway
    assert "evidence_and_uncertainty" in top_pathway
    assert "work_arrangement_compatibility" in top_pathway

def test_digital_twin_knowledge_graph():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/digital-twin/knowledge-graph", headers=headers)
    assert res.status_code == 200
    graph = res.json()["data"]

    assert "nodes" in graph
    assert "edges" in graph
    node_types = {n["type"] for n in graph["nodes"]}
    assert "previous_role" in node_types
    assert "skill" in node_types
    assert "transferable_skill" in node_types
    assert "career_option" in node_types
    assert "learning_requirement" in node_types

def test_digital_twin_history_and_refresh():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Refresh twin
    res_refresh = client.post("/api/digital-twin/refresh", headers=headers)
    assert res_refresh.status_code == 200

    # Get history log
    res_hist = client.get("/api/digital-twin/history", headers=headers)
    assert res_hist.status_code == 200
    history = res_hist.json()["data"]
    assert len(history) > 0
    assert any(h["event_type"] == "twin_refreshed" for h in history)
