"""
Career Future Simulator Router (Module 4)
Endpoints for running multi-scenario career simulations, saving scenarios, comparing scenarios,
and applying simulated outcomes to the candidate's learning roadmap.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, SavedSimulation, LearningProgress
from backend.app.middleware.auth_middleware import get_current_user
from backend.app.services.ai.career_simulator import (
    simulate_career_scenario,
    save_candidate_simulation,
    compare_two_simulations,
    SIMULATABLE_SKILLS,
    SIMULATABLE_QUALIFICATIONS,
    SIMULATABLE_INDUSTRIES,
    SIMULATABLE_PROJECTS,
    get_candidate_baseline
)
from backend.app.services.ai.digital_twin_engine import DOCUMENTED_OCCUPATIONS, record_digital_twin_event

router = APIRouter(prefix="/api/simulator", tags=["Career Future Simulator"])


class SimulateRequest(BaseModel):
    scenario_type: str = Field(..., description="learn_skill, earn_qualification, change_industry, switch_remote, adjust_availability, complete_project, start_returnship")
    scenario_name: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)


class SaveSimulationRequest(BaseModel):
    scenario_name: str
    scenario_type: str
    parameters: Dict[str, Any]
    results: Dict[str, Any]


class CompareRequest(BaseModel):
    simulation_a: Dict[str, Any]
    simulation_b: Dict[str, Any]


class ApplyToRoadmapRequest(BaseModel):
    skill_or_milestone: str
    category: Optional[str] = "Simulated Learning Milestone"
    estimated_hours: Optional[int] = 20
    weekly_target: Optional[int] = 1


@router.get("/options")
async def get_simulator_options(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns available skills, credentials, industries, projects, and target occupations for simulation configuration."""
    return {
        "skills": list(SIMULATABLE_SKILLS.keys()),
        "qualifications": list(SIMULATABLE_QUALIFICATIONS.keys()),
        "industries": list(SIMULATABLE_INDUSTRIES.keys()),
        "projects": list(SIMULATABLE_PROJECTS.keys()),
        "target_occupations": list(DOCUMENTED_OCCUPATIONS.keys()),
        "work_modes": ["Remote", "Hybrid", "In-Office"],
        "intensity_levels": [
            {"id": "relaxed", "label": "Relaxed (5-10 hrs/week)", "hours": 8},
            {"id": "steady", "label": "Steady (15-20 hrs/week)", "hours": 15},
            {"id": "intensive", "label": "Intensive (25-30 hrs/week)", "hours": 28}
        ]
    }


@router.get("/baseline")
async def get_simulator_baseline(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves current candidate baseline profile state."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    
    return get_candidate_baseline(cand)


@router.post("/simulate")
async def run_simulation(
    req: SimulateRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes a career future simulation given chosen scenario and parameters.
    Does NOT modify the candidate's verified profile credentials.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    result = simulate_career_scenario(cand, req.scenario_type, req.parameters)
    return result


@router.post("/save")
async def save_simulation(
    req: SaveSimulationRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves a simulation scenario for future reference and comparison."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    sim = save_candidate_simulation(
        db=db,
        cand=cand,
        scenario_name=req.scenario_name,
        scenario_type=req.scenario_type,
        parameters=req.parameters,
        results=req.results
    )

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="scenario_saved",
        summary=f"Saved career future simulation '{req.scenario_name}' ({req.scenario_type}).",
        details={"simulation_id": sim.id, "scenario_type": req.scenario_type},
        db=db
    )

    return {
        "status": "success",
        "id": sim.id,
        "message": f"Simulation '{req.scenario_name}' successfully saved."
    }


@router.get("/saved")
async def list_saved_simulations(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all saved simulations for the current candidate."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    sims = db.query(SavedSimulation).filter(
        SavedSimulation.candidate_id == cand.id
    ).order_by(SavedSimulation.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "scenario_name": s.scenario_name,
            "scenario_type": s.scenario_type,
            "parameters": s.parameters,
            "results": s.results,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sims
    ]


@router.delete("/saved/{simulation_id}")
async def delete_saved_simulation(
    simulation_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a saved simulation."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    sim = db.query(SavedSimulation).filter(
        SavedSimulation.id == simulation_id,
        SavedSimulation.candidate_id == cand.id
    ).first()

    if not sim:
        raise HTTPException(status_code=404, detail="Saved simulation not found")

    db.delete(sim)
    db.commit()
    return {"status": "success", "message": "Saved simulation deleted."}


@router.post("/compare")
async def compare_simulations_endpoint(
    req: CompareRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compares two simulations side-by-side."""
    return compare_two_simulations(req.simulation_a, req.simulation_b)


@router.post("/apply-to-roadmap")
async def apply_to_roadmap(
    req: ApplyToRoadmapRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds the simulated skill or milestone to candidate's active learning progress without corrupting verified skills."""
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    # Add as pending learning progress milestone
    progress = LearningProgress(
        candidate_id=cand.id,
        course_name=f"Simulated Milestone: {req.skill_or_milestone}",
        provider="GFG Adaptive Learning Path",
        category=req.category,
        progress_percentage=0,
        status="not_started"
    )
    db.add(progress)
    db.commit()

    record_digital_twin_event(
        candidate_id=cand.id,
        event_type="roadmap_milestone_added",
        summary=f"Added simulated milestone '{req.skill_or_milestone}' to learning roadmap.",
        details={"milestone": req.skill_or_milestone, "estimated_hours": req.estimated_hours},
        db=db
    )

    return {
        "status": "success",
        "message": f"Added '{req.skill_or_milestone}' to your 8-week learning schedule.",
        "progress_id": progress.id
    }
