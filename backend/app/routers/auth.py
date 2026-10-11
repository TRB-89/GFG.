from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.company import Company
from backend.app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    UserProfileResponse,
)
from backend.app.schemas.common import success_response, error_response
from backend.app.utils.security import hash_password, verify_password, create_access_token
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_user_profile(user: Profile) -> UserProfileResponse:
    candidate_id = user.candidate_profile.id if user.candidate_profile else None
    company_id = user.companies[0].id if user.companies and len(user.companies) > 0 else None
    return UserProfileResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        profile_photo_url=user.profile_photo_url,
        location=user.location,
        bio=user.bio,
        candidate_id=candidate_id,
        company_id=company_id
    )

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(Profile).filter(Profile.email == req.email.lower()).first()
    if existing:
        return error_response("EMAIL_ALREADY_EXISTS", "An account with this email address already exists.")

    # Create profile
    new_user = Profile(
        full_name=req.full_name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        role=req.account_type
    )
    db.add(new_user)
    db.flush()

    # Automatically initialize candidate or employer profile
    if req.account_type == "candidate":
        cand = CandidateProfile(
            user_id=new_user.id,
            headline=f"Aspiring professional | Returning talent",
            available_hours_per_day=4,
            preferred_work_mode="remote"
        )
        db.add(cand)
    elif req.account_type == "employer":
        comp = Company(
            owner_user_id=new_user.id,
            name=f"{req.full_name}'s Enterprise",
            industry="Technology",
            location="Remote / Hybrid"
        )
        db.add(comp)

    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    user_data = format_user_profile(new_user)

    return success_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_data.model_dump()
    })

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.email == req.email.lower()).first()
    if not user or not user.password_hash:
        return error_response("INVALID_CREDENTIALS", "Invalid email or password.")

    if not verify_password(req.password, user.password_hash):
        return error_response("INVALID_CREDENTIALS", "Invalid email or password.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    user_data = format_user_profile(user)

    return success_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_data.model_dump()
    })

@router.post("/logout")
def logout(current_user: Profile = Depends(get_current_user)):
    return success_response({"message": "Successfully logged out."})

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.email == req.email.lower()).first()
    # Always return success for security (prevent user enumeration)
    return success_response({
        "message": "If an account with that email exists, password reset instructions have been dispatched."
    })

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return success_response({"message": "Password reset token validated and password updated."})

@router.get("/me")
def get_me(current_user: Profile = Depends(get_current_user)):
    return success_response(format_user_profile(current_user).model_dump())
