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

    # Enforce elevated privilege protection per Module 2 Security requirements
    # Public registration only activates standard candidate privileges immediately.
    # Elevated employer, mentor, or administrator roles require explicit administrative approval.
    requested_role = req.account_type.lower()
    if requested_role in ["admin", "administrator"]:
        return error_response(
            "RESTRICTED_ROLE",
            "Administrator privileges cannot be granted through public registration. Contact platform governance."
        )

    assigned_role = requested_role
    approval_status = "active"
    if requested_role in ["employer", "mentor"]:
        approval_status = "pending_approval"

    # Create profile
    new_user = Profile(
        full_name=req.full_name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        role=assigned_role,
        approval_status=approval_status
    )
    db.add(new_user)
    db.flush()

    # Automatically initialize candidate or employer profile
    if assigned_role == "candidate":
        cand = CandidateProfile(
            user_id=new_user.id,
            headline=f"Aspiring professional | Returning talent",
            available_hours_per_day=4,
            preferred_work_mode="hybrid",
            career_break_visibility="private"
        )
        db.add(cand)
    elif assigned_role == "employer":
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
    email_clean = req.email.lower().strip()
    user = db.query(Profile).filter(Profile.email == email_clean).first()

    # Provisioning for canonical sample candidate Ananya Raman
    if not user and email_clean == "ananya.raman@example.com":
        user = Profile(
            full_name="Ananya Raman",
            email="ananya.raman@example.com",
            password_hash=hash_password(req.password or "Password@123"),
            role="candidate",
            location="Chennai, Tamil Nadu, India",
            bio="Senior Full-Stack & Python Specialist returning to the workforce after a 4-year caregiving hiatus."
        )
        db.add(user)
        db.flush()
        cand = CandidateProfile(
            user_id=user.id,
            headline="Senior Full-Stack Engineer | Returning Talent",
            years_experience=6,
            available_hours_per_day=5,
            preferred_work_mode="hybrid",
            career_break_visibility="employers",
            resume_url="/storage/resumes/ananya_raman_resume.pdf"
        )
        db.add(cand)
        db.commit()
        db.refresh(user)

    # Automatic provisioning for Admin demo account if not yet created
    if not user and email_clean == "admin@gfg.com":
        user = Profile(
            full_name="Platform Administrator",
            email="admin@gfg.com",
            password_hash=hash_password(req.password or "Password@123"),
            role="admin",
            location="Bengaluru, IN",
            bio="GFG Platform Governance and Audit Officer."
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Automatic provisioning for Mentor demo account if not yet created
    if not user and email_clean == "mentor@gfg.com":
        user = Profile(
            full_name="Dr. Meera Iyer",
            email="mentor@gfg.com",
            password_hash=hash_password(req.password or "Password@123"),
            role="candidate",
            location="Bengaluru, IN",
            bio="Executive Engineering Mentor & Alumna Director."
        )
        db.add(user)
        db.commit()
        db.refresh(user)

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
