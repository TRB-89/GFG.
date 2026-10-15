"""
GFG Module 3 — AI Career Digital Twin Router
Exposes secure endpoints for Digital Twin inspection, provenance-based skill management,
industry gap analysis, explainable pathways, knowledge graphs, and dynamic update auditing.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CandidateSkill, Skill, DigitalTwinEvent
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role
from backend.app.services.ai.digital_twin_engine import (
    get_digital_twin_profile,
    extract_potential_skills,
    analyze_industry_gaps,
    generate_career_pathways,
    build_career_knowledge_graph,
    record_digital_twin_event,
)

router = APIRouter(prefix="/api/digital-twin", tags=["AI Career Digital Twin"])

class ConfirmSkillRequest(BaseModel):
    skill_name: str
    proficiency: Optional[str] = "intermediate"

class CorrectSkillRequest(BaseModel):
    skill_id_or_name: str
    proficiency: str = Field(..., pattern="^(beginner|intermediate|advanced|expert)$")
    years_experience: Optional[float] = 1.0

class AddSkillRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = "Technical"
    proficiency: str = Field("intermediate", pattern="^(beginner|intermediate|advanced|expert)$")

class GapAnalysisRequest(BaseModel):
    target_role: Optional[str] = "Data Analyst"

@router.get("/profile")
def get_twin_profile_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Retrieves candidate's aggregated AI Career Digital Twin state."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    profile_data = get_digital_twin_profile(cand, db)
    return success_response(profile_data)

@router.get("/skills")
def get_skills_inventory_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns candidate's skill inventory tagged with provenance:
    - self_reported
    - ai_inferred (awaiting confirmation)
    - assessment_supported
    - independently_verified
    """
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    skills = extract_potential_skills(cand, db)
    return success_response(skills)

@router.post("/skills/confirm")
def confirm_skill_endpoint(
    req: ConfirmSkillRequest,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Allows user to confirm an AI-inferred skill, moving it to confirmed self-reported/verified status."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    clean_name = req.skill_name.strip()
    skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
    if not skill:
        skill = Skill(name=clean_name, category="Technical")
        db.add(skill)
        db.flush()

    cs = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.skill_id == skill.id
    ).first()

    if cs:
        cs.provenance = "self_reported"
        cs.confidence_score = 1.0
        cs.proficiency = req.proficiency or cs.proficiency or "intermediate"
        cs.source_detail = "Confirmed by Candidate"
    else:
        cs = CandidateSkill(
            candidate_id=cand.id,
            skill_id=skill.id,
            proficiency=req.proficiency or "intermediate",
            provenance="self_reported",
            confidence_score=1.0,
            source_detail="Confirmed from AI Suggestion"
        )
        db.add(cs)

    # Record dynamic update event
    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="skill_confirmed",
        summary=f"Candidate confirmed skill '{clean_name}' into active Digital Twin inventory.",
        details={"skill": clean_name, "proficiency": cs.proficiency},
        db=db
    )
    db.commit()

    return success_response({"message": f"Skill '{clean_name}' confirmed.", "skill_id": cs.id})

@router.post("/skills/correct")
def correct_skill_endpoint(
    req: CorrectSkillRequest,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Allows user to correct skill proficiency or experience."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    # Try finding by CandidateSkill.id or Skill.name
    cs = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.id == req.skill_id_or_name
    ).first()

    if not cs:
        skill = db.query(Skill).filter(Skill.name.ilike(req.skill_id_or_name)).first()
        if skill:
            cs = db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == cand.id,
                CandidateSkill.skill_id == skill.id
            ).first()

    if not cs:
        return error_response("SKILL_NOT_FOUND", "Skill record not found in candidate profile.")

    old_prof = cs.proficiency
    cs.proficiency = req.proficiency
    if req.years_experience is not None:
        cs.years_experience = req.years_experience
    cs.source_detail = "Calibrated by Candidate"

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="skill_corrected",
        summary=f"Calibrated '{cs.skill.name if cs.skill else 'Skill'}' proficiency from {old_prof} to {req.proficiency}.",
        details={"proficiency": req.proficiency, "years_experience": req.years_experience},
        db=db
    )
    db.commit()

    return success_response({"message": "Skill proficiency calibrated successfully."})

@router.delete("/skills/{skill_identifier}")
def remove_skill_endpoint(
    skill_identifier: str,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Allows candidate to remove inaccurate or unwanted skills from her Digital Twin."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    cs = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.id == skill_identifier
    ).first()

    if not cs:
        skill = db.query(Skill).filter(Skill.name.ilike(skill_identifier)).first()
        if skill:
            cs = db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == cand.id,
                CandidateSkill.skill_id == skill.id
            ).first()

    skill_name = cs.skill.name if cs and cs.skill else skill_identifier
    if cs:
        db.delete(cs)

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="skill_removed",
        summary=f"Candidate removed '{skill_name}' from Digital Twin inventory.",
        details={"skill": skill_name},
        db=db
    )
    db.commit()

    return success_response({"message": f"Skill '{skill_name}' removed from Digital Twin."})

@router.post("/skills/add")
def add_skill_endpoint(
    req: AddSkillRequest,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Candidate manually adds a self-reported skill."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    clean_name = req.name.strip()
    skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
    if not skill:
        skill = Skill(name=clean_name, category=req.category or "Technical")
        db.add(skill)
        db.flush()

    existing = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.skill_id == skill.id
    ).first()

    if not existing:
        cs = CandidateSkill(
            candidate_id=cand.id,
            skill_id=skill.id,
            proficiency=req.proficiency,
            provenance="self_reported",
            confidence_score=1.0,
            source_detail="Manual Candidate Entry"
        )
        db.add(cs)

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="skill_added",
        summary=f"Added self-reported skill '{clean_name}' ({req.proficiency}).",
        details={"skill": clean_name, "proficiency": req.proficiency},
        db=db
    )
    db.commit()

    return success_response({"message": f"Skill '{clean_name}' added to Digital Twin."})

@router.get("/gap-analysis")
def get_gap_analysis_endpoint(
    target_role: str = Query("Data Analyst"),
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Calculates industry gap analysis against documented requirements for target role."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    data = analyze_industry_gaps(cand, target_role, db)
    return success_response(data)

@router.get("/pathways")
def get_career_pathways_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Recommends up to 5 suitable pathways with explainable rationale."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    pathways = generate_career_pathways(cand, db)
    return success_response(pathways)

@router.get("/knowledge-graph")
def get_knowledge_graph_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Returns visual, accessible graph: Roles → Skills → Transferable Skills → Career Options → Learning Requirements."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    graph_data = build_career_knowledge_graph(cand, db)
    return success_response(graph_data)

@router.get("/history")
def get_history_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Returns history log of changes to the Digital Twin."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    events = db.query(DigitalTwinEvent).filter(
        DigitalTwinEvent.candidate_id == cand.id
    ).order_by(DigitalTwinEvent.created_at.desc()).limit(50).all()

    items = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "summary": e.summary,
            "details": e.details,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in events
    ]
    return success_response(items)

@router.post("/refresh")
def refresh_digital_twin_endpoint(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Triggers dynamic recalibration of the Digital Twin."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    # Record refresh event
    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="twin_refreshed",
        summary="Digital Twin intelligence recalibrated with latest confirmed profile credentials.",
        details={"refreshed_at": datetime.now(timezone.utc).isoformat()},
        db=db
    )
    db.commit()

    profile_data = get_digital_twin_profile(cand, db)
    return success_response({
        "message": "AI Career Digital Twin successfully updated.",
        "profile": profile_data
    })
