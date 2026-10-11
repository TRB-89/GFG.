from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.models.application import Application
from backend.app.models.company import Company
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role
from backend.app.services.candidate_service import calculate_profile_completion
from backend.app.routers.jobs import format_job_item
from backend.app.routers.applications import format_application

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/candidate")
def get_candidate_dashboard(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.commit()
        db.refresh(cand)

    completion = calculate_profile_completion(cand, current_user)

    # Applications stats
    apps = db.query(Application).filter(Application.candidate_id == cand.id).order_by(Application.applied_at.desc()).all()
    stats = {
        "total": len(apps),
        "submitted": sum(1 for a in apps if a.status == "submitted"),
        "under_review": sum(1 for a in apps if a.status == "under_review"),
        "shortlisted": sum(1 for a in apps if a.status == "shortlisted"),
        "interview": sum(1 for a in apps if a.status == "interview"),
        "selected": sum(1 for a in apps if a.status == "selected"),
        "rejected": sum(1 for a in apps if a.status == "rejected"),
    }

    # Learning progress
    avg_learning = 0
    if cand.learning_progress:
        avg_learning = int(sum(lp.progress_percentage for lp in cand.learning_progress) / len(cand.learning_progress))

    # Recommended jobs with compatibility scores
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    job_items = [format_job_item(j, cand) for j in active_jobs]
    job_items.sort(key=lambda x: (x["compatibility"]["match_score"] if x["compatibility"] else 0), reverse=True)
    top_recommended = job_items[:6]

    # Career break status
    break_status = None
    break_months = 0
    if cand.career_breaks:
        latest_b = cand.career_breaks[0]
        break_status = f"{latest_b.break_type.capitalize()} Break"
        start_d = latest_b.start_date
        end_d = latest_b.end_date or date.today()
        break_months = max(1, (end_d.year - start_d.year) * 12 + (end_d.month - start_d.month))

    data = {
        "profile_completion": completion,
        "application_stats": stats,
        "learning_progress": avg_learning or 65, # default demo progress if newly initialized
        "skills_count": len(cand.skills),
        "career_break_status": break_status,
        "career_break_months": break_months,
        "recommended_jobs": top_recommended,
        "recent_applications": [format_application(a) for a in apps[:5]]
    }
    return success_response(data)

@router.get("/employer")
def get_employer_dashboard(
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    companies = current_user.companies
    if not companies:
        return success_response({
            "active_jobs": 0,
            "total_applications": 0,
            "shortlisted": 0,
            "new_applications": 0,
            "jobs": [],
            "recent_candidates": []
        })

    comp_ids = [c.id for c in companies]
    jobs = db.query(Job).filter(Job.company_id.in_(comp_ids)).order_by(Job.created_at.desc()).all()
    active_jobs_count = sum(1 for j in jobs if j.status == "active")

    job_ids = [j.id for j in jobs]
    apps = db.query(Application).filter(Application.job_id.in_(job_ids)).order_by(Application.applied_at.desc()).all()

    total_apps = len(apps)
    shortlisted_count = sum(1 for a in apps if a.status == "shortlisted")
    new_apps_count = sum(1 for a in apps if a.status == "submitted")

    data = {
        "active_jobs": active_jobs_count,
        "total_applications": total_apps,
        "shortlisted": shortlisted_count,
        "new_applications": new_apps_count,
        "jobs": [format_job_item(j) for j in jobs],
        "recent_candidates": [format_application(a) for a in apps[:10]]
    }
    return success_response(data)
