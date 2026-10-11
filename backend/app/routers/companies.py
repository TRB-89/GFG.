from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import require_role, get_optional_user

router = APIRouter(prefix="/api/companies", tags=["Companies"])

def format_company(c: Company) -> dict:
    return {
        "id": c.id,
        "owner_user_id": c.owner_user_id,
        "name": c.name,
        "logo_url": c.logo_url,
        "industry": c.industry,
        "description": c.description,
        "website": c.website,
        "location": c.location,
        "company_size": c.company_size,
        "verified": c.verified,
        "created_at": c.created_at.isoformat(),
        "updated_at": c.updated_at.isoformat()
    }

@router.post("")
def create_company(
    req: CompanyCreate,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    comp = Company(
        owner_user_id=current_user.id,
        name=req.name,
        logo_url=req.logo_url,
        industry=req.industry,
        description=req.description,
        website=req.website,
        location=req.location,
        company_size=req.company_size,
        verified=True
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return success_response(format_company(comp))

@router.get("/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        return error_response("COMPANY_NOT_FOUND", "The requested company profile was not found.")
    return success_response(format_company(comp))

@router.put("/{company_id}")
def update_company(
    company_id: str,
    req: CompanyUpdate,
    current_user: Profile = Depends(require_role(["employer", "admin"])),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        return error_response("COMPANY_NOT_FOUND", "Company not found.")

    # Authorization check per Section 18: Employer can only edit their own company
    if current_user.role != "admin" and comp.owner_user_id != current_user.id:
        return error_response("FORBIDDEN", "You do not have permission to modify this company's details.")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(comp, k, v)

    db.commit()
    db.refresh(comp)
    return success_response(format_company(comp))
