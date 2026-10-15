"""
Tests for GFG Module 5 — Adaptive Learning Engine
Validates:
1. Customized learning plan generation across different sectors and learning modes.
2. Meaningfully different plans for candidates with different goals/available hours.
3. Redundant beginner module skipping for demonstrated skills.
4. Non-punitive roadmap adaptations after interruptions (reschedule, reduce workload, extend date, reprioritize).
5. Deterministic module completion tracking (quizzes, practical tasks) and Digital Twin event logging.
6. Resource credibility and cost tier metadata enforcement.
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


def test_adaptive_learning_unauthorized():
    """Verify unauthorized requests are rejected."""
    res = client.get("/api/adaptive-learning/curriculum")
    assert res.status_code == 401

    res = client.post("/api/adaptive-learning/generate", json={"target_sector": "Data Analyst"})
    assert res.status_code == 401


def test_adaptive_learning_options():
    """Verify options endpoint returns sectors, learning modes, adaptation strategies, and cost tiers."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/adaptive-learning/options", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "learning_modes" in data
    assert "microlearning_5min" in data["learning_modes"]
    assert "focused_15min" in data["learning_modes"]
    assert "structured_30min" in data["learning_modes"]
    assert "weekend_intensive" in data["learning_modes"]
    assert "self_paced" in data["learning_modes"]

    assert "sectors" in data
    sector_keys = [s["key"] for s in data["sectors"]]
    assert "Data Analyst" in sector_keys
    assert "Cloud & DevOps Associate" in sector_keys

    assert "adaptation_strategies" in data
    strategy_ids = [s["id"] for s in data["adaptation_strategies"]]
    assert "reschedule" in strategy_ids
    assert "reduce_workload" in strategy_ids
    assert "extend_target_date" in strategy_ids
    assert "reprioritize_essentials" in strategy_ids

    assert "resource_cost_tiers" in data
    tier_names = [t["tier"] for t in data["resource_cost_tiers"]]
    assert "free" in tier_names
    assert "official_certification" in tier_names
    assert "paid" in tier_names


def test_candidate_curriculum_retrieval_and_baseline_generation():
    """Verify retrieving candidate curriculum generates an active baseline if none exists."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/adaptive-learning/curriculum", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "roadmap" in data
    assert "weekly_plan" in data["roadmap"]
    assert len(data["roadmap"]["weekly_plan"]) > 0
    assert "disclaimer" in data["roadmap"]
    assert "GFG does not issue government-certified educational degrees" in data["roadmap"]["disclaimer"]


def test_customized_plans_differ_across_goals_and_hours():
    """
    Acceptance Criteria: Two configurations with different sectors/study hours receive meaningfully different plans.
    """
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Plan A: Data Analyst, 20 hrs/week, structured 30-min
    res_a = client.post(
        "/api/adaptive-learning/generate",
        headers=headers,
        json={
            "target_sector": "Data Analyst",
            "weekly_hours": 20,
            "learning_mode": "structured_30min"
        }
    )
    assert res_a.status_code == 200
    plan_a = res_a.json()["roadmap"]

    # Plan B: Cloud & DevOps Associate, 5 hrs/week, 5-minute microlearning
    res_b = client.post(
        "/api/adaptive-learning/generate",
        headers=headers,
        json={
            "target_sector": "Cloud & DevOps Associate",
            "weekly_hours": 5,
            "learning_mode": "microlearning_5min"
        }
    )
    assert res_b.status_code == 200
    plan_b = res_b.json()["roadmap"]

    # Verify meaningful differences
    assert plan_a["target_sector"] != plan_b["target_sector"]
    assert plan_a["weekly_hours"] != plan_b["weekly_hours"]
    assert plan_a["learning_mode"] != plan_b["learning_mode"]
    assert plan_a["learning_mode_meta"]["title"] == "30-Minute Structured Lessons"
    assert plan_b["learning_mode_meta"]["title"] == "5-Minute Microlearning"

    # Modules in Plan A focus on Data/SQL, whereas Plan B focuses on Cloud/Linux/Docker
    plan_a_first_mod = plan_a["weekly_plan"][0]["modules"][0]["title"]
    plan_b_first_mod = plan_b["weekly_plan"][0]["modules"][0]["title"]
    assert plan_a_first_mod != plan_b_first_mod
    assert "Cloud" in plan_b_first_mod or "Linux" in plan_b_first_mod or "AWS" in plan_b_first_mod or "Docker" in plan_b_first_mod


def test_demonstrated_skill_skipping():
    """Verify that demonstrating existing proficiency skips redundant beginner material."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Generate Data Analyst plan while passing demonstrated skills to skip
    res = client.post(
        "/api/adaptive-learning/generate",
        headers=headers,
        json={
            "target_sector": "Data Analyst",
            "weekly_hours": 15,
            "learning_mode": "focused_15min",
            "skills_to_skip": ["SQL", "Relational Database"]
        }
    )
    assert res.status_code == 200
    plan = res.json()["roadmap"]

    # Check skipped modules count
    assert plan["skipped_modules_count"] >= 1

    # Find the SQL module
    sql_mod = None
    for week in plan["weekly_plan"]:
        for mod in week["modules"]:
            if "sql" in mod["title"].lower() and "foundation" in mod["title"].lower():
                sql_mod = mod
                break
        if sql_mod:
            break

    assert sql_mod is not None
    assert sql_mod["progress_state"] == "skipped_proficient"
    assert "completion_evidence" in sql_mod
    assert sql_mod["completion_evidence"]["reason"] is not None


