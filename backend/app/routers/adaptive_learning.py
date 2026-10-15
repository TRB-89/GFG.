"""
Adaptive Learning Engine Router (Module 5)
Endpoints for generating customized learning plans, handling interruptions without punishment,
tracking accessible quizzes and practical tasks, and managing learning modes across professional sectors.
"""

import copy
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.ai import LearningRoadmap
from backend.app.middleware.auth_middleware import get_current_user
from backend.app.services.ai.adaptive_learning_engine import (
    LEARNING_MODES,
    SECTOR_CURRICULUMS,
    generate_adaptive_roadmap,
    adapt_roadmap_after_interruption,
    record_module_completion
)
from backend.app.services.ai.digital_twin_engine import record_digital_twin_event

router = APIRouter(prefix="/api/adaptive-learning", tags=["Adaptive Learning Engine"])


class GenerateRoadmapRequest(BaseModel):
    target_sector: str = Field(default="Data Analyst", description="Data Analyst, BI Specialist, Cloud & DevOps Associate, Full Stack Web, Technical Program Associate")
    weekly_hours: int = Field(default=15, ge=5, le=40, description="Available study hours per week")
    learning_mode: str = Field(default="focused_15min", description="microlearning_5min, focused_15min, structured_30min, weekend_intensive, self_paced")
    skills_to_skip: Optional[List[str]] = Field(default=None, description="Explicitly verified prior skills to skip beginner modules for")


class AdaptRoadmapRequest(BaseModel):
    strategy: str = Field(..., description="reschedule, reduce_workload, extend_target_date, reprioritize_essentials")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom parameters like new_weekly_hours or extension_weeks")


class CompleteModuleRequest(BaseModel):
    score: Optional[int] = Field(default=100, ge=0, le=100)
    artifact_url: Optional[str] = None
    reflection_note: Optional[str] = None
    mentor_review_requested: Optional[bool] = False


class SkipModuleRequest(BaseModel):
    reason: Optional[str] = "Demonstrated prior proficiency verified by candidate."


