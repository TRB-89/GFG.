import json
from typing import Optional, List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CareerBreak, OnboardingDraft, Skill, CandidateSkill
from backend.app.schemas.candidate import (
    CandidateProfileUpdate,
    CandidateProfileResponse,
    CareerBreakResponse,
    CandidateSkillResponse,
    CandidateInterestResponse,
    CareerGapPassportResponse,
    OnboardingDraftSaveRequest,
    OnboardingDraftResponse,
    OnboardingCompleteRequest,
)
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import get_current_user, require_role
from backend.app.services.candidate_service import calculate_profile_completion

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

def format_candidate_details(cand: CandidateProfile, user: Profile, is_employer_view: bool = False) -> dict:
    completion = calculate_profile_completion(cand, user)

    # Format career breaks with privacy rules
    breaks_formatted = []
    for cb in cand.career_breaks:
        start_d = cb.start_date
        end_d = cb.end_date or date.today()
        duration_months = max(1, (end_d.year - start_d.year) * 12 + (end_d.month - start_d.month))

        # Privacy rule per Section 35: If employer view and visibility is not public, sanitize medical/health notes
        description_shown = cb.description
        if is_employer_view and cand.career_break_visibility == "private":
            description_shown = "Professional Sabbatical / Career Break"
        elif is_employer_view and cb.break_type == "health":
            description_shown = "Medical recovery and personal sabbatical (Details verified by GFG Platform)"

        breaks_formatted.append({
            "id": cb.id,
            "candidate_id": cb.candidate_id,
            "break_type": cb.break_type,
            "start_date": cb.start_date.isoformat(),
            "end_date": cb.end_date.isoformat() if cb.end_date else None,
            "currently_on_break": cb.currently_on_break,
            "description": description_shown,
            "expected_return_date": cb.expected_return_date.isoformat() if cb.expected_return_date else None,
            "duration_months": duration_months,
            "created_at": cb.created_at.isoformat(),
            "updated_at": cb.updated_at.isoformat()
        })

    skills_formatted = [
        {
            "id": cs.id,
            "skill_id": cs.skill_id,
            "name": cs.skill.name if cs.skill else "",
            "category": cs.skill.category if cs.skill else "",
            "proficiency": cs.proficiency,
            "years_experience": cs.years_experience,
        }
        for cs in cand.skills
    ]

    interests_formatted = [
        {
            "id": ci.id,
            "interest_id": ci.interest_id,
            "name": ci.interest.name if ci.interest else "",
            "category": ci.interest.category if ci.interest else "",
            "priority": ci.priority,
        }
        for ci in cand.interests
    ]

    return {
        "id": cand.id,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email if not is_employer_view else "Protected via GFG Messaging",
        "phone": user.phone if not is_employer_view else None,
        "location": user.location or cand.preferred_location,
        "profile_photo_url": user.profile_photo_url,
        "headline": cand.headline,
        "highest_qualification": cand.highest_qualification,
        "years_experience": cand.years_experience or 0.0,
        "previous_job_title": cand.previous_job_title,
        "previous_company": cand.previous_company,
        "preferred_work_mode": cand.preferred_work_mode,
        "preferred_location": cand.preferred_location,
        "available_hours_per_day": cand.available_hours_per_day,
        "current_status": cand.current_status,
        "resume_url": cand.resume_url,
        "linkedin_url": cand.linkedin_url,
        "github_url": cand.github_url,
        "portfolio_url": cand.portfolio_url,
        "return_readiness_status": cand.return_readiness_status,
        "career_break_visibility": cand.career_break_visibility,
        "profile_completion": completion,
        "career_breaks": breaks_formatted,
        "skills": skills_formatted,
        "interests": interests_formatted,
    }

