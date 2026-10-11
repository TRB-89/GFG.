from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role
from backend.app.services.matching_service import compute_compatibility_score
from backend.app.routers.jobs import format_job_item

router = APIRouter(prefix="/api/candidates/me/recommendations", tags=["Recommendations"])

@router.get("")
def get_recommendations(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Module 2 Rule-based matching endpoint.
    Module 3 AI Service will extend/replace this with semantic embeddings & pgvector.
    """
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])

    active_jobs = db.query(Job).filter(Job.status == "active").all()
    recommendations = []

    for job in active_jobs:
        score_data = compute_compatibility_score(cand, job)
        job_formatted = format_job_item(job, cand)
        recommendations.append({
            "job": job_formatted,
            "match_score": score_data["match_score"],
            "breakdown": score_data["breakdown"],
            "reasons": score_data["reasons"]
        })

    # Sort descending by match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return success_response(recommendations)