@router.get("/options")
async def get_adaptive_learning_options(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns available sectors, learning modes, adaptation strategies, and cost tier standards.
    """
    sectors_summary = []
    for key, val in SECTOR_CURRICULUMS.items():
        sectors_summary.append({
            "key": key,
            "title": val["sector_name"],
            "essential_skills": val.get("essential_skills", []),
            "module_count": len(val.get("modules", []))
        })

    adaptation_strategies = [
        {
            "id": "reschedule",
            "title": "Smooth Reschedule",
            "description": "Redistributes pending modules evenly across remaining weeks. Zero progress loss, zero punishment.",
            "recommended_for": "Missed a few days due to unexpected family or personal obligations."
        },
        {
            "id": "reduce_workload",
            "title": "Reduce Weekly Load",
            "description": "Lowers weekly hour commitment and switches to 5-minute microlearning pacing.",
            "recommended_for": "Caregiving or work load unexpectedly increased."
        },
        {
            "id": "extend_target_date",
            "title": "Extend Target Date",
            "description": "Grants 2 to 4 extra weeks buffer without affecting return readiness or scoring.",
            "recommended_for": "Need deeper immersion or more practice before portfolio capstones."
        },
        {
            "id": "reprioritize_essentials",
            "title": "Focus on Core Essentials",
            "description": "Archives non-critical electives, focusing strictly on returnship must-haves (~35% time saved).",
            "recommended_for": "Targeting an immediate returnship application deadline."
        }
    ]

    return {
        "learning_modes": LEARNING_MODES,
        "sectors": sectors_summary,
        "adaptation_strategies": adaptation_strategies,
        "resource_cost_tiers": [
            {"tier": "free", "label": "100% Free / Open Source", "description": "Accredited open courseware, Stanford/Harvard/MIT public archives"},
            {"tier": "paid", "label": "Paid Courseware", "description": "Commercial platform verified training"},
            {"tier": "official_certification", "label": "Official Industry Certification", "description": "Vendor-certified credentials (AWS, Microsoft, Google)"},
            {"tier": "non_certified_tutorial", "label": "Tutorial & Documentation", "description": "High-quality community tutorials and interactive playgrounds"},
            {"tier": "internal_practice", "label": "Internal GFG Practice", "description": "Curated exercises, code drills, and reflection notebooks"}
        ],
        "compliance_disclaimer": "GFG curates verified educational resources and does not issue government-accredited degrees directly."
    }


@router.get("/curriculum")
async def get_candidate_curriculum(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the candidate's active adaptive roadmap.
    If no active roadmap exists, generates a baseline customized roadmap.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found. Please complete initial onboarding."
        )

    active_rm = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand.id,
        LearningRoadmap.status == "active"
    ).order_by(LearningRoadmap.generated_at.desc()).first()

    needs_upgrade = (
        not active_rm 
        or not isinstance(active_rm.roadmap, dict) 
        or "disclaimer" not in active_rm.roadmap
        or "adaptation_history" not in active_rm.roadmap
    )

    if needs_upgrade:
        # Determine candidate sector
        target_sector = "Data Analyst"
        if cand.career_goals:
            for s_key in SECTOR_CURRICULUMS.keys():
                if s_key.lower() in cand.career_goals.lower():
                    target_sector = s_key
                    break
        elif cand.industry:
            for s_key in SECTOR_CURRICULUMS.keys():
                if s_key.lower() in cand.industry.lower():
                    target_sector = s_key
                    break

        weekly_hours = (cand.available_hours_per_day or 3) * 5
        roadmap_data = generate_adaptive_roadmap(
            cand=cand,
            target_sector=target_sector,
            weekly_hours=weekly_hours,
            learning_mode="focused_15min"
        )

        if active_rm:
            active_rm.target_role = target_sector
            active_rm.roadmap = roadmap_data
            flag_modified(active_rm, "roadmap")
            db.commit()
            db.refresh(active_rm)
        else:
            active_rm = LearningRoadmap(
                candidate_id=cand.id,
                target_role=target_sector,
                roadmap=roadmap_data,
                status="active"
            )
            db.add(active_rm)
            db.commit()
            db.refresh(active_rm)

    return {
        "roadmap_id": active_rm.id,
        "target_role": active_rm.target_role,
        "status": active_rm.status,
        "generated_at": active_rm.generated_at.isoformat() if active_rm.generated_at else None,
        "updated_at": active_rm.updated_at.isoformat() if active_rm.updated_at else None,
        "roadmap": active_rm.roadmap
    }


@router.post("/generate")
async def generate_candidate_roadmap(
    req: GenerateRoadmapRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a freshly tailored adaptive roadmap based on chosen sector,
    weekly availability hours, learning mode, and demonstrated skills to skip.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    roadmap_data = generate_adaptive_roadmap(
        cand=cand,
        target_sector=req.target_sector,
        weekly_hours=req.weekly_hours,
        learning_mode=req.learning_mode,
        skills_to_skip=req.skills_to_skip
    )

    # Archive previous active roadmaps
    db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand.id,
        LearningRoadmap.status == "active"
    ).update({"status": "archived"})

    new_rm = LearningRoadmap(
        candidate_id=cand.id,
        target_role=req.target_sector,
        roadmap=roadmap_data,
        status="active"
    )
    db.add(new_rm)
    db.commit()
    db.refresh(new_rm)

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="learning_roadmap_generated",
        summary=f"Generated adaptive roadmap for {req.target_sector} ({req.learning_mode}).",
        details={"sector": req.target_sector, "weekly_hours": req.weekly_hours, "mode": req.learning_mode},
        db=db
    )

    return {
        "message": "Customized adaptive roadmap successfully generated.",
        "roadmap_id": new_rm.id,
        "target_role": new_rm.target_role,
        "status": new_rm.status,
        "roadmap": new_rm.roadmap
    }


@router.post("/adapt")
async def adapt_interrupted_roadmap(
    req: AdaptRoadmapRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Applies non-punitive adaptation logic when life happens (illness, caregiving, schedule shifts).
    Zero penalties, zero progress loss.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    active_rm = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand.id,
        LearningRoadmap.status == "active"
    ).order_by(LearningRoadmap.generated_at.desc()).first()

    if not active_rm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found to adapt. Please generate a curriculum first."
        )

    adapted_data = adapt_roadmap_after_interruption(
        cand=cand,
        current_roadmap=active_rm.roadmap,
        strategy=req.strategy,
        parameters=req.parameters
    )

    active_rm.roadmap = adapted_data
    flag_modified(active_rm, "roadmap")
    db.commit()
    db.refresh(active_rm)

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="roadmap_adapted",
        summary=f"Adapted learning roadmap via '{req.strategy}' non-punitive strategy.",
        details={"strategy": req.strategy, "parameters": req.parameters},
        db=db
    )

    return {
        "message": f"Roadmap successfully adapted using {req.strategy}.",
        "roadmap_id": active_rm.id,
        "roadmap": active_rm.roadmap
    }


@router.post("/modules/{module_id}/complete")
async def complete_roadmap_module(
    module_id: str,
    req: CompleteModuleRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits quiz score, reflection, or artifact to deterministically mark module completed.
    Updates candidate learning progress and Digital Twin timeline.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    active_rm = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand.id,
        LearningRoadmap.status == "active"
    ).order_by(LearningRoadmap.generated_at.desc()).first()

    if not active_rm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found."
        )

    updated_data = record_module_completion(
        cand=cand,
        current_roadmap=active_rm.roadmap,
        module_id=module_id,
        submission_data={
            "score": req.score,
            "artifact_url": req.artifact_url,
            "reflection_note": req.reflection_note,
            "mentor_review_requested": req.mentor_review_requested
        },
        db=db
    )

    active_rm.roadmap = updated_data
    flag_modified(active_rm, "roadmap")
    db.commit()
    db.refresh(active_rm)

    return {
        "message": f"Module {module_id} marked as completed.",
        "module_id": module_id,
        "roadmap": active_rm.roadmap
    }


@router.post("/modules/{module_id}/skip")
async def skip_roadmap_module(
    module_id: str,
    req: SkipModuleRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows candidate to skip a beginner module where they already possess demonstrated proficiency,
    reclaiming learning hours without penalty.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    active_rm = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand.id,
        LearningRoadmap.status == "active"
    ).order_by(LearningRoadmap.generated_at.desc()).first()

    if not active_rm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active roadmap found."
        )

    updated_data = copy.deepcopy(active_rm.roadmap)
    module_found = False
    for week in updated_data.get("weekly_plan", []):
        for mod in week.get("modules", []):
            if mod.get("id") == module_id:
                mod["progress_state"] = "skipped_proficient"
                mod["completion_evidence"] = {
                    "reason": req.reason,
                    "skipped_by_user": True
                }
                module_found = True
                break
        if module_found:
            break

    if not module_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module {module_id} not found in active roadmap."
        )

    active_rm.roadmap = updated_data
    flag_modified(active_rm, "roadmap")
    db.commit()
    db.refresh(active_rm)

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="module_skipped_proficient",
        summary=f"Skipped module {module_id} due to demonstrated proficiency.",
        details={"module_id": module_id, "reason": req.reason},
        db=db
    )

    return {
        "message": f"Module {module_id} marked as skipped (proficient).",
        "module_id": module_id,
        "roadmap": active_rm.roadmap
    }