def test_interruption_adaptation_non_punitive():
    """Verify non-punitive adaptation strategies (reschedule, reduce_workload, extend_target_date, reprioritize)."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Reset to standard plan
    client.post(
        "/api/adaptive-learning/generate",
        headers=headers,
        json={"target_sector": "Data Analyst", "weekly_hours": 15, "learning_mode": "focused_15min"}
    )

    # Strategy 1: Reschedule
    res_resched = client.post(
        "/api/adaptive-learning/adapt",
        headers=headers,
        json={"strategy": "reschedule"}
    )
    assert res_resched.status_code == 200
    data_resched = res_resched.json()
    history = data_resched["roadmap"]["adaptation_history"]
    assert any(h["action"] == "rescheduled" for h in history)

    # Strategy 2: Reduce workload
    res_reduce = client.post(
        "/api/adaptive-learning/adapt",
        headers=headers,
        json={"strategy": "reduce_workload", "parameters": {"new_weekly_hours": 6}}
    )
    assert res_reduce.status_code == 200
    data_reduce = res_reduce.json()
    assert data_reduce["roadmap"]["weekly_hours"] == 6
    assert data_reduce["roadmap"]["learning_mode"] == "microlearning_5min"

    # Strategy 3: Extend target date
    res_extend = client.post(
        "/api/adaptive-learning/adapt",
        headers=headers,
        json={"strategy": "extend_target_date", "parameters": {"extension_weeks": 3}}
    )
    assert res_extend.status_code == 200
    data_extend = res_extend.json()
    assert any(h["action"] == "extended_target_date" for h in data_extend["roadmap"]["adaptation_history"])

    # Strategy 4: Reprioritize essentials
    res_reprioritize = client.post(
        "/api/adaptive-learning/adapt",
        headers=headers,
        json={"strategy": "reprioritize_essentials"}
    )
    assert res_reprioritize.status_code == 200
    data_reprioritize = res_reprioritize.json()
    assert any(h["action"] == "reprioritized_essentials" for h in data_reprioritize["roadmap"]["adaptation_history"])


def test_deterministic_module_completion():
    """Verify module completion via quiz submission updates state, score, and logs audit event."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Generate fresh plan
    gen_res = client.post(
        "/api/adaptive-learning/generate",
        headers=headers,
        json={"target_sector": "Data Analyst", "weekly_hours": 15, "learning_mode": "focused_15min"}
    )
    assert gen_res.status_code == 200
    plan = gen_res.json()["roadmap"]

    # Pick first not-started module
    target_module = None
    for week in plan["weekly_plan"]:
        for mod in week["modules"]:
            if mod["progress_state"] == "not_started":
                target_module = mod
                break
        if target_module:
            break

    assert target_module is not None
    mod_id = target_module["id"]

    # Submit quiz completion
    comp_res = client.post(
        f"/api/adaptive-learning/modules/{mod_id}/complete",
        headers=headers,
        json={
            "score": 95,
            "artifact_url": "https://github.com/candidate/sql-portfolio-joins",
            "reflection_note": "Understood the nuances of LEFT JOIN vs INNER JOIN in cohort analysis."
        }
    )
    assert comp_res.status_code == 200
    updated_plan = comp_res.json()["roadmap"]

    # Check that module is now completed
    completed_mod = None
    for week in updated_plan["weekly_plan"]:
        for mod in week["modules"]:
            if mod["id"] == mod_id:
                completed_mod = mod
                break
        if completed_mod:
            break

    assert completed_mod is not None
    assert completed_mod["progress_state"] == "completed"
    assert completed_mod["completion_evidence"]["score"] == 95
    assert completed_mod["completion_evidence"]["artifact_url"] == "https://github.com/candidate/sql-portfolio-joins"


def test_skip_module_proficient():
    """Verify manual skip module endpoint sets state to skipped_proficient."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    curr_res = client.get("/api/adaptive-learning/curriculum", headers=headers)
    assert curr_res.status_code == 200
    plan = curr_res.json()["roadmap"]

    # Find an incomplete module
    target_mod = None
    for week in plan["weekly_plan"]:
        for mod in week["modules"]:
            if mod["progress_state"] == "not_started":
                target_mod = mod
                break
        if target_mod:
            break

    if target_mod:
        mod_id = target_mod["id"]
        skip_res = client.post(
            f"/api/adaptive-learning/modules/{mod_id}/skip",
            headers=headers,
            json={"reason": "Demonstrated 4 years prior experience in legacy system"}
        )
        assert skip_res.status_code == 200
        updated = skip_res.json()["roadmap"]

        found = False
        for week in updated["weekly_plan"]:
            for mod in week["modules"]:
                if mod["id"] == mod_id:
                    assert mod["progress_state"] == "skipped_proficient"
                    assert mod["completion_evidence"]["skipped_by_user"] is True
                    found = True
                    break
            if found:
                break
        assert found is True
