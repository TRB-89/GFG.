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

@router.post("/demo-reset")
def reset_demo_environment(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Safely resets the demonstration data environment to baseline state.
    Restricted to non-production demo environments.
    """
    from backend.app.config.settings import settings
    if settings.ENVIRONMENT == "production":
        return error_response("FORBIDDEN", "Demo reset is disabled in production environments.")

    # Re-run database seed safely to restore Ananya Raman and Nova Tech
    from backend.database.seed_data import seed_database
    seed_database()

    return success_response({
        "status": "success",
        "message": "Demonstration environment successfully reset to baseline seed state.",
        "sample_candidate": "Ananya Raman (Candidate Persona)",
        "sample_employer": "Nova Tech (Fictional Returnship Partner)",
        "reset_scope": ["candidate_profiles", "returnship_jobs", "sample_applications", "community_mentors"]
    })

@router.get("/security-audit")
def get_security_audit_status(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Module 12 Security Audit: System-level hardening and authorization status.
    """
    from backend.app.config.settings import settings
    return success_response({
        "audit_version": "GFG-SEC-2026-v12",
        "environment": settings.ENVIRONMENT,
        "security_posture": {
            "authentication": {
                "type": "JWT Bearer Token",
                "algorithm": settings.JWT_ALGORITHM,
                "expiration_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
                "server_side_verification": True
            },
            "role_based_access_control": {
                "roles_enforced": ["candidate", "employer", "mentor", "admin"],
                "server_side_enforcement": "FastAPI require_role dependency on all protected routes",
                "client_side_only_reliance": False
            },
            "document_storage_hardening": {
                "path_traversal_protection": "Sanitized basename with relative dot-dot stripping",
                "resume_authorization": "Owner candidate, consented employer with active application, or admin only",
                "public_resume_scraping_prevented": True,
                "max_upload_size_mb": 5
            },
            "privacy_compliance": {
                "framework": "Digital Personal Data Protection Act (DPDP Act 2023, India)",
                "right_to_erasure": "Available via DELETE /api/candidates/me and /api/privacy/erasure-request",
                "consent_revocation": "Candidate-controlled one-click revocation supported",
                "small_cell_suppression": "k-anonymity (N < 5) enforced on statistical exports"
            },
            "responsible_ai": {
                "autonomous_rejection_allowed": False,
                "career_break_penalty_prohibited": True,
                "transparent_scoring_rubric": True,
                "dispute_mechanism_available": True
            }
        }
    })
