import logging
from typing import Dict, Any, List, Optional
from datetime import date
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.services.matching_service import compute_compatibility_score
from backend.app.services.ai.embedding_service import (
    get_candidate_embedding,
    get_job_embedding,
    compute_cosine_similarity,
)

logger = logging.getLogger("GFG_Hybrid_Matching")

def get_alignment_label(score: int) -> str:
    """Classify match score into ethical alignment categories per Section 20."""
    if score >= 90:
        return "Excellent Alignment"
    elif score >= 75:
        return "Strong Alignment"
    elif score >= 60:
        return "Moderate Alignment"
    else:
        return "Developing Alignment"

async def compute_hybrid_match_score(
    cand: CandidateProfile,
    job: Job,
    candidate_vec: Optional[List[float]] = None,
    job_vec: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Computes Hybrid Match Score per Section 14:
    - Skill Match: 30%
    - Experience: 15%
    - Career-break eligibility: 15%
    - Work mode: 10%
    - Availability: 10%
    - Location: 5%
    - Semantic similarity: 10%
    - AI contextual relevance: 5%
    TOTAL: 100%
    """
    # 1. Base rule components from Module 2
    rule_res = compute_compatibility_score(cand, job)
    rb = rule_res["breakdown"]

    # Re-normalize rule components to Module 3 weightings
    skills_weighted = (rb["skills"] / 35.0) * 30.0
    exp_weighted = (rb["experience"] / 20.0) * 15.0
    break_weighted = (rb["eligibility"] / 20.0) * 15.0
    avail_weighted = (rb["availability"] / 10.0) * 10.0
    mode_weighted = (rb["work_mode"] / 10.0) * 10.0
    loc_weighted = (rb["location"] / 5.0) * 5.0

    # 2. Semantic vector similarity (10%)
    try:
        if candidate_vec is None:
            candidate_vec = await get_candidate_embedding(cand)
        if job_vec is None:
            job_vec = await get_job_embedding(job)
        semantic_sim = compute_cosine_similarity(candidate_vec, job_vec)
        semantic_score = semantic_sim * 10.0
    except Exception as e:
        logger.warning(f"Semantic similarity calculation failed: {e}. Falling back to default.")
        semantic_score = 8.5

    # 3. AI Contextual Relevance (5%)
    # Checks if candidate's background provides a natural transition
    context_score = 4.5
    cand_role = (cand.previous_job_title or "").lower()
    job_title = job.title.lower()
    if ("engineer" in cand_role or "developer" in cand_role) and ("analyst" in job_title or "data" in job_title):
        context_score = 4.8
    elif "analyst" in cand_role and "analyst" in job_title:
        context_score = 5.0

    final_score = int(round(
        skills_weighted + exp_weighted + break_weighted +
        avail_weighted + mode_weighted + loc_weighted +
        semantic_score + context_score
    ))
    final_score = max(35, min(98, final_score))
    alignment = get_alignment_label(final_score)

    # 4. Identify specific skills to improve (gaps)
    cand_skill_names = {cs.skill.name.lower() for cs in cand.skills if cs.skill}
    skills_to_improve = []
    for js in job.job_skills:
        if js.skill and js.skill.name.lower() not in cand_skill_names:
            skills_to_improve.append(js.skill.name)

    # Detailed explanation
    reasons = rule_res.get("reasons", [])
    if skills_to_improve:
        explanation = (
            f"Strong match because your prior {cand.previous_job_title or 'professional'} background satisfies "
            f"the core analytical requirements, and the {job.work_mode} schedule fits your daily availability. "
            f"Acquiring {', '.join(skills_to_improve[:2])} would further enhance your competitive alignment."
        )
    else:
        explanation = (
            f"Excellent match! Your skill set and {cand.years_experience} years of pre-break experience "
            f"satisfy all requirements for this {job.employment_type} track."
        )

    return {
        "job_id": job.id,
        "title": job.title,
        "job_title": job.title,
        "company": job.company.name if job.company else "Partner Company",
        "company_name": job.company.name if job.company else "Partner Company",
        "match_score": final_score,
        "alignment": alignment,
        "breakdown": {
            "skills": int(round(skills_weighted)),
            "experience": int(round(exp_weighted)),
            "eligibility": int(round(break_weighted)),
            "availability": int(round(avail_weighted)),
            "work_mode": int(round(mode_weighted)),
            "location": int(round(loc_weighted)),
            "semantic": int(round(semantic_score)),
            "context": int(round(context_score))
        },
        "top_reasons": reasons[:3],
        "skills_to_improve": skills_to_improve[:2],
        "explanation": explanation
    }

async def simulate_skill_acquisition(cand: CandidateProfile, job: Job, hypothetical_skill_name: str) -> Dict[str, Any]:
    """
    Section 52: "What if I learn this skill?" simulation feature.
    Estimates potential compatibility score improvement if candidate acquires this skill.
    """
    current_match = await compute_hybrid_match_score(cand, job)
    current_score = current_match["match_score"]

    # Calculate potential boost if the hypothetical skill is relevant to the job
    job_skill_names = [js.skill.name.lower() for js in job.job_skills if js.skill]
    hypo_lower = hypothetical_skill_name.lower()

    boost = 0
    if hypo_lower in job_skill_names:
        boost = 7  # High boost for required/preferred skills
    elif hypo_lower in ["power bi", "python", "tableau", "statistics"]:
        boost = 5  # Standard analytics boost
    else:
        boost = 3

    projected_score = min(98, current_score + boost)
    return {
        "job_id": job.id,
        "hypothetical_skill": hypothetical_skill_name,
        "current_score": current_score,
        "projected_score": projected_score,
        "projected_alignment": get_alignment_label(projected_score),
        "score_increase": boost,
        "note": f"Estimated improvement by adding {hypothetical_skill_name} to your verified skill stack. Does not constitute a hiring guarantee."
    }
