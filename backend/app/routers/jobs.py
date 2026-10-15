from typing import Optional, List, Dict, Any
from math import ceil
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.models.job import Job, JobSkill, SavedOpportunity, JobReport
from backend.app.models.application import Application
from backend.app.models.candidate import CandidateProfile, Skill
from backend.app.schemas.job import JobCreate, JobUpdate, JobResponse, JobReportCreate
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role, get_optional_user
from backend.app.services.matching_service import compute_compatibility_score

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

CAREER_SECTORS = [
    {"id": "software_it", "name": "Software and IT", "description": "Cloud, backend engineering, devops, and systems architecture."},
    {"id": "data_analytics", "name": "Data Analytics", "description": "BI, SQL pipelines, machine learning, and data reporting."},
    {"id": "teaching_education", "name": "Teaching and Education", "description": "Academic instruction, edtech curriculum design, and tutoring."},
    {"id": "healthcare", "name": "Healthcare and Allied Services", "description": "Clinical research, health informatics, and wellness support."},
    {"id": "banking_finance", "name": "Banking and Finance", "description": "Risk compliance, financial modeling, fintech, and accounting."},
    {"id": "human_resources", "name": "Human Resources", "description": "Talent acquisition, DEI initiatives, and workplace operations."},
    {"id": "administration", "name": "Administration", "description": "Executive assistance, office management, and program coordination."},
    {"id": "marketing", "name": "Marketing", "description": "Growth strategy, brand marketing, content design, and digital media."},
    {"id": "retail_support", "name": "Retail and Customer Support", "description": "Customer success management, escalation support, and omnichannel retail."},
    {"id": "gov_exams", "name": "Government Exam Pathways", "description": "Public sector prep pathways, civil service, and PSU opportunities."},
    {"id": "freelance_consulting", "name": "Freelancing and Consulting", "description": "Independent advisory contracts, client project consulting, and gigs."},
    {"id": "entrepreneurship", "name": "Entrepreneurship", "description": "Founder incubators, startup bootcamps, and small business support."}
]

OPPORTUNITY_TYPES = [
    {"id": "returnship", "name": "Returnships", "badge": "Structured Returnship"},
    {"id": "full_time", "name": "Full-Time Employment", "badge": "Full-Time"},
    {"id": "part_time", "name": "Part-Time Employment", "badge": "Part-Time"},
    {"id": "remote", "name": "Remote Employment", "badge": "Remote"},
    {"id": "hybrid", "name": "Hybrid Employment", "badge": "Hybrid"},
    {"id": "internship", "name": "Internships", "badge": "Internship"},
    {"id": "short_term_project", "name": "Short-Term Paid Projects", "badge": "Paid Project"},
    {"id": "freelance", "name": "Freelance Assignments", "badge": "Freelance"}
]

def format_job_item(job: Job, current_cand: Optional[CandidateProfile] = None, db: Optional[Session] = None) -> dict:
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
    is_saved = False
    is_applied = False
    app_status = None

    if current_cand:
        compat_data = compute_compatibility_score(current_cand, job)
        if db:
            saved_rec = db.query(SavedOpportunity).filter(
                SavedOpportunity.candidate_id == current_cand.id,
                SavedOpportunity.job_id == job.id
            ).first()
            is_saved = saved_rec is not None

            app_rec = db.query(Application).filter(
                Application.candidate_id == current_cand.id,
                Application.job_id == job.id
            ).first()
            if app_rec:
                is_applied = True
                app_status = app_rec.status

    # Salary formatting
    sal_desc = job.stipend_amount_description
    if not sal_desc and job.salary_min and job.salary_max:
        sal_desc = f"₹{int(job.salary_min):,} - ₹{int(job.salary_max):,} / month"
    elif not sal_desc and job.salary_min:
        sal_desc = f"From ₹{int(job.salary_min):,} / month"
    elif not sal_desc:
        sal_desc = "Stipend disclosed upon interview"

    # Eligibility formatting
    elig_desc = job.eligibility_criteria
    if not elig_desc:
        if job.minimum_break_months and job.minimum_break_months > 0:
            elig_desc = f"Requires career break >= {job.minimum_break_months} months with {job.minimum_experience}+ years past experience."
        else:
            elig_desc = "Welcoming all returning professionals. Zero penalty for caregiving or maternal pauses."

    # Learning objectives fallback
    learning_obj = job.learning_objectives
    if not learning_obj and job.employment_type == "returnship":
        learning_obj = "Structured curriculum including system design refreshers, pair programming, agile workflows, and senior mentor coaching."

    is_verified = bool(job.is_verified_employer) if job.is_verified_employer is not None else True
    if job.company and not job.company.verified:
        is_verified = False

    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else "Partner Company",
        "company_logo_url": job.company.logo_url if job.company else None,
        "title": job.title,
        "description": job.description,
        "employment_type": job.employment_type,
        "opportunity_type": job.opportunity_type or job.employment_type or "returnship",
        "sector": job.sector or "software_it",
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

        # Module 7: Returnship Engine specifics
        "stipend_or_salary_type": job.stipend_or_salary_type or "paid",
        "stipend_amount_description": sal_desc,
        "learning_objectives": learning_obj,
        "mentorship_available": job.mentorship_available if job.mentorship_available is not None else True,
        "eligibility_criteria": elig_desc,
        "conversion_rate_percentage": job.conversion_rate_percentage or (78 if job.permanent_conversion_possible else None),
        "external_application_url": job.external_application_url,

        # Module 7: Job Safety & Transparency
        "employer_verification_status": job.employer_verification_status or ("verified" if is_verified else "unverified_external"),
        "is_verified_employer": is_verified,
        "data_source": job.data_source or "verified_partner",
        "last_verified_at": job.last_verified_at.isoformat() if job.last_verified_at else job.created_at.isoformat(),
        "is_reported": bool(job.is_reported),
        "report_count": job.report_count or 0,
        "safety_audit": {
            "verified": is_verified,
            "badge": "GFG VERIFIED EMPLOYER" if is_verified else "UNVERIFIED EXTERNAL LISTING",
            "warning": None if is_verified else "Caution: Unverified external listing. Never pay fees for applications, training, or background checks.",
            "free_access_guarantee": "GFG does not charge candidates to search, view, or apply to basic opportunities."
        },

        # Candidate application & bookmark state
        "is_saved": is_saved,
        "is_applied": is_applied,
        "application_status": app_status,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat()
    }

