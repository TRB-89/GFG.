from typing import Dict, Any, List, Optional
from datetime import date
from backend.app.models.candidate import CandidateProfile, CareerBreak
from backend.app.models.job import Job

def compute_compatibility_score(candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
    """
    Computes rule-based Compatibility Score (Module 2 V1 matching):
    - Skill Match: 35%
    - Experience Match: 20%
    - Career Break Eligibility: 20%
    - Availability: 10%
    - Work Mode: 10%
    - Location: 5%
    TOTAL: 100%
    """
    reasons: List[str] = []
    
    # 1. SKILLS MATCH (35%)
    cand_skill_names = {cs.skill.name.lower(): cs for cs in candidate.skills if cs.skill}
    job_skills = job.job_skills
    skills_score = 0.0

    if not job_skills:
        skills_score = 35.0
    else:
        req_skills = [js for js in job_skills if js.required]
        pref_skills = [js for js in job_skills if not js.required]
        
        req_match = 0
        for js in req_skills:
            if js.skill and js.skill.name.lower() in cand_skill_names:
                req_match += 1
                reasons.append(f"Your {js.skill.name} skills directly match required qualifications")
        
        pref_match = 0
        for js in pref_skills:
            if js.skill and js.skill.name.lower() in cand_skill_names:
                pref_match += 1
                reasons.append(f"Your {js.skill.name} proficiency satisfies preferred competencies")
        
        req_pct = (req_match / len(req_skills)) if req_skills else 1.0
        pref_pct = (pref_match / len(pref_skills)) if pref_skills else 1.0
        
        skills_score = (req_pct * 25.0) + (pref_pct * 10.0)

    # 2. EXPERIENCE MATCH (20%)
    exp_score = 0.0
    cand_exp = candidate.years_experience or 0.0
    min_exp = job.minimum_experience or 0.0
    
    if cand_exp >= min_exp:
        exp_score = 20.0
        reasons.append(f"Your previous experience ({cand_exp} years) satisfies the {min_exp}+ years requirement")
    elif cand_exp >= (min_exp * 0.7):
        exp_score = 14.0
        reasons.append(f"Your experience ({cand_exp} years) aligns closely with role expectations")
    else:
        exp_score = max(5.0, (cand_exp / (min_exp or 1.0)) * 20.0)

    # 3. CAREER BREAK ELIGIBILITY (20%)
    eligibility_score = 20.0
    # Calculate break duration
    break_months = 0
    for cb in candidate.career_breaks:
        start_d = cb.start_date
        end_d = cb.end_date or date.today()
        diff = (end_d.year - start_d.year) * 12 + (end_d.month - start_d.month)
        if diff > break_months:
            break_months = diff

    min_b = job.minimum_break_months or 0
    max_b = job.maximum_break_months

    if break_months >= min_b and (max_b is None or break_months <= max_b):
        eligibility_score = 20.0
        reasons.append(f"Your career-break duration ({break_months} months) perfectly meets returnship eligibility criteria")
    elif break_months < min_b:
        eligibility_score = 10.0
    else:
        eligibility_score = 12.0

    # 4. AVAILABILITY MATCH (10%)
    avail_score = 0.0
    cand_hours = candidate.available_hours_per_day or 4
    job_hours = job.hours_per_day or 4
    
    if cand_hours >= job_hours:
        avail_score = 10.0
        reasons.append(f"Your daily availability ({cand_hours} hrs/day) fits the role schedule ({job_hours} hrs/day)")
    elif cand_hours >= (job_hours - 1):
        avail_score = 7.0
    else:
        avail_score = 5.0

    # 5. WORK MODE MATCH (10%)
    mode_score = 0.0
    cand_mode = (candidate.preferred_work_mode or "remote").lower()
    job_mode = (job.work_mode or "remote").lower()
    
    if cand_mode == job_mode or cand_mode == "flexible" or job_mode == "remote":
        mode_score = 10.0
        reasons.append(f"Your {cand_mode.capitalize()} work preference matches the employer's {job_mode} setup")
    elif cand_mode == "hybrid" and job_mode in ["hybrid", "onsite"]:
        mode_score = 7.0
    else:
        mode_score = 4.0

    # 6. LOCATION MATCH (5%)
    loc_score = 0.0
    cand_loc = (candidate.preferred_location or "").lower()
    job_loc = (job.location or "").lower()
    
    if job_mode == "remote" or (cand_loc and cand_loc in job_loc) or (job_loc in cand_loc):
        loc_score = 5.0
        reasons.append("Location compatibility verified")
    else:
        loc_score = 3.0

    total_score = int(round(skills_score + exp_score + eligibility_score + avail_score + mode_score + loc_score))
    total_score = max(20, min(99, total_score))

    # Keep top 4 distinct reasons
    unique_reasons = []
    for r in reasons:
        if r not in unique_reasons:
            unique_reasons.append(r)
        if len(unique_reasons) >= 4:
            break

    return {
        "job_id": job.id,
        "match_score": total_score,
        "breakdown": {
            "skills": int(round(skills_score)),
            "experience": int(round(exp_score)),
            "eligibility": int(round(eligibility_score)),
            "availability": int(round(avail_score)),
            "work_mode": int(round(mode_score)),
            "location": int(round(loc_score)),
        },
        "reasons": unique_reasons
    }
