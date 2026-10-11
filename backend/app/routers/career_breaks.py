from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CareerBreak
from backend.app.schemas.candidate import CareerBreakCreate, CareerBreakUpdate, CareerBreakResponse
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/api/career-break", tags=["Career Break"])

def format_career_break(cb: CareerBreak) -> dict:
    start_d = cb.start_date
    end_d = cb.end_date or date.today()
    duration_months = max(1, (end_d.year - start_d.year) * 12 + (end_d.month - start_d.month))
    return {
        "id": cb.id,
        "candidate_id": cb.candidate_id,
        "break_type": cb.break_type,
        "start_date": cb.start_date.isoformat(),
        "end_date": cb.end_date.isoformat() if cb.end_date else None,
        "currently_on_break": cb.currently_on_break,
        "description": cb.description,
        "expected_return_date": cb.expected_return_date.isoformat() if cb.expected_return_date else None,
        "duration_months": duration_months,
        "created_at": cb.created_at.isoformat(),
        "updated_at": cb.updated_at.isoformat()
    }

@router.post("")
def create_career_break(
    req: CareerBreakCreate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    if req.end_date and req.start_date > req.end_date:
        return error_response("INVALID_DATE_RANGE", "Career break start date cannot be after end date.")

    cb = CareerBreak(
        candidate_id=cand.id,
        break_type=req.break_type,
        start_date=req.start_date,
        end_date=req.end_date,
        currently_on_break=req.currently_on_break,
        description=req.description,
        expected_return_date=req.expected_return_date
    )
    db.add(cb)
    db.commit()
    db.refresh(cb)
    return success_response(format_career_break(cb))

@router.get("")
def get_career_breaks(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])
    breaks = db.query(CareerBreak).filter(CareerBreak.candidate_id == cand.id).order_by(CareerBreak.start_date.desc()).all()
    return success_response([format_career_break(b) for b in breaks])

@router.put("/{id}")
def update_career_break(
    id: str,
    req: CareerBreakUpdate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    cb = db.query(CareerBreak).filter(CareerBreak.id == id, CareerBreak.candidate_id == cand.id).first()
    if not cb:
        return error_response("NOT_FOUND", "Career break record not found.")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(cb, k, v)

    if cb.end_date and cb.start_date > cb.end_date:
        return error_response("INVALID_DATE_RANGE", "Career break start date cannot be after end date.")

    db.commit()
    db.refresh(cb)
    return success_response(format_career_break(cb))

@router.delete("/{id}")
def delete_career_break(
    id: str,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return error_response("CANDIDATE_NOT_FOUND", "Candidate profile not found.")

    cb = db.query(CareerBreak).filter(CareerBreak.id == id, CareerBreak.candidate_id == cand.id).first()
    if not cb:
        return error_response("NOT_FOUND", "Career break record not found.")

    db.delete(cb)
    db.commit()
    return success_response({"message": "Career break record removed."})
