import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_pricing_calculator_successful():
    payload = {
        "desired_monthly_income": 60000.0,
        "billable_hours_per_week": 20.0,
        "monthly_business_expenses": 5000.0,
        "tax_reserve_percentage": 15.0,
        "vacation_weeks_per_year": 4.0
    }
    response = client.post("/api/inclusivity/pricing-calculator", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["currency"] == "INR"
    metrics = data["computed_metrics"]
    assert metrics["recommended_hourly_rate"] > 0
    assert metrics["recommended_day_rate"] == pytest.approx(metrics["recommended_hourly_rate"] * 6.0, abs=0.1)
    assert metrics["suggested_small_project_fee"] > 0
    assert metrics["suggested_medium_project_fee"] > 0
    assert metrics["suggested_part_time_retainer"] > 0
    # Mandatory non-speculative revenue disclaimer
    assert "financial_guidance_disclaimer" in data
    assert "speculative" in data["financial_guidance_disclaimer"].lower()

def test_proposal_generator_successful():
    payload = {
        "client_name": "Anita Verma",
        "client_company": "Verma Design Studios",
        "project_title": "Localization & Brand Identity",
        "service_type": "Creative Services",
        "deliverables": [
            "Tamil and Hindi content translation",
            "Typography and accessibility audit",
            "Editorial tone guidelines"
        ],
        "timeline_weeks": 4,
        "pricing_structure": "fixed_milestone",
        "total_fee": 45000.0,
        "payment_terms": "50% kickoff, 50% handover"
    }
    response = client.post("/api/inclusivity/proposals/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    proposal = data["proposal"]
    assert proposal["client_name"] == "Anita Verma"
    assert len(proposal["milestone_breakdown"]) == 2
    assert "formatted_markdown" in proposal
    assert "Anita Verma" in proposal["formatted_markdown"]
    assert "Scope of Work" in proposal["formatted_markdown"]

def test_entrepreneurship_templates_listing():
    response = client.get("/api/inclusivity/entrepreneurship/templates")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    sectors = data["sectors"]
    assert len(sectors) >= 4
    sector_ids = [s["id"] for s in sectors]
    assert "freelance_consulting" in sector_ids
    assert "home_based_creative" in sector_ids
    assert "online_education_tutoring" in sector_ids
    assert "artisan_crafts_culinary" in sector_ids

def test_guided_assistance_taxonomy():
    response = client.get("/api/inclusivity/guided-assistance")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["question"] == "What would help you move forward?"
    options = data["options"]
    assert len(options) == 6

    # Verify the 6 specific options required by Module 9 Part 7
    opt_questions = [o["question_text"] for o in options]
    assert "I don't know where to start." in opt_questions
    assert "I want to learn new skills." in opt_questions
    assert "I want to restart my career." in opt_questions
    assert "I need flexible work." in opt_questions
    assert "I want to start a business." in opt_questions
    assert "I need guidance from a mentor." in opt_questions

    # Verify action routes
    actions = [o["target_action"] for o in options]
    assert "open_onboarding" in actions
    assert "open_roadmap" in actions
    assert "open_opportunities" in actions
    assert "open_flexible_filter" in actions
    assert "open_entrepreneurship" in actions
    assert "open_mentorship" in actions
