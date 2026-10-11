from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.models.job import Job
from backend.app.models.application import Application
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/api/admin", tags=["Administration"])

@router.get("/statistics")
def get_platform_statistics(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(Profile).count()
    total_candidates = db.query(Profile).filter(Profile.role == "candidate").count()
    total_employers = db.query(Profile).filter(Profile.role == "employer").count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()

    return success_response({
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_employers": total_employers,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications
    })

@router.get("/users")
def list_users(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(Profile).order_by(Profile.created_at.desc()).limit(100).all()
    return success_response([
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "location": u.location,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ])

@router.get("/companies")
def list_companies(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    comps = db.query(Company).order_by(Company.created_at.desc()).all()
    return success_response([
        {
            "id": c.id,
            "name": c.name,
            "industry": c.industry,
            "location": c.location,
            "verified": c.verified,
            "jobs_count": len(c.jobs)
        }
        for c in comps
    ])

@router.patch("/companies/{company_id}/verify")
def verify_company(
    company_id: str,
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        return error_response("NOT_FOUND", "Company not found.")
    comp.verified = True
    db.commit()
    return success_response({"message": f"Company {comp.name} verified successfully."})
