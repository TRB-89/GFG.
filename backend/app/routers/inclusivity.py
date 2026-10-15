from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/inclusivity", tags=["Inclusivity, Accessibility & Financial Independence"])

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class PricingCalculatorRequest(BaseModel):
    desired_monthly_income: float = Field(..., gt=0, description="Desired take-home pay per month in INR")
    billable_hours_per_week: float = Field(..., gt=0, le=60, description="Estimated realistic billable client hours per week")
    monthly_business_expenses: float = Field(default=5000.0, ge=0, description="Software, internet, tools, equipment")
    tax_reserve_percentage: float = Field(default=15.0, ge=0, le=50, description="Estimated tax buffer percentage")
    vacation_weeks_per_year: float = Field(default=4.0, ge=0, le=12, description="Planned personal time off per year")

class ProposalGeneratorRequest(BaseModel):
    client_name: str
    client_company: Optional[str] = "Independent Client"
    project_title: str
    service_type: str = Field(..., description="e.g. Consulting, Design, Content, Bookkeeping, Development")
    deliverables: List[str]
    timeline_weeks: int = Field(default=4, ge=1)
    pricing_structure: str = Field(default="fixed_milestone", description="'fixed_milestone', 'hourly', or 'retainer'")
    total_fee: float = Field(..., gt=0)
    payment_terms: str = Field(default="50% deposit upon kickoff, 50% upon final delivery")
    special_notes: Optional[str] = None

# ============================================================================
# PART 5: ENTREPRENEURSHIP & PRICING LOGIC
# ============================================================================

@router.post("/pricing-calculator")
def calculate_service_pricing(payload: PricingCalculatorRequest):
    """
    Computes minimum hourly and project rates for freelancers, consultants,
    and home-based entrepreneurs based on realistic billable hours.
    Explicitly enforces that numbers are illustrative benchmarks, not speculative guarantees.
    """
    working_weeks = max(52.0 - payload.vacation_weeks_per_year, 1.0)
    billable_hours_per_year = payload.billable_hours_per_week * working_weeks
    billable_hours_per_month = billable_hours_per_year / 12.0

    # Total revenue needed = (Desired income + Expenses) / (1 - Tax rate)
    tax_multiplier = 1.0 - (payload.tax_reserve_percentage / 100.0)
    if tax_multiplier <= 0:
        tax_multiplier = 0.5

    gross_monthly_target = (payload.desired_monthly_income + payload.monthly_business_expenses) / tax_multiplier
    recommended_hourly_rate = gross_monthly_target / billable_hours_per_month

    # Standard day rate (assuming 6 productive billable hours in a full day)
    recommended_day_rate = recommended_hourly_rate * 6.0

    # Common project sizes
    small_project_fee = recommended_hourly_rate * 15.0   # ~15 hours
    medium_project_fee = recommended_hourly_rate * 40.0  # ~40 hours (1-2 weeks)
    monthly_retainer_fee = recommended_hourly_rate * (payload.billable_hours_per_week * 2.0) # ~half capacity retainer

    return {
        "status": "success",
        "currency": "INR",
        "inputs": {
            "desired_monthly_income": payload.desired_monthly_income,
            "billable_hours_per_week": payload.billable_hours_per_week,
            "monthly_business_expenses": payload.monthly_business_expenses,
            "tax_reserve_percentage": payload.tax_reserve_percentage,
            "vacation_weeks_per_year": payload.vacation_weeks_per_year,
        },
        "computed_metrics": {
            "annual_billable_hours": round(billable_hours_per_year, 1),
            "monthly_billable_hours": round(billable_hours_per_month, 1),
            "gross_monthly_revenue_target": round(gross_monthly_target, 2),
            "monthly_tax_reserve": round(gross_monthly_target * (payload.tax_reserve_percentage / 100.0), 2),
            "recommended_hourly_rate": round(recommended_hourly_rate, 2),
            "recommended_day_rate": round(recommended_day_rate, 2),
            "suggested_small_project_fee": round(small_project_fee, 2),
            "suggested_medium_project_fee": round(medium_project_fee, 2),
            "suggested_part_time_retainer": round(monthly_retainer_fee, 2),
        },
        "financial_guidance_disclaimer": "All pricing calculations are illustrative budgeting benchmarks designed to protect your financial sustainability. GFG does not present speculative figures as guaranteed earnings; actual contracts depend on your negotiated client agreements."
    }

