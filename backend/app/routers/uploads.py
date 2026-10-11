import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
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

    public_url = f"/storage/resumes/{file_id}"

    # Automatically link to candidate profile
    cand = current_user.candidate_profile
    if cand:
        cand.resume_url = public_url
        db.commit()

    return success_response({
        "url": public_url,
        "filename": filename,
        "size_bytes": len(content),
        "content_type": file.content_type
    })

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
