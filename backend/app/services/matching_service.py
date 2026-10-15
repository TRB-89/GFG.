from typing import Dict, Any, List, Optional
from datetime import date
from backend.app.models.candidate import CandidateProfile, CareerBreak
from backend.app.models.job import Job

def compute_compatibility_score(candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
    """
    Computes rule-based Smart Opportunity Compatibility Score (Module 7):
    - Skill Match (required + preferred): 35%
    - Experience Match: 20%
    - Career Break Returnship Eligibility: 20%
    - Availability Match: 10%
    - Work Mode Compatibility: 10%
    - Location Compatibility: 5%
    TOTAL: 100%

    CRITICAL RULES:
    1. Do not use career-break reasons as negative ranking factors.
    2. Do not imply that a match score predicts hiring probability.
    """
    reasons: List[str] = []
    requirements_satisfied: List[str] = []
    important_missing_skills: List[str] = []
    areas_for_improvement: List[str] = []
    
    # 1. SKILLS MATCH (35%)
    cand_skill_names = {cs.skill.name.lower(): cs for cs in candidate.skills if cs.skill}
    job_skills = job.job_skills
    skills_score = 0.0

    if not job_skills:
        skills_score = 35.0
        requirements_satisfied.append("Role does not specify strict technical skill prerequisites.")
    else:
        req_skills = [js for js in job_skills if js.required]
        pref_skills = [js for js in job_skills if not js.required]
        
        req_match = 0
        for js in req_skills:
            if js.skill and js.skill.name.lower() in cand_skill_names:
                req_match += 1
                cs = cand_skill_names[js.skill.name.lower()]
                prov = getattr(cs, "provenance", "self_reported")
                prov_label = "verified" if prov in ["independently_verified", "verified", "assessment_supported"] else "demonstrated"
                msg = f"Your {prov_label} {js.skill.name} skills satisfy core required qualifications"
                reasons.append(msg)
                requirements_satisfied.append(msg)
            else:
                s_name = js.skill.name if js.skill else "Required Skill"
                important_missing_skills.append(f"{s_name} (Required)")
                areas_for_improvement.append(f"Complete a learning module or capstone in {s_name} to fulfill core role requirements.")
        
        pref_match = 0
        for js in pref_skills:
            if js.skill and js.skill.name.lower() in cand_skill_names:
                pref_match += 1
                msg = f"Your {js.skill.name} proficiency satisfies preferred competencies"
                reasons.append(msg)
                requirements_satisfied.append(msg)
            else:
                s_name = js.skill.name if js.skill else "Preferred Skill"
                important_missing_skills.append(f"{s_name} (Preferred)")
        
        req_pct = (req_match / len(req_skills)) if req_skills else 1.0
        pref_pct = (pref_match / len(pref_skills)) if pref_skills else 1.0
        
        skills_score = (req_pct * 25.0) + (pref_pct * 10.0)

    # 2. EXPERIENCE MATCH (20%)
    exp_score = 0.0
    cand_exp = candidate.years_experience or 0.0
    min_exp = job.minimum_experience or 0.0
    
    if cand_exp >= min_exp:
        exp_score = 20.0
        msg = f"Your previous experience ({cand_exp} yrs) satisfies the minimum {min_exp}+ yrs benchmark"
        reasons.append(msg)
        requirements_satisfied.append(msg)
    elif cand_exp >= (min_exp * 0.7):
        exp_score = 14.0
        msg = f"Your experience ({cand_exp} yrs) closely approaches the {min_exp} yrs target"
        reasons.append(msg)
        requirements_satisfied.append(msg)
    else:
        exp_score = max(5.0, (cand_exp / (min_exp or 1.0)) * 20.0)
        areas_for_improvement.append(f"Target role expects {min_exp}+ years of past domain exposure. Highlighting capstone project deliverables helps bridge the difference.")

    # 3. CAREER BREAK RETURN-ELIGIBILITY (20%)
    # RULE: Do not use career-break reasons (e.g. maternity, caregiving) as negative ranking factors!
    eligibility_score = 20.0
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
        msg = f"Your career break duration ({break_months} mos) aligns with returnship cohort criteria"
        reasons.append(msg)
        requirements_satisfied.append(msg)
    elif break_months < min_b:
        eligibility_score = 14.0
        requirements_satisfied.append(f"Recent professional tenure qualifies for flexible on-ramping.")
    else:
        eligibility_score = 14.0
        requirements_satisfied.append(f"Extended career break fully acknowledged; dedicated returnship onboarding provided.")

    # 4. AVAILABILITY MATCH (10%)
    avail_score = 0.0
    cand_hours = candidate.available_hours_per_day or 4
    job_hours = job.hours_per_day or 4
    
    if cand_hours >= job_hours:
        avail_score = 10.0
        msg = f"Your daily availability ({cand_hours} hrs/day) accommodates the role schedule ({job_hours} hrs/day)"
        reasons.append(msg)
        requirements_satisfied.append(msg)
    elif cand_hours >= (job_hours - 1):
        avail_score = 7.0
        msg = f"Daily availability ({cand_hours} hrs/day) is workable for {job_hours} hrs/day format"
        reasons.append(msg)
    else:
        avail_score = 5.0
        areas_for_improvement.append(f"Role recommends {job_hours} hrs/day. Current schedule specifies {cand_hours} hrs/day.")

    # 5. WORK MODE MATCH (10%)
    mode_score = 0.0
    cand_mode = (candidate.preferred_work_mode or "remote").lower()
    job_mode = (job.work_mode or "remote").lower()
    
    if cand_mode == job_mode or cand_mode == "flexible" or job_mode == "remote":
        mode_score = 10.0
        msg = f"Work arrangement compatible: Your {cand_mode.capitalize()} preference matches {job_mode} structure"
        reasons.append(msg)
        requirements_satisfied.append(msg)
    elif cand_mode == "hybrid" and job_mode in ["hybrid", "onsite"]:
        mode_score = 7.0
        requirements_satisfied.append(f"Hybrid commute arrangement suitable for {job.location}")
    else:
        mode_score = 4.0
        areas_for_improvement.append(f"Employer specifies {job_mode} schedule, while candidate profile prefers {cand_mode}.")

    # 6. LOCATION MATCH (5%)
    loc_score = 0.0
    cand_loc = (candidate.preferred_location or "").lower()
    job_loc = (job.location or "").lower()
    
    if job_mode == "remote" or (cand_loc and cand_loc in job_loc) or (job_loc in cand_loc):
        loc_score = 5.0
        msg = "Location compatibility verified"
        reasons.append(msg)
        requirements_satisfied.append(msg)
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

    working_arrangement_compatibility = (
        f"Work arrangement is {job_mode.upper()} in {job.location} with {job_hours} hours/day expectation. "
        f"Candidate preference ({cand_mode.capitalize()}, {cand_hours} hrs/day) indicates "
        f"{'strong synergy' if mode_score >= 7 and avail_score >= 7 else 'partial schedule adjustment required'}."
    )

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
        "reasons": unique_reasons,
        "match_explanation": {
            "requirements_satisfied": requirements_satisfied,
            "important_missing_skills": important_missing_skills,
            "working_arrangement_compatibility": working_arrangement_compatibility,
            "areas_for_improvement": areas_for_improvement or ["Your qualifications align well with this position. Submitting verified capstone project evidence enhances your candidacy."],
            "disclaimer": "Do not imply that a match score predicts hiring probability. Match scores assess documented skill and schedule alignment only."
        }
    }
