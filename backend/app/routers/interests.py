from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, Interest, CandidateInterest
from backend.app.schemas.candidate import CandidateInterestCreate
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role

router = APIRouter(tags=["Interests"])

@router.get("/api/interests")
def list_all_interests(db: Session = Depends(get_db)):
    interests = db.query(Interest).order_by(Interest.category, Interest.name).all()
    return success_response([
        {"id": i.id, "name": i.name, "category": i.category}
        for i in interests
    ])

@router.post("/api/candidates/me/interests")
def add_candidate_interest(
    req: CandidateInterestCreate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    interest = db.query(Interest).filter(Interest.id == req.interest_id).first()
    if not interest:
        return error_response("INTEREST_NOT_FOUND", "The requested interest does not exist.")

    existing = db.query(CandidateInterest).filter(
        CandidateInterest.candidate_id == cand.id,
        CandidateInterest.interest_id == req.interest_id
    ).first()

    if existing:
        existing.priority = req.priority
        db.commit()
        db.refresh(existing)
        return success_response({
            "id": existing.id,
            "interest_id": interest.id,
            "name": interest.name,
            "category": interest.category,
            "priority": existing.priority
        })

    new_ci = CandidateInterest(
        candidate_id=cand.id,
        interest_id=interest.id,
        priority=req.priority
    )
    db.add(new_ci)
    db.commit()
    db.refresh(new_ci)

    return success_response({
        "id": new_ci.id,
        "interest_id": interest.id,
        "name": interest.name,
        "category": interest.category,
        "priority": new_ci.priority
    })

@router.get("/api/candidates/me/interests")
def get_candidate_interests(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])

    return success_response([
        {
            "id": ci.id,
            "interest_id": ci.interest_id,
            "name": ci.interest.name if ci.interest else "",
            "category": ci.interest.category if ci.interest else "",
            "priority": ci.priority
        }
        for ci in cand.interests
    ])
