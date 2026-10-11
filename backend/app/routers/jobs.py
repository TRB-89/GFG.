from typing import Optional, List
from math import ceil
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.models.job import Job, JobSkill
from backend.app.models.candidate import Skill
from backend.app.schemas.job import JobCreate, JobUpdate, JobResponse
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role, get_optional_user
from backend.app.services.matching_service import compute_compatibility_score

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

def format_job_item(job: Job, current_cand=None) -> dict:
    skills_list = []
    for js in job.job_skills:
        if js.skill:
            skills_list.append({
                "skill_id": js.skill_id,
                "name": js.skill.name,
                "importance": js.importance,
                "required": js.required
            })

    compat_data = None
    if current_cand:
        compat_data = compute_compatibility_score(current_cand, job)

    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else "Partner Company",
        "company_logo_url": job.company.logo_url if job.company else None,
        "title": job.title,
        "description": job.description,
        "employment_type": job.employment_type,
        "work_mode": job.work_mode,
        "location": job.location,
        "minimum_experience": job.minimum_experience,
        "minimum_break_months": job.minimum_break_months,
        "maximum_break_months": job.maximum_break_months,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "duration_months": job.duration_months,
        "hours_per_day": job.hours_per_day,
        "permanent_conversion_possible": job.permanent_conversion_possible,
        "application_deadline": job.application_deadline.isoformat() if job.application_deadline else None,
        "status": job.status,
        "skills": skills_list,
        "applications_count": len(job.applications) if job.applications else 0,
        "compatibility": compat_data,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat()
    }

@router.get("")
def list_jobs(
    q: Optional[str] = Query(None, description="Search keyword in title, description, or company"),
    work_mode: Optional[str] = Query(None, description="remote, hybrid, onsite"),
    employment_type: Optional[str] = Query(None, description="returnship, part_time, full_time, internship, contract"),
    location: Optional[str] = Query(None, description="City or region"),
    minimum_experience: Optional[float] = Query(None, description="Maximum required experience threshold"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).join(Company).filter(Job.status == "active")

    # Keyword search
    if q:
        kw = f"%{q.lower()}%"
        query = query.filter(
            or_(
                Job.title.ilike(kw),
                Job.description.ilike(kw),
                Company.name.ilike(kw)
            )
        )

    # Work mode filter
    if work_mode:
        query = query.filter(Job.work_mode == work_mode.lower())

    # Employment type filter
    if employment_type:
        query = query.filter(Job.employment_type == employment_type.lower())

    # Location filter
    if location:
        query = query.filter(Job.location.ilike(f"%{location.lower()}%"))

    # Minimum experience filter
    if minimum_experience is not None:
        query = query.filter(Job.minimum_experience <= minimum_experience)

    total = query.count()
    total_pages = max(1, ceil(total / limit))
    offset = (page - 1) * limit

    jobs = query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()

    current_cand = current_user.candidate_profile if (current_user and current_user.role == "candidate") else None
    data = [format_job_item(j, current_cand) for j in jobs]

    # If candidate, sort by compatibility score
    if current_cand:
        data.sort(key=lambda x: (x["compatibility"]["match_score"] if x["compatibility"] else 0), reverse=True)

    return success_response({
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    })

@router.get("/{job_id}")
def get_job_detail(
    job_id: str,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "The requested opportunity could not be found.")

    current_cand = current_user.candidate_profile if (current_user and current_user.role == "candidate") else None
    return success_response(format_job_item(job, current_cand))

@router.post("")
def create_job(
    req: JobCreate,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    # Find company owned by this employer
    comp = db.query(Company).filter(Company.owner_user_id == current_user.id).first()
    if not comp:
        return error_response("NO_COMPANY", "Please create a company profile first before posting opportunities.")

    job = Job(
        company_id=comp.id,
        title=req.title,
        description=req.description,
        employment_type=req.employment_type,
        work_mode=req.work_mode,
        location=req.location,
        minimum_experience=req.minimum_experience,
        minimum_break_months=req.minimum_break_months or 0,
        maximum_break_months=req.maximum_break_months,
        salary_min=req.salary_min,
        salary_max=req.salary_max,
        salary_currency=req.salary_currency,
        duration_months=req.duration_months,
        hours_per_day=req.hours_per_day,
        permanent_conversion_possible=req.permanent_conversion_possible,
        application_deadline=req.application_deadline,
        status=req.status
    )
    db.add(job)
    db.flush()

    for s_id in req.required_skill_ids:
        js = JobSkill(job_id=job.id, skill_id=s_id, importance="required", required=True)
        db.add(js)

    for s_id in req.preferred_skill_ids:
        js = JobSkill(job_id=job.id, skill_id=s_id, importance="preferred", required=False)
        db.add(js)

    db.commit()
    db.refresh(job)
    return success_response(format_job_item(job))

@router.put("/{job_id}")
def update_job(
    job_id: str,
    req: JobUpdate,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    if current_user.role != "admin" and job.company.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You can only edit opportunities owned by your company.")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(job, k, v)

    db.commit()
    db.refresh(job)
    return success_response(format_job_item(job))

@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    if current_user.role != "admin" and job.company.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You can only delete opportunities owned by your company.")

    db.delete(job)
    db.commit()
    return success_response({"message": "Job posting deleted successfully."})

@router.post("/{job_id}/publish")
def publish_job(
    job_id: str,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    if current_user.role != "admin" and job.company.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You can only publish opportunities owned by your company.")

    job.status = "active"
    db.commit()
    return success_response({"message": "Job published successfully.", "job_id": job.id})
