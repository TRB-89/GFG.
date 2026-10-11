from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.job import Job
from backend.app.models.application import Application
from backend.app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role
from backend.app.services.matching_service import compute_compatibility_score

router = APIRouter(tags=["Applications"])

def format_application(app: Application) -> dict:
    compat_score = None
    if app.candidate and app.job:
        compat = compute_compatibility_score(app.candidate, app.job)
        compat_score = compat["match_score"]

    return {
        "id": app.id,
        "job_id": app.job_id,
        "job_title": app.job.title if app.job else "Returnship Opportunity",
        "job_location": app.job.location if app.job else "",
        "job_work_mode": app.job.work_mode if app.job else "remote",
        "employment_type": app.job.employment_type if app.job else "returnship",
        "company_id": app.job.company_id if app.job else "",
        "company_name": app.job.company.name if (app.job and app.job.company) else "Enterprise Partner",
        "candidate_id": app.candidate_id,
        "candidate_name": app.candidate.user.full_name if (app.candidate and app.candidate.user) else "Applicant",
        "candidate_headline": app.candidate.headline if app.candidate else None,
        "candidate_experience": app.candidate.years_experience if app.candidate else 0.0,
        "status": app.status,
        "cover_note": app.cover_note,
        "resume_url": app.resume_url or (app.candidate.resume_url if app.candidate else None),
        "compatibility_score": compat_score,
        "applied_at": app.applied_at.isoformat(),
        "updated_at": app.updated_at.isoformat()
    }

@router.post("/api/jobs/{job_id}/apply")
def apply_to_job(
    job_id: str,
    req: ApplicationCreate,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "The requested opportunity could not be found.")

    if job.status != "active":
        return error_response("JOB_INACTIVE", "This opportunity is no longer accepting applications.")

    # Section 33: Duplicate application prevention
    existing = db.query(Application).filter(
        Application.candidate_id == cand.id,
        Application.job_id == job.id
    ).first()

    if existing:
        return error_response("DUPLICATE_APPLICATION", "You have already applied for this opportunity.")

    new_app = Application(
        candidate_id=cand.id,
        job_id=job.id,
        status="submitted",
        cover_note=req.cover_note,
        resume_url=req.resume_url or cand.resume_url
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return success_response(format_application(new_app))

@router.get("/api/candidates/me/applications")
def get_my_applications(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])

    apps = db.query(Application).filter(
        Application.candidate_id == cand.id
    ).order_by(Application.applied_at.desc()).all()

    return success_response([format_application(a) for a in apps])

@router.get("/api/employers/applications")
def get_employer_applications(
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    # Find all jobs owned by current employer's companies
    apps = db.query(Application).join(Job).join(Job.company).filter(
        Job.company.has(owner_user_id=current_user.id)
    ).order_by(Application.applied_at.desc()).all()

    return success_response([format_application(a) for a in apps])

@router.get("/api/jobs/{job_id}/applications")
def get_job_applications(
    job_id: str,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    if current_user.role != "admin" and job.company.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You can only view applications for your company's opportunities.")

    apps = db.query(Application).filter(Application.job_id == job_id).order_by(Application.applied_at.desc()).all()
    return success_response([format_application(a) for a in apps])

@router.patch("/api/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    req: ApplicationStatusUpdate,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        return error_response("APPLICATION_NOT_FOUND", "Application record not found.")

    # Authorization: Employer can only update applications to their own company's jobs
    if current_user.role != "admin" and app.job.company.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You do not have permission to manage this application.")

    app.status = req.status
    db.commit()
    db.refresh(app)

    return success_response(format_application(app))
