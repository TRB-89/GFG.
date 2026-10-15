import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/upload", tags=["Storage"])

STORAGE_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
os.makedirs(os.path.join(STORAGE_ROOT, "resumes"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_ROOT, "avatars"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_ROOT, "certificates"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_ROOT, "company-logos"), exist_ok=True)

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate PDF only
    filename = file.filename or ""
    if not (filename.lower().endswith(".pdf") or file.content_type == "application/pdf"):
        return error_response("INVALID_FILE_TYPE", "Resume must be a PDF document.")

    # Read and validate size (5 MB max = 5 * 1024 * 1024)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        return error_response("FILE_TOO_LARGE", "Resume file exceeds maximum limit of 5 MB.")

    file_id = f"{uuid.uuid4()}_{filename.replace(' ', '_')}"
    target_path = os.path.join(STORAGE_ROOT, "resumes", file_id)
    with open(target_path, "wb") as f:
        f.write(content)

    # Secure non-public protected endpoint reference per Module 2 Security specs
    protected_url = f"/api/upload/resumes/{file_id}"

    # Automatically link to candidate profile
    cand = current_user.candidate_profile
    if cand:
        cand.resume_url = protected_url
        db.commit()

    return success_response({
        "url": protected_url,
        "filename": filename,
        "size_bytes": len(content),
        "content_type": file.content_type
    })

from backend.app.models.candidate import CandidateProfile
from backend.app.models.application import Application
from backend.app.models.job import Job
from backend.app.models.company import Company

@router.get("/resumes/{file_id}")
async def get_secure_resume(
    file_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Protected document retrieval: only authenticated and authorized users
    (the candidate themselves, vetted employers with active applications or consent, or admins)
    can access uploaded resumes.
    """
    clean_id = os.path.basename(file_id).replace("..", "").replace("/", "").replace("\\", "")
    target_path = os.path.join(STORAGE_ROOT, "resumes", clean_id)

    # Locate candidate owner of this document
    candidate_owner = db.query(CandidateProfile).filter(CandidateProfile.resume_url.contains(clean_id)).first()
    if not candidate_owner:
        app_owner = db.query(Application).filter(Application.resume_url.contains(clean_id)).first()
        if app_owner:
            candidate_owner = app_owner.candidate

    # Server-side access authorization check per Module 12 Security Audit
    if current_user.role == "admin":
        pass  # Platform admin has authorized governance audit access
    elif current_user.role == "candidate":
        cand_prof = current_user.candidate_profile
        if not cand_prof or (candidate_owner and candidate_owner.id != cand_prof.id) or (not candidate_owner and clean_id not in (cand_prof.resume_url or "")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "You do not have permission to access another user's private document."}
            )
    elif current_user.role == "employer":
        if candidate_owner:
            has_application = db.query(Application).join(Job).join(Company).filter(
                Application.candidate_id == candidate_owner.id,
                Company.owner_user_id == current_user.id
            ).first()
            is_consented = candidate_owner.career_break_visibility in ["employers", "public"]
            if not (has_application or is_consented):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"code": "FORBIDDEN", "message": "Access denied. Candidate has not consented to share documents with your organization."}
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Candidate document record not associated with your employer organization."}
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Unauthorized role for document retrieval."}
        )

    if not os.path.exists(target_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "FILE_NOT_FOUND", "message": "The requested document was not found."}
        )

    return FileResponse(target_path, media_type="application/pdf", filename=clean_id)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename or ""
    valid_exts = (".png", ".jpg", ".jpeg", ".webp")
    if not any(filename.lower().endswith(ext) for ext in valid_exts):
        return error_response("INVALID_FILE_TYPE", "Profile image must be PNG, JPEG, or WebP.")

    content = await file.read()
    if len(content) > 3 * 1024 * 1024:
        return error_response("FILE_TOO_LARGE", "Image file exceeds maximum limit of 3 MB.")

    file_id = f"{uuid.uuid4()}_{filename.replace(' ', '_')}"
    target_path = os.path.join(STORAGE_ROOT, "avatars", file_id)
    with open(target_path, "wb") as f:
        f.write(content)

    public_url = f"/storage/avatars/{file_id}"
    current_user.profile_photo_url = public_url
    db.commit()

    return success_response({
        "url": public_url,
        "filename": filename,
        "size_bytes": len(content)
    })

@router.post("/company-logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename or ""
    valid_exts = (".png", ".jpg", ".jpeg", ".webp", ".svg")
    if not any(filename.lower().endswith(ext) for ext in valid_exts):
        return error_response("INVALID_FILE_TYPE", "Company logo must be PNG, JPEG, WebP, or SVG.")

    content = await file.read()
    if len(content) > 3 * 1024 * 1024:
        return error_response("FILE_TOO_LARGE", "Logo file exceeds maximum limit of 3 MB.")

    file_id = f"{uuid.uuid4()}_{filename.replace(' ', '_')}"
    target_path = os.path.join(STORAGE_ROOT, "company-logos", file_id)
    with open(target_path, "wb") as f:
        f.write(content)

    public_url = f"/storage/company-logos/{file_id}"

    return success_response({
        "url": public_url,
        "filename": filename,
        "size_bytes": len(content)
    })
