from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, Skill, CandidateSkill
from backend.app.schemas.candidate import CandidateSkillCreate
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role

router = APIRouter(tags=["Skills"])

@router.get("/api/skills")
def list_all_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.category, Skill.name).all()
    return success_response([
        {"id": s.id, "name": s.name, "category": s.category}
        for s in skills
    ])

@router.post("/api/candidates/me/skills")
def add_candidate_skill(
    req: CandidateSkillCreate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    if not skill:
        return error_response("SKILL_NOT_FOUND", "The requested skill does not exist.")

    # Check if already added
    existing = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.skill_id == req.skill_id
    ).first()

    if existing:
        existing.proficiency = req.proficiency
        existing.years_experience = req.years_experience
        existing.last_used_date = req.last_used_date
        db.commit()
        db.refresh(existing)
        return success_response({
            "id": existing.id,
            "skill_id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "proficiency": existing.proficiency,
            "years_experience": existing.years_experience
        })

    new_cs = CandidateSkill(
        candidate_id=cand.id,
        skill_id=skill.id,
        proficiency=req.proficiency,
        years_experience=req.years_experience,
        last_used_date=req.last_used_date
    )
    db.add(new_cs)
    db.commit()
    db.refresh(new_cs)

    return success_response({
        "id": new_cs.id,
        "skill_id": skill.id,
        "name": skill.name,
        "category": skill.category,
        "proficiency": new_cs.proficiency,
        "years_experience": new_cs.years_experience
    })

@router.get("/api/candidates/me/skills")
def get_candidate_skills(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])

    return success_response([
        {
            "id": cs.id,
            "skill_id": cs.skill_id,
            "name": cs.skill.name if cs.skill else "",
            "category": cs.skill.category if cs.skill else "",
            "proficiency": cs.proficiency,
            "years_experience": cs.years_experience
        }
        for cs in cand.skills
    ])

@router.delete("/api/candidates/me/skills/{skill_id}")
def delete_candidate_skill(
    skill_id: str,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    cs = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == cand.id,
        CandidateSkill.skill_id == skill_id
    ).first()

    if not cs:
        return error_response("NOT_FOUND", "Skill not attached to candidate profile.")

    db.delete(cs)
    db.commit()
    return success_response({"message": "Skill removed from profile."})
