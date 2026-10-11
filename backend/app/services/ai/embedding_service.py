import numpy as np
from typing import List, Dict, Any
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.services.ai.provider import get_ai_provider

def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two float vectors and maps to 0.0-1.0."""
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.5
    cos_sim = float(np.dot(a, b) / (norm_a * norm_b))
    # Map range [-1, 1] to [0, 1]
    return max(0.0, min(1.0, (cos_sim + 1.0) / 2.0))

def candidate_to_embedding_text(cand: CandidateProfile) -> str:
    skills = " ".join([cs.skill.name for cs in cand.skills if cs.skill])
    interests = " ".join([ci.interest.name for ci in cand.interests if ci.interest])
    return f"{cand.headline or ''} {cand.previous_job_title or ''} {cand.years_experience} years experience {skills} {interests} {cand.preferred_work_mode}"

def job_to_embedding_text(job: Job) -> str:
    skills = " ".join([js.skill.name for js in job.job_skills if js.skill])
    return f"{job.title} {job.description} {skills} {job.work_mode} {job.location} {job.employment_type}"

async def get_candidate_embedding(cand: CandidateProfile) -> List[float]:
    provider = get_ai_provider()
    text = candidate_to_embedding_text(cand)
    return await provider.create_embedding(text)

async def get_job_embedding(job: Job) -> List[float]:
    provider = get_ai_provider()
    text = job_to_embedding_text(job)
    return await provider.create_embedding(text)