@router.post("/proposals/generate")
def generate_client_proposal(payload: ProposalGeneratorRequest):
    """
    Generates a structured, professional business proposal suitable for
    independent consulting, freelance services, and home-based ventures.
    """
    milestone_breakdown = []
    if payload.pricing_structure == "fixed_milestone":
        first_milestone = round(payload.total_fee * 0.5, 2)
        second_milestone = round(payload.total_fee * 0.5, 2)
        milestone_breakdown = [
            {"milestone": "Project Kickoff & Discovery", "percentage": "50%", "amount": first_milestone, "due": "Upon contract signing"},
            {"milestone": "Final Review & Handover", "percentage": "50%", "amount": second_milestone, "due": f"Week {payload.timeline_weeks} completion"}
        ]
    elif payload.pricing_structure == "retainer":
        milestone_breakdown = [
            {"milestone": "Monthly Retainer Cycle", "percentage": "100%", "amount": payload.total_fee, "due": "1st of every month in advance"}
        ]
    else:
        milestone_breakdown = [
            {"milestone": "Bi-weekly Hourly Timesheet", "percentage": "Variable", "amount": payload.total_fee, "due": "Net 15 days upon invoice"}
        ]

    proposal_markdown = f"""# Professional Client Proposal
**Prepared for:** {payload.client_name} ({payload.client_company})
**Project Title:** {payload.project_title}
**Service Track:** {payload.service_type}
**Estimated Duration:** {payload.timeline_weeks} Weeks

---

### 1. Scope of Work & Deliverables
We will partner with you to deliver the following core items:
"""
    for i, d in enumerate(payload.deliverables, 1):
        proposal_markdown += f"- **Deliverable {i}:** {d}\n"

    proposal_markdown += f"""
---

### 2. Timeline & Project Schedule
- **Kickoff:** Within 3 business days of formal agreement.
- **Duration:** {payload.timeline_weeks} Weeks.
- **Check-ins:** Weekly asynchronous status report with optional 20-minute alignment sync.

---

### 3. Investment & Commercial Terms
- **Total Investment:** ₹{payload.total_fee:,.2f} INR
- **Payment Terms:** {payload.payment_terms}

| Milestone / Deliverable | Allocation | Amount (INR) | Schedule |
| :--- | :--- | :--- | :--- |
"""
    for m in milestone_breakdown:
        proposal_markdown += f"| {m['milestone']} | {m['percentage']} | ₹{m['amount']:,.2f} | {m['due']} |\n"

    proposal_markdown += f"""
---

### 4. Professional Standards & Revisions
- Includes up to **2 rounds of constructive revisions** per deliverable within 7 business days of delivery.
- Intellectual Property transfers in full to the client upon receipt of final settlement.

{f'**Special Addendum:** {payload.special_notes}' if payload.special_notes else ''}
"""

    return {
        "status": "success",
        "proposal": {
            "client_name": payload.client_name,
            "project_title": payload.project_title,
            "total_fee": payload.total_fee,
            "timeline_weeks": payload.timeline_weeks,
            "milestone_breakdown": milestone_breakdown,
            "formatted_markdown": proposal_markdown.strip()
        }
    }

@router.get("/entrepreneurship/templates")
def list_entrepreneurship_templates():
    """
    Returns curated starter packs for non-IT, consulting, and home-based pathways.
    """
    return {
        "status": "success",
        "sectors": [
            {
                "id": "freelance_consulting",
                "title": "Freelance Consulting & Advisory",
                "description": "Monetize domain expertise from your prior career through advisory retainers, operational audits, and fractional management.",
                "typical_services": ["HR Operations Audit", "Financial Model Review", "Marketing Channel Strategy", "Supply Chain Optimization"],
                "startup_investment_range": "₹5,000 - ₹20,000 (Laptop, domain, professional registration)",
                "recommended_first_steps": [
                    "Define your high-impact 30-day quick win service package",
                    "Reach out to 5 former colleagues to announce your availability",
                    "Create a 1-page PDF capabilities sheet and LinkedIn service page"
                ]
            },
            {
                "id": "home_based_creative",
                "title": "Home-Based Creative & Content Services",
                "description": "Flexible writing, instructional design, social brand identity, and multilingual translation for global clients.",
                "typical_services": ["SEO Content Writing", "Tamil/Hindi Localization", "Social Media Graphics", "Executive Ghostwriting"],
                "startup_investment_range": "₹3,000 - ₹15,000 (Design software, high-speed internet)",
                "recommended_first_steps": [
                    "Curate 3 portfolio samples showcasing previous work",
                    "Set minimum floor pricing to prevent undercharging",
                    "Join localized women entrepreneur networks for peer referrals"
                ]
            },
            {
                "id": "online_education_tutoring",
                "title": "Online Tutoring & Micro-Courses",
                "description": "Transform teaching experience into small cohort academic tutoring, language training, or corporate soft-skills workshops.",
                "typical_services": ["High School Mathematics Tutoring", "Bilingual English Fluency", "Python for Teens", "Corporate Presentation Coaching"],
                "startup_investment_range": "₹5,000 - ₹25,000 (Stylus tablet, microphone, Zoom pro)",
                "recommended_first_steps": [
                    "Design a 4-week structured syllabus with clear learning outcomes",
                    "Offer 1 free demo session to gather video or written testimonials",
                    "Establish clear batch schedules aligned with family commitments"
                ]
            },
            {
                "id": "artisan_crafts_culinary",
                "title": "Culinary & Artisan Goods",
                "description": "Boutique catering, specialty baking, organic preserves, and handmade crafts operating from home.",
                "typical_services": ["Celebration Cakes & Healthy Bakes", "Handmade Skincare & Soaps", "Festive Gift Hampers", "Corporate Snack Subscriptions"],
                "startup_investment_range": "₹10,000 - ₹40,000 (FSSAI license, packaging, base ingredients)",
                "recommended_first_steps": [
                    "Obtain basic food safety/FSSAI home vendor registration",
                    "Standardize unit recipe costs including packaging and delivery margins",
                    "Launch via neighborhood WhatsApp and residential community groups"
                ]
            }
        ]
    }