@router.get("/sectors/all")
def get_all_sectors(db: Session = Depends(get_db)):
    """Returns all 12 career sectors and opportunity types with live job counts."""
    sector_counts = {}
    for s in CAREER_SECTORS:
        cnt = db.query(Job).filter(Job.sector == s["id"], Job.status == "active").count()
        sector_counts[s["id"]] = cnt

    type_counts = {}
    for ot in OPPORTUNITY_TYPES:
        cnt = db.query(Job).filter(
            or_(Job.opportunity_type == ot["id"], Job.employment_type == ot["id"]),
            Job.status == "active"
        ).count()
        type_counts[ot["id"]] = cnt

    return success_response({
        "sectors": [
            {**s, "active_jobs_count": sector_counts.get(s["id"], 0)}
            for s in CAREER_SECTORS
        ],
        "opportunity_types": [
            {**ot, "active_jobs_count": type_counts.get(ot["id"], 0)}
            for ot in OPPORTUNITY_TYPES
        ]
    })

@router.get("/returnships/curated")
def get_curated_returnships(
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Returns curated returnship programs with structured learning and conversion metrics."""
    jobs = db.query(Job).filter(
        or_(Job.employment_type == "returnship", Job.opportunity_type == "returnship"),
        Job.status == "active"
    ).order_by(Job.created_at.desc()).limit(10).all()

    current_cand = current_user.candidate_profile if (current_user and current_user.role == "candidate") else None
    data = [format_job_item(j, current_cand, db) for j in jobs]
    return success_response({
        "headline": "Structured Returnship Programs for Career Restarters",
        "description": "Paid on-ramps featuring dedicated 1:1 mentorship, refresher sprints, and verified pathways to permanent employment.",
        "returnships": data
    })

@router.get("")
def list_jobs(
    q: Optional[str] = Query(None, description="Search keyword in title, description, or company"),
    sector: Optional[str] = Query(None, description="Filter by career sector e.g. software_it, data_analytics"),
    opportunity_type: Optional[str] = Query(None, description="returnship, full_time, part_time, remote, hybrid, internship, short_term_project, freelance"),
    work_mode: Optional[str] = Query(None, description="remote, hybrid, onsite"),
    employment_type: Optional[str] = Query(None, description="Legacy filter matching employment_type"),
    location: Optional[str] = Query(None, description="City or region"),
    is_returnship: Optional[bool] = Query(None, description="Show only returnship opportunities"),
    is_verified_only: Optional[bool] = Query(None, description="Show only verified employer listings"),
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

    # Sector filter
    if sector:
        query = query.filter(Job.sector == sector.lower())

    # Opportunity type filter
    if opportunity_type:
        query = query.filter(
            or_(
                Job.opportunity_type == opportunity_type.lower(),
                Job.employment_type == opportunity_type.lower()
            )
        )

    # Returnship flag
    if is_returnship:
        query = query.filter(
            or_(
                Job.opportunity_type == "returnship",
                Job.employment_type == "returnship"
            )
        )

    # Verified only
    if is_verified_only:
        query = query.filter(Company.verified == True, Job.is_verified_employer == True)

    # Work mode filter
    if work_mode:
        query = query.filter(Job.work_mode == work_mode.lower())

    # Legacy employment type filter
    if employment_type and not opportunity_type:
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
    data = [format_job_item(j, current_cand, db) for j in jobs]

    # If candidate, sort by compatibility score
    if current_cand:
        data.sort(key=lambda x: (x["compatibility"]["match_score"] if x["compatibility"] else 0), reverse=True)

    return success_response({
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "sectors_available": [s["id"] for s in CAREER_SECTORS],
        "opportunity_types_available": [ot["id"] for ot in OPPORTUNITY_TYPES]
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
    return success_response(format_job_item(job, current_cand, db))

@router.post("/{job_id}/save")
def save_opportunity(
    job_id: str,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Privately bookmarks an opportunity for a candidate."""
    cand = current_user.candidate_profile
    if not cand:
        cand = CandidateProfile(user_id=current_user.id)
        db.add(cand)
        db.flush()

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.candidate_id == cand.id,
        SavedOpportunity.job_id == job.id
    ).first()

    if existing:
        return success_response({"message": "Opportunity already saved in your confidential bookmarks.", "job_id": job.id, "is_saved": True})

    new_saved = SavedOpportunity(candidate_id=cand.id, job_id=job.id)
    db.add(new_saved)
    db.commit()

    return success_response({
        "message": f"'{job.title}' saved to your confidential opportunities list.",
        "job_id": job.id,
        "is_saved": True
    })

