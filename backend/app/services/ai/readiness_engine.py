from typing import Dict, Any, List
from backend.app.models.candidate import CandidateProfile
from backend.app.models.user import Profile

def compute_return_readiness(cand: CandidateProfile, user: Profile) -> Dict[str, Any]:
    """
    Computes Return Readiness Score per Section 22:
    - Profile completeness: 15%
    - Core skill coverage: 25%
    - Skill freshness: 15%
    - Learning progress: 15%
    - Portfolio/projects: 10%
    - Resume completeness: 10%
    - Target-role clarity: 10%
    TOTAL: 100%
    """
    # 1. Profile completeness (15%)
    profile_score = 0
    if user.full_name and user.email:
        profile_score += 8
    if cand.headline and cand.years_experience:
        profile_score += 7

    # 2. Core skill coverage (25%)
    num_skills = len(cand.skills)
    if num_skills >= 5:
        skill_coverage_score = 25
    elif num_skills >= 3:
        skill_coverage_score = 20
    elif num_skills >= 1:
        skill_coverage_score = 12
    else:
        skill_coverage_score = 5

    # 3. Skill freshness (15%)
    # Checks recent upskilling / learning active
    if cand.learning_progress and len(cand.learning_progress) > 0:
        freshness_score = 15
    elif cand.certificates and len(cand.certificates) > 0:
        freshness_score = 12
    else:
        freshness_score = 8

    # 4. Learning progress (15%)
    learning_score = 0
    if cand.learning_progress:
        avg_pct = sum(lp.progress_percentage for lp in cand.learning_progress) / len(cand.learning_progress)
        learning_score = int(round((avg_pct / 100.0) * 15.0))
    else:
        learning_score = 10 # default baseline for initial setup

    # 5. Portfolio/projects (10%)
    project_score = 0
    if cand.projects and len(cand.projects) > 0:
        project_score = 10
    elif cand.certificates and len(cand.certificates) > 0:
        project_score = 7

    # 6. Resume completeness (10%)
    resume_score = 10 if cand.resume_url else 0

    # 7. Target-role clarity (10%)
    clarity_score = 10 if (cand.headline or (cand.interests and len(cand.interests) > 0)) else 5

    total_readiness = profile_score + skill_coverage_score + freshness_score + learning_score + project_score + resume_score + clarity_score
    total_readiness = max(40, min(95, total_readiness))

    # Constructive coaching language (Section 23)
    strengths = [cs.skill.name for cs in cand.skills[:3] if cs.skill]
    if not strengths:
        strengths = ["SQL", "Java", "Backend Development"]

    improvements = []
    cand_skill_names = {cs.skill.name.lower() for cs in cand.skills if cs.skill}
    for rec in ["Power BI", "Pandas", "Applied Statistics"]:
        if rec.lower() not in cand_skill_names:
            improvements.append(rec)

    guidance = (
        f"You are currently building strong momentum toward your target role. "
        f"Your technical background in {', '.join(strengths[:2])} provides an established foundation. "
        f"Completing your {improvements[0] if improvements else 'next'} learning module will elevate your return readiness score to {min(98, total_readiness + 10)}%."
    )

    return {
        "readiness_score": total_readiness,
        "breakdown": {
            "profile_completeness": profile_score,
            "core_skills": skill_coverage_score,
            "skill_freshness": freshness_score,
            "learning_progress": learning_score,
            "portfolio_projects": project_score,
            "resume_completeness": resume_score,
            "target_role_clarity": clarity_score
        },
        "strong_competencies": strengths,
        "recommended_enhancements": improvements[:2],
        "readiness_narrative": guidance
    }
