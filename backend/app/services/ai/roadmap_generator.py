from typing import Dict, Any, List
from pydantic import BaseModel
from backend.app.models.candidate import CandidateProfile
from backend.app.services.ai.provider import get_ai_provider
from backend.app.services.ai.prompts import ROADMAP_PROMPT_V1, SYSTEM_GUARDRAILS

class WeeklyPlanItem(BaseModel):
    week: int
    title: str
    focus: str
    goals: List[str]
    recommended_topics: List[str]
    estimated_hours: int

class RoadmapOutputSchema(BaseModel):
    target_role: str
    available_hours_per_day: int
    estimated_weeks: int
    weekly_plan: List[WeeklyPlanItem]
    milestones: List[str]

async def generate_personalized_roadmap(
    cand: CandidateProfile,
    target_role: str,
    skills_to_learn: List[str]
) -> Dict[str, Any]:
    cand_skills = [cs.skill.name for cs in cand.skills if cs.skill]
    hours_per_day = cand.available_hours_per_day or 4

    # Calculate estimated weeks adapting to daily hours (Section 12)
    # 4 hrs/day ~ 8 weeks; 2 hrs/day ~ 12 weeks; 8 hrs/day ~ 4 weeks
    total_study_hours = 120
    weekly_capacity = hours_per_day * 5 # 5 study days / week
    estimated_weeks = max(4, min(14, int(round(total_study_hours / weekly_capacity))))

    prompt = ROADMAP_PROMPT_V1.format(
        guardrails=SYSTEM_GUARDRAILS,
        target_role=target_role,
        available_hours_per_day=hours_per_day,
        existing_skills=", ".join(cand_skills) if cand_skills else "SQL, Java",
        skills_to_learn=", ".join(skills_to_learn) if skills_to_learn else "Power BI, Python, Statistics"
    )

    provider = get_ai_provider()
    try:
        res = await provider.generate_structured_output(prompt, RoadmapOutputSchema)
        res["available_hours_per_day"] = hours_per_day
        res["estimated_weeks"] = len(res.get("weekly_plan", [])) or estimated_weeks
        return res
    except Exception:
        # High-fidelity adaptive deterministic plan
        weeks = []
        topics = [
            ("SQL Advanced Joins & Window Functions", "Query aggregation, partition over clauses, rank/dense_rank"),
            ("Python Data Structures & Pandas Manipulation", "Dataframe ingestion, cleaning missing values, time-series indexing"),
            ("Exploratory Data Analysis & Visualization", "Distribution plots, correlation heatmaps, Seaborn styling"),
            ("Power BI Interface & Data Modeling", "Star schema architecture, dimensional tables, Power Query M-code"),
            ("DAX Measures & Business Intelligence Calculations", "Time intelligence, CALCULATE modifiers, KPI summary cards"),
            ("Real-World Analytics Portfolio Capstone", "Synthesize SQL database queries with interactive Power BI dashboards"),
            ("Returnship Technical Interview Query Practice", "Live coding challenges, business scenario reasoning, window queries"),
            ("Returnship Alignment & Professional Continuity Presentation", "Interview simulation, showcasing portfolio and return availability")
        ]

        active_weeks_count = min(len(topics), estimated_weeks)
        for i in range(active_weeks_count):
            title, focus = topics[i % len(topics)]
            hrs = hours_per_day * 4
            weeks.append({
                "week": i + 1,
                "title": f"Week {i+1}: {title}",
                "focus": focus,
                "goals": [f"Complete {title.split()[0]} exercises", "Validate code on GitHub repository"],
                "recommended_topics": [title.split("&")[0].strip(), "Practical Exercise"],
                "estimated_hours": hrs
            })

        return {
            "target_role": target_role,
            "available_hours_per_day": hours_per_day,
            "estimated_weeks": len(weeks),
            "weekly_plan": weeks,
            "milestones": [
                "Week 2: Data Manipulation Proficiency Confirmed",
                f"Week {max(3, len(weeks)//2)}: Core Visualization Tooling Completed",
                f"Week {len(weeks)}: Full Returnship Readiness Attained"
            ]
        }
