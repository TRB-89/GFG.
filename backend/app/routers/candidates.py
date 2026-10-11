from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CareerBreak
from backend.app.schemas.candidate import (
    CandidateProfileUpdate,
    CandidateProfileResponse,
    CareerBreakResponse,
    CandidateSkillResponse,
    CandidateInterestResponse,
    CareerGapPassportResponse,
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
