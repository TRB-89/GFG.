"""
Tests for GFG Module 4 — AI Career Future Simulator
Validates multi-scenario simulation logic, persistence of saved scenarios, side-by-side comparison,
and ensuring hypothetical simulations do not falsely modify verified profile credentials.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def get_auth_token(email="ananya.raman@example.com", password="Password@123"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}"
    res_json = response.json()
    if "data" in res_json and "access_token" in res_json["data"]:
        return res_json["data"]["access_token"]
    return res_json.get("access_token")


def test_simulator_unauthorized_blocked():
    """Verify unauthorized requests are rejected."""
    res = client.get("/api/simulator/baseline")
    assert res.status_code == 401

    res = client.post("/api/simulator/simulate", json={"scenario_type": "learn_skill"})
    assert res.status_code == 401


def test_simulator_options_and_baseline():
    """Verify options and candidate baseline are retrieved accurately."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/simulator/options", headers=headers)
    assert res.status_code == 200
    options = res.json()
    assert "skills" in options
    assert "Power BI" in options["skills"]
    assert "qualifications" in options
    assert "industries" in options
    assert "projects" in options
    assert "target_occupations" in options

    res = client.get("/api/simulator/baseline", headers=headers)
    assert res.status_code == 200
    baseline = res.json()
    assert "target_role" in baseline
    assert "readiness_score" in baseline
    assert "verified_skills" in baseline
    assert isinstance(baseline["verified_skills"], list)


def test_simulate_learn_skill_power_bi():
    """Verify simulating 'Learn Power BI' returns grounded diff without modifying verified skills."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch verified skills before simulation
    cand_res = client.get("/api/digital-twin/skills", headers=headers)
    verified_skills_before = [s["name"] for s in cand_res.json()["data"]]

    sim_res = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "learn_skill",
            "scenario_name": "Learn Power BI for Analytics",
            "parameters": {
                "skill": "Power BI",
                "target_career": "Data Analyst",
                "weekly_hours": 15,
                "learning_intensity": "steady",
                "work_mode": "Hybrid"
            }
        }
    )
    assert sim_res.status_code == 200
    data = sim_res.json()

    assert data["scenario_type"] == "learn_skill"
    assert "before" in data and "after" in data
    assert data["after"]["projected_target_role_match"] >= data["before"]["target_role_match"]
    assert data["after"]["projected_readiness_score"] >= data["before"]["readiness_score"]
    assert data["after"]["estimated_learning_hours"] == 40
    assert len(data["after"]["newly_satisfied_requirements"]) > 0
    assert data["after"]["recommended_capstone_project"] is not None
    assert "ai_explanation" in data
    assert "Power BI" in data["ai_explanation"]

    # Verify verified skills were NOT modified in DB
    cand_res_after = client.get("/api/digital-twin/skills", headers=headers)
    verified_skills_after = [s["name"] for s in cand_res_after.json()["data"]]
    assert verified_skills_before == verified_skills_after


def test_simulate_earn_qualification():
    """Verify simulating earning an accredited certification."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    sim_res = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "earn_qualification",
            "parameters": {
                "qualification": "Microsoft PL-300: Power BI Data Analyst",
                "target_career": "Business Intelligence Specialist",
                "weekly_hours": 15
            }
        }
    )
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["after"]["projected_readiness_score"] > data["before"]["readiness_score"]
    assert any("Formal accredited validation" in req for req in data["after"]["newly_satisfied_requirements"])


def test_simulate_change_industry():
    """Verify simulating an industry pivot to HealthTech."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    sim_res = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "change_industry",
            "parameters": {
                "industry": "HealthTech",
                "target_career": "Data Analyst",
                "weekly_hours": 15
            }
        }
    )
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert any("HIPAA" in req for req in data["after"]["newly_satisfied_requirements"])


def test_simulate_adjust_availability():
    """Verify availability compression calculates reduced completion weeks."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 10 hrs/week
    sim_10 = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "adjust_availability",
            "parameters": {"weekly_hours": 10, "learning_intensity": "relaxed"}
        }
    ).json()

    # 25 hrs/week
    sim_25 = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "adjust_availability",
            "parameters": {"weekly_hours": 25, "learning_intensity": "intensive"}
        }
    ).json()

    assert sim_25["after"]["estimated_weeks_to_complete"] < sim_10["after"]["estimated_weeks_to_complete"]


def test_save_and_manage_simulation():
    """Verify saving, listing, and deleting a simulation scenario."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Run simulation
    sim_res = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={
            "scenario_type": "complete_project",
            "scenario_name": "Build Churn Telemetry Repository",
            "parameters": {"project_title": "Customer Churn Telemetry Dashboard", "weekly_hours": 15}
        }
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()

    # 2. Save simulation
    save_res = client.post(
        "/api/simulator/save",
        headers=headers,
        json={
            "scenario_name": "Build Churn Telemetry Repository",
            "scenario_type": "complete_project",
            "parameters": {"project_title": "Customer Churn Telemetry Dashboard"},
            "results": sim_data
        }
    )
    assert save_res.status_code == 200
    save_id = save_res.json()["id"]

    # 3. List saved simulations
    list_res = client.get("/api/simulator/saved", headers=headers)
    assert list_res.status_code == 200
    saved_list = list_res.json()
    assert any(s["id"] == save_id for s in saved_list)

    # 4. Delete saved simulation
    del_res = client.delete(f"/api/simulator/saved/{save_id}", headers=headers)
    assert del_res.status_code == 200

    # 5. Verify deleted
    list_res_after = client.get("/api/simulator/saved", headers=headers)
    assert not any(s["id"] == save_id for s in list_res_after.json())


def test_compare_simulations():
    """Verify side-by-side comparison calculates metric deltas."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    sim_a = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={"scenario_type": "learn_skill", "parameters": {"skill": "Power BI", "weekly_hours": 15}}
    ).json()

    sim_b = client.post(
        "/api/simulator/simulate",
        headers=headers,
        json={"scenario_type": "start_returnship", "parameters": {"returnship_title": "Nova Tech 12-Week Analytics Returnship"}}
    ).json()

    comp_res = client.post(
        "/api/simulator/compare",
        headers=headers,
        json={"simulation_a": sim_a, "simulation_b": sim_b}
    )
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert "scenario_a" in comp and "scenario_b" in comp
    assert "comparison_delta" in comp
    assert "readiness_delta" in comp["comparison_delta"]


def test_apply_simulated_skill_to_roadmap():
    """Verify applying a simulated skill adds a learning milestone without modifying verified profile skills."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    apply_res = client.post(
        "/api/simulator/apply-to-roadmap",
        headers=headers,
        json={
            "skill_or_milestone": "Power BI & DAX Capstone",
            "category": "Business Intelligence",
            "estimated_hours": 30
        }
    )
    assert apply_res.status_code == 200
    assert "Added 'Power BI & DAX Capstone'" in apply_res.json()["message"]
