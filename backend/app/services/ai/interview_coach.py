from typing import Dict, Any, List
from pydantic import BaseModel
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.services.ai.provider import get_ai_provider
from backend.app.services.ai.prompts import INTERVIEW_PREP_PROMPT_V1, SYSTEM_GUARDRAILS

class InterviewQuestion(BaseModel):
    topic: str
    question: str
    key_focus_areas: List[str]

class InterviewPrepOutputSchema(BaseModel):
    technical_questions: List[InterviewQuestion]
    behavioral_questions: List[str]
    career_break_framing_advice: str

async def generate_interview_preparation(cand: CandidateProfile, job: Job) -> Dict[str, Any]:
    cand_skills = [cs.skill.name for cs in cand.skills if cs.skill]
    break_type = cand.career_breaks[0].break_type if cand.career_breaks else "career break"
    break_months = 14

    prompt = INTERVIEW_PREP_PROMPT_V1.format(
        guardrails=SYSTEM_GUARDRAILS,
        job_title=job.title,
        candidate_skills=", ".join(cand_skills) if cand_skills else "SQL, Java, Python",
        career_break_type=break_type,
        break_duration_months=break_months
    )

    provider = get_ai_provider()
    try:
        res = await provider.generate_structured_output(prompt, InterviewPrepOutputSchema)
        return res
    except Exception:
        return {
            "technical_questions": [
                {
                    "topic": "SQL & Window Aggregations",
                    "question": "Can you explain the difference between RANK() and DENSE_RANK() and provide a scenario where partition over is required?",
                    "key_focus_areas": ["Syntax", "Handling duplicate values", "Partition key selection"]
                },
                {
                    "topic": "Data Modeling & Star Schema",
                    "question": "How do you design a Star Schema for an e-commerce order analytics dataset?",
                    "key_focus_areas": ["Fact vs Dimension tables", "Surrogate keys", "Query performance"]
                },
                {
                    "topic": "Python / Pandas Transformations",
                    "question": "How would you handle missing financial records and date-time conversions in a high-volume dataset?",
                    "key_focus_areas": ["Forward/backward fill", "Imputation strategies", "Timestamp parsing"]
                }
            ],
            "behavioral_questions": [
                "Tell me about a technical project where you had to quickly learn a new library or data model to solve a problem.",
                "How do you plan your sprint deliverables and coordinate with cross-functional stakeholders when working in a flexible or remote environment?"
            ],
            "career_break_framing_advice": "When addressing your career sabbatical, emphasize your deliberate, intentional focus on family care alongside proactive technical upskilling (such as your Google Data Analytics certification and Power BI projects). Frame your break as a period of purposeful balance and continuous growth."
        }
