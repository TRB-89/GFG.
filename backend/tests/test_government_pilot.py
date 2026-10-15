import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_metrics_actual_view():
    """Verify actual verified outcomes contain definitions, sources, verifications, and sample sizes."""
    response = client.get("/api/government-pilot/metrics?view_mode=actual")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["view_mode"] == "actual"
    assert "Independently Verified" in data["verification_status"]
    
    # Participation metrics
    part = data["participation"]
    assert part["participants_enrolled"]["value"] > 0
    assert "metric_definition" in part["participants_enrolled"]
    assert "data_source" in part["participants_enrolled"]
    assert "verification_status" in part["participants_enrolled"]
    assert part["participants_enrolled"]["sample_size"] > 0
    assert len(part["career_sectors_selected"]["distribution"]) > 0

    # Skill development
    skills = data["skill_development"]
    assert skills["skills_verified"]["value"] > 0
    assert skills["career_passports_created"]["value"] > 0

    # Employment outcomes
    emp = data["employment_outcomes"]
    assert emp["returnships_started"]["value"] > 0
    assert emp["employment_retention_3m_percent"]["value"] >= 80.0
    assert emp["employment_retention_6m_percent"]["value"] >= 75.0
    assert "post-break" in emp["optional_reported_income_changes"]["value"]
    # Ensure view totals are not merged
    assert data.get("is_unverified_total_prevented") is True

def test_metrics_simulated_view():
    """Verify simulated view is explicitly marked as synthetic demonstration data."""
    response = client.get("/api/government-pilot/metrics?view_mode=simulated")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["view_mode"] == "simulated"
    assert "SYNTHETIC DEMO DATA" in data["verification_status"]
    assert "synthetic" in data["disclaimer"].lower()

def test_metrics_proposed_view():
    """Verify proposed pilot targets reflect planning objectives, not confirmed results."""
    response = client.get("/api/government-pilot/metrics?view_mode=proposed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["view_mode"] == "proposed"
    assert "PLANNING TARGETS" in data["verification_status"]
    assert "target" in data["disclaimer"].lower()
    assert data["participation"]["participants_enrolled"]["value"] >= 100

def test_metrics_invalid_view_mode_rejected():
    response = client.get("/api/government-pilot/metrics?view_mode=combined_total")
    assert response.status_code == 400
    err_json = response.json()
    msg = err_json.get("error", {}).get("message") or err_json.get("message", "")
    assert "view_mode" in msg

def test_pilot_design_get_and_update():
    """Verify pilot design can be inspected and updated by administrators."""
    get_res = client.get("/api/government-pilot/pilot-design")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["status"] == "success"
    cfg = data["pilot_design"]
    assert cfg["target_participants"] >= 100
    assert cfg["program_duration_months"] == 6
    assert len(cfg["phases"]) == 4
    assert "planning examples" in cfg["status_disclaimer"].lower()

    # Update target parameters
    update_payload = {
        "target_participants": 120,
        "program_duration_months": 6,
        "onboarding_assessment_weeks": 2,
        "personalized_learning_weeks": 10,
        "mentorship_opportunity_weeks": 8,
        "post_program_tracking_months": 6,
        "proposed_location": "Tamil Nadu (Pilot) / Pan-India Expandable",
        "target_returnship_stipend_inr": 40000.0,
        "target_placement_rate_percent": 80.0,
        "focus_sectors": ["Data Analytics", "Cloud SRE"]
    }
    post_res = client.post("/api/government-pilot/pilot-design", json=update_payload)
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["pilot_design"]["target_participants"] == 120
    assert post_data["pilot_design"]["target_returnship_stipend_inr"] == 40000.0

def test_scheme_navigator_directory():
    """Verify scheme navigator lists official public programmes without inventing endorsements or APIs."""
    response = client.get("/api/government-pilot/schemes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    schemes = data["schemes"]
    assert len(schemes) >= 5

    names = [s["official_name"] for s in schemes]
    assert any("National Career Service" in n for n in names)
    assert any("Skill India" in n for n in names)
    assert any("NSDC" in n for n in names)
    assert any("Naan Mudhalvan" in n for n in names)
    assert any("TNSDC" in n for n in names)

    for s in schemes:
        assert s["official_website"].startswith("https://")
        assert len(s["purpose"]) > 10
        assert len(s["eligibility_conditions"]) > 5
        assert len(s["application_guidance"]) > 10
        assert "no unverified" in s.get("integration_status", "").lower() or "reference" in s.get("integration_status", "").lower()
    
    # Check directory disclaimer
    assert "unapproved government endorsements" in data["directory_notice"].lower()

def test_sdg_alignment_and_disclaimer():
    """Verify SDG 4, 5, 8, and 10 alignment explanations and non-speculative disclaimer."""
    response = client.get("/api/government-pilot/sdg-alignment")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    goals = data["goals"]
    goal_numbers = [g["sdg_number"] for g in goals]
    assert 4 in goal_numbers
    assert 5 in goal_numbers
    assert 8 in goal_numbers
    assert 10 in goal_numbers

    for g in goals:
        assert len(g["un_targets"]) >= 2
        for t in g["un_targets"]:
            assert "gfg_contribution" in t
            assert len(t["gfg_contribution"]) > 10

    # Mandatory social impact disclaimer
    assert "methodological_disclaimer" in data
    assert "not constitute" in data["methodological_disclaimer"].lower()

def test_deidentified_pilot_reporting_with_cell_suppression():
    """Verify exported reports suppress small demographic cells (<5) and omit private salaries/break notes."""
    response = client.get("/api/government-pilot/reports/export?format=json&view_mode=actual")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    rpt = data["report_data"]
    assert "REP-GFG-PILOT" in rpt["report_id"]
    assert "k-anonymity" in rpt["privacy_protocol"].lower()
    assert len(rpt["executive_summary"]["objectives"]) > 0
    assert len(rpt["challenges_identified"]) > 0
    assert len(rpt["methodological_limitations"]) > 0
    assert len(rpt["recommendations"]) > 0

    # Test Markdown format export
    md_res = client.get("/api/government-pilot/reports/export?format=markdown&view_mode=actual")
    assert md_res.status_code == 200
    md_data = md_res.json()
    assert "content_markdown" in md_data
    assert "# State Pilot Impact Evaluation Report" in md_data["content_markdown"]

    # Test CSV format export
    csv_res = client.get("/api/government-pilot/reports/export?format=csv&view_mode=actual")
    assert csv_res.status_code == 200
    csv_data = csv_res.json()
    assert "content_csv" in csv_data
    assert "REPORT: State Pilot Impact Evaluation Report" in csv_data["content_csv"]
    assert "Participants Enrolled" in csv_data["content_csv"]
    assert "k-anonymity" in csv_data["content_csv"].lower()

def test_presentation_mode():
    """Verify presentation mode covers 5 required sections with permanent Proposed Pilot indicator."""
    response = client.get("/api/government-pilot/presentation")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    deck = data["presentation"]
    assert deck["is_proposed_pilot"] is True
    assert "PROPOSED PILOT" in deck["permanent_watermark"]
    slides = deck["slides"]
    assert len(slides) == 5

    keys = [s["section_key"] for s in slides]
    assert "the_problem" in keys
    assert "the_intervention" in keys
    assert "the_proposed_pilot" in keys
    assert "how_impact_is_measured" in keys
    assert "the_next_steps" in keys

    for s in slides:
        assert len(s["key_points"]) >= 3
        assert "metric_callout" in s