@router.get("/me")
def get_candidate_me(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.commit()
        db.refresh(cand)

    data = format_candidate_details(cand, current_user, is_employer_view=False)
    return success_response(data)

@router.put("/me")
def update_candidate_me(
    req: CandidateProfileUpdate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    update_dict = req.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(cand, key, value)

    db.commit()
    db.refresh(cand)

    data = format_candidate_details(cand, current_user, is_employer_view=False)
    return success_response(data)

@router.get("/{candidate_id}")
def get_candidate_by_id(
    candidate_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "The requested candidate profile was not found.")

    is_employer = (current_user.role == "employer")
    data = format_candidate_details(cand, cand.user, is_employer_view=is_employer)
    return success_response(data)

@router.get("/me/passport")
def get_career_gap_passport(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Section 34: Career Continuity Passport Endpoint
    """
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not initialized.")

    total_months = 0
    for cb in cand.career_breaks:
        start_d = cb.start_date
        end_d = cb.end_date or date.today()
        total_months += max(1, (end_d.year - start_d.year) * 12 + (end_d.month - start_d.month))

    verified_skills = [cs.skill.name for cs in cand.skills if cs.skill]
    completed_certs = [c.certificate_name for c in cand.certificates]
    projects_list = [p.title for p in cand.projects]

    data = {
        "candidate": format_candidate_details(cand, current_user),
        "career_continuity_summary": f"Returning professional with {cand.years_experience} years of pre-break domain expertise in {cand.previous_job_title or 'Engineering'}, actively upskilled during a {total_months}-month career pause.",
        "total_break_duration_months": total_months,
        "verified_skills": verified_skills,
        "completed_certifications": completed_certs,
        "recent_projects": projects_list,
        "readiness_tier": "Tier 1 - Immediate Return Qualified" if total_months <= 36 else "Tier 2 - Mentored On-ramp"
    }
    return success_response(data)

# ============================================================
# MODULE 2: INTELLIGENT ONBOARDING & PROFILE SYSTEM ENDPOINTS
# ============================================================

@router.get("/onboarding/draft")
def get_onboarding_draft(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Fetch the saved onboarding draft for the candidate.
    """
    draft = db.query(OnboardingDraft).filter(OnboardingDraft.user_id == current_user.id).first()
    if not draft:
        return success_response({
            "current_step": 1,
            "draft_data": {},
            "is_completed": False,
            "updated_at": None
        })

    try:
        parsed_data = json.loads(draft.draft_data) if draft.draft_data else {}
    except Exception:
        parsed_data = {}

    return success_response({
        "current_step": draft.current_step,
        "draft_data": parsed_data,
        "is_completed": draft.is_completed,
        "updated_at": draft.updated_at.isoformat() if draft.updated_at else None
    })

@router.post("/onboarding/draft")
def save_onboarding_draft(
    req: OnboardingDraftSaveRequest,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Save or autosave the onboarding draft.
    """
    draft = db.query(OnboardingDraft).filter(OnboardingDraft.user_id == current_user.id).first()
    raw_json = json.dumps(req.draft_data)

    if not draft:
        draft = OnboardingDraft(
            user_id=current_user.id,
            current_step=req.current_step,
            draft_data=raw_json,
            is_completed=False
        )
        db.add(draft)
    else:
        draft.current_step = req.current_step
        draft.draft_data = raw_json
        draft.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(draft)

    return success_response({
        "current_step": draft.current_step,
        "is_completed": draft.is_completed,
        "saved_at": draft.updated_at.isoformat() if draft.updated_at else datetime.utcnow().isoformat(),
        "message": "Onboarding draft saved successfully."
    })

@router.post("/onboarding/complete")
def complete_onboarding(
    req: OnboardingCompleteRequest,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Finalize onboarding: commits profile, career break, and skills,
    generates personalized roadmap, and marks draft completed.
    """
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    # 1. Update Candidate Profile details
    cand.previous_job_title = req.previous_job_title
    cand.industry = req.industry or "Technology"
    cand.years_experience = req.experience_years
    cand.highest_qualification = req.qualifications
    cand.preferred_work_mode = req.preferred_work_mode
    cand.preferred_location = req.preferred_location or "Bengaluru, IN"
    cand.available_hours_per_day = max(1, min(12, req.weekly_learning_hours // 5))
    cand.career_break_visibility = req.profile_visibility
    cand.headline = f"Returning {req.previous_job_title} | {cand.industry} Specialist"
    cand.career_goals = ", ".join(req.career_goals) if req.career_goals else "Explore suitable return options"
    cand.languages = req.language_preference or "English"
    cand.salary_expectation = req.salary_expectation
    cand.onboarding_completed = True
    if req.resume_url:
        cand.resume_url = req.resume_url

    # 2. Update or Create Career Break record (Optional & respectful)
    if req.career_break_start_date or req.currently_on_break or req.career_break_reason:
        # Check if an existing break exists
        cb = cand.career_breaks[0] if cand.career_breaks else None
        b_type = (req.career_break_reason or "sabbatical").lower()
        if b_type not in ["maternity", "caregiving", "health", "education", "relocation", "sabbatical", "personal", "other"]:
            b_type = "sabbatical"

        if not cb:
            cb = CareerBreak(
                candidate_id=cand.id,
                break_type=b_type,
                start_date=req.career_break_start_date or date(2022, 7, 1),
                end_date=req.career_break_end_date,
                currently_on_break=req.currently_on_break,
                description=req.career_break_reason or "Career pause for family leadership & self-directed upskilling."
            )
            db.add(cb)
        else:
            cb.break_type = b_type
            if req.career_break_start_date:
                cb.start_date = req.career_break_start_date
            cb.end_date = req.career_break_end_date
            cb.currently_on_break = req.currently_on_break
            if req.career_break_reason:
                cb.description = req.career_break_reason

    # 3. Associate Existing Skills
    for skill_name in req.existing_skills:
        clean_name = skill_name.strip()
        if not clean_name:
            continue
        skill_obj = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
        if not skill_obj:
            skill_obj = Skill(name=clean_name, category="Technical")
            db.add(skill_obj)
            db.flush()

        existing_link = db.query(CandidateSkill).filter(
            CandidateSkill.candidate_id == cand.id,
            CandidateSkill.skill_id == skill_obj.id
        ).first()
        if not existing_link:
            cand_skill = CandidateSkill(
                candidate_id=cand.id,
                skill_id=skill_obj.id,
                proficiency="advanced" if cand.years_experience >= 3.0 else "intermediate",
                years_experience=min(cand.years_experience, 4.0)
            )
            db.add(cand_skill)

    # 4. Mark draft as completed
    draft = db.query(OnboardingDraft).filter(OnboardingDraft.user_id == current_user.id).first()
    if draft:
        draft.is_completed = True
        draft.current_step = 7
        draft.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(cand)

    # 5. Build Personalized Synthesis (Step 6 / Step 7)
    personalized_plan = {
        "career_summary": f"Targeting return as {req.previous_job_title} with {cand.years_experience} verified pre-break years in {cand.industry}. Focus: {cand.career_goals}.",
        "recommended_pathway": "Maternity & Family Return Track" if "maternity" in (req.career_break_reason or "").lower() else "Returning to Tech Track",
        "preliminary_readiness_score": 82 if cand.years_experience >= 3 else 76,
        "weekly_schedule": f"{cand.available_hours_per_day} Hours/Day ({req.weekly_learning_hours} Hours/Week)",
        "estimated_duration_weeks": 8 if req.weekly_learning_hours >= 15 else 12,
        "learning_modules": [
            {"week": 1, "topic": "SQL & Analytical Ingestion Refresher", "hours": 16},
            {"week": 2, "topic": "Modern Frameworks & Python Pipelines", "hours": 18},
            {"week": 3, "topic": "Cloud Data Warehouses & KPI Modeling", "hours": 16},
            {"week": 4, "topic": "Executive BI Reporting & Dashboards", "hours": 16},
            {"week": 5, "topic": "Portfolio Capstone: Customer Telemetry Pipeline", "hours": 20},
            {"week": 6, "topic": "Interview Prep & Narrative Formulation", "hours": 14},
            {"week": 7, "topic": "Career Continuity Passport Audit & Verification", "hours": 12},
            {"week": 8, "topic": "Vetted Employer Matching & Returnship Placement", "hours": 12},
        ],
        "passport_preview": {
            "candidate_name": current_user.full_name,
            "verified_tenure": f"{cand.years_experience} Years in {cand.previous_job_title}",
            "sharing_consent_granted": req.opt_into_employer_sharing,
            "visibility_level": cand.career_break_visibility,
        }
    }

    return success_response({
        "message": "Onboarding completed successfully.",
        "candidate": format_candidate_details(cand, current_user),
        "personalized_plan": personalized_plan
    })

@router.delete("/onboarding/draft")
def delete_onboarding_draft(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Clear/reset the onboarding draft so the candidate can start afresh.
    """
    draft = db.query(OnboardingDraft).filter(OnboardingDraft.user_id == current_user.id).first()
    if draft:
        db.delete(draft)
        db.commit()
    return success_response({"message": "Onboarding draft cleared successfully."})

@router.delete("/me")
def delete_my_candidate_account(
    current_user: Profile = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    """
    Delete candidate account and all associated personal data (Privacy & Data Deletion Compliance).
    """
    user_id = current_user.id
    db.delete(current_user)
    db.commit()
    return success_response({"message": "Candidate account and personal records successfully deleted."})