# ============================================================================
# PART 7: GUIDED ASSISTANCE TAXONOMY ("TELL US WHAT YOU NEED")
# ============================================================================

GUIDED_ASSISTANCE_TAXONOMY = [
    {
        "id": "dont_know_where_to_start",
        "question_text": "I don't know where to start.",
        "headline": "Personalized Step-by-Step Onboarding",
        "description": "Explore an exploratory sample journey without commitments. We'll help you map prior experience, normalize career pauses, and discover paths that fit your life.",
        "target_action": "open_onboarding",
        "button_text": "Start Gentle Onboarding Journey",
        "badge": "Beginner Friendly"
    },
    {
        "id": "want_to_learn_skills",
        "question_text": "I want to learn new skills.",
        "headline": "Adaptive Learning Engine & Microlearning",
        "description": "Access customizable 8-week roadmaps ranging from 5-minute microlearning to structured weekly modules. Skips skills you already master with non-punitive adaptations.",
        "target_action": "open_roadmap",
        "button_text": "Launch Adaptive Roadmap",
        "badge": "Skill Calibration"
    },
    {
        "id": "restart_career",
        "question_text": "I want to restart my career.",
        "headline": "Curated Returnships & Verified Opportunities",
        "description": "Browse opportunities specifically built for career comeback candidates, with transparent salary benchmarks, verified employers, and returnship mentor support.",
        "target_action": "open_opportunities",
        "button_text": "Explore Returnships & Jobs",
        "badge": "Direct Hiring"
    },
    {
        "id": "need_flexible_work",
        "question_text": "I need flexible work.",
        "headline": "Work-Life Balanced Opportunities",
        "description": "Filter strictly for remote roles, part-time arrangements, flexible daily hours, and employers offering childcare support without disclosing caregiving reasons.",
        "target_action": "open_flexible_filter",
        "button_text": "Browse Flexible Opportunities",
        "badge": "Work-Life Fit"
    },
    {
        "id": "start_a_business",
        "question_text": "I want to start a business.",
        "headline": "Entrepreneurship & Freelancing Hub",
        "description": "Utilize interactive business planners, service pricing calculators, monthly expense trackers, and professional proposal templates with realistic financial budgeting.",
        "target_action": "open_entrepreneurship",
        "button_text": "Open Entrepreneurship Hub",
        "badge": "Financial Independence"
    },
    {
        "id": "need_mentor_guidance",
        "question_text": "I need guidance from a mentor.",
        "headline": "Verified Mentorship & Comeback Circles",
        "description": "Book 1:1 sessions with women leaders who navigated career breaks, join small peer cohorts (max 15 members), and practice AI interview questions.",
        "target_action": "open_mentorship",
        "button_text": "Connect with Mentors & Circles",
        "badge": "Peer Support"
    }
]

@router.get("/guided-assistance")
def get_guided_assistance_options():
    """
    Returns the 6 prominent guided options for 'Tell Us What You Need'
    with structured routing destinations.
    """
    return {
        "status": "success",
        "question": "What would help you move forward?",
        "options": GUIDED_ASSISTANCE_TAXONOMY
    }