@router.delete("/{job_id}/save")
def unsave_opportunity(
    job_id: str,
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Removes a bookmarked opportunity from a candidate's saved list."""
    cand = current_user.candidate_profile
    if not cand:
        return error_response("NOT_CANDIDATE", "Candidate profile not found.")

    saved_rec = db.query(SavedOpportunity).filter(
        SavedOpportunity.candidate_id == cand.id,
        SavedOpportunity.job_id == job_id
    ).first()

    if saved_rec:
        db.delete(saved_rec)
        db.commit()

    return success_response({
        "message": "Opportunity removed from saved bookmarks.",
        "job_id": job_id,
        "is_saved": False
    })

@router.get("/candidate/saved")
def list_saved_opportunities(
    current_user: Profile = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    """Retrieves all opportunities privately saved by the candidate."""
    cand = current_user.candidate_profile
    if not cand:
        return success_response([])

    saved_records = db.query(SavedOpportunity).filter(
        SavedOpportunity.candidate_id == cand.id
    ).order_by(SavedOpportunity.created_at.desc()).all()

    formatted_jobs = []
    for s in saved_records:
        if s.job:
            item = format_job_item(s.job, cand, db)
            item["saved_at"] = s.created_at.isoformat()
            formatted_jobs.append(item)

    return success_response(formatted_jobs)

@router.post("/{job_id}/report")
def report_opportunity(
    job_id: str,
    req: JobReportCreate,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Allows candidates to report suspicious or expired listings to ensure platform safety."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return error_response("JOB_NOT_FOUND", "Opportunity not found.")

    cand_id = current_user.candidate_profile.id if (current_user and current_user.candidate_profile) else None

    report = JobReport(
        job_id=job.id,
        candidate_id=cand_id,
        reason=req.reason,
        details=req.details
    )
    db.add(report)

    # Increment report count and flag if multiple reports
    job.report_count = (job.report_count or 0) + 1
    if job.report_count >= 3:
        job.is_reported = True

    db.commit()

    return success_response({
        "message": "Thank you for safeguarding the community. Your report has been submitted to the governance audit team.",
        "job_id": job.id,
        "report_id": report.id
    })

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
        opportunity_type=req.opportunity_type or req.employment_type,
        sector=req.sector or "software_it",
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
        status=req.status,
        employer_verification_status="verified" if comp.verified else "pending",
        is_verified_employer=bool(comp.verified),
        data_source="verified_partner",
        learning_objectives=req.learning_objectives,
        mentorship_available=req.mentorship_available,
        stipend_or_salary_type=req.stipend_or_salary_type or "paid",
        stipend_amount_description=req.stipend_amount_description,
        eligibility_criteria=req.eligibility_criteria,
        conversion_rate_percentage=req.conversion_rate_percentage
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
    return success_response(format_job_item(job, None, db))

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
    return success_response(format_job_item(job, None, db))

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
