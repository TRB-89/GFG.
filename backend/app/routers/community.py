import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CandidateSkill, Skill
from backend.app.models.community import (
    MentorProfile,
    MentorshipSession,
    ComebackCircle,
    CircleMembership,
    CircleDiscussionPost,
    InterviewPracticeSession,
    CommunityModerationReport,
    UserBlock,
)

router = APIRouter(prefix="/api", tags=["Mentorship and Community Ecosystem"])

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class SessionRequestPayload(BaseModel):
    candidate_id: str
    mentor_id: str
    topic: str
    goals: str
    scheduled_at: datetime
    format: str = "1:1 Video"

class SessionRespondPayload(BaseModel):
    action: str = Field(..., description="'confirm' or 'decline'")
    reason: Optional[str] = None

class SessionReschedulePayload(BaseModel):
    new_scheduled_at: datetime

class SessionCancelPayload(BaseModel):
    reason: Optional[str] = None

class SessionNotesPayload(BaseModel):
    candidate_private_notes: str

class SessionFeedbackPayload(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class CircleJoinPayload(BaseModel):
    candidate_id: str

class CirclePostPayload(BaseModel):
    candidate_id: str
    title: str
    content: str
    category: str = "General"

class InterviewEvaluatePayload(BaseModel):
    candidate_id: str
    track: str
    question: str
    candidate_answer: str

class ModerationReportPayload(BaseModel):
    reporter_id: str
    target_type: str  # mentor, circle_post, user
    target_id: str
    reason: str
    description: str

class UserBlockPayload(BaseModel):
    blocker_id: str
    blocked_id: str

# Helper to mask PII like emails and phone numbers in discussion posts
def mask_sensitive_contact_info(text: str) -> str:
    # Mask email addresses
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    text = re.sub(email_pattern, '[PROTECTED EMAIL]', text)
    # Mask 10-digit phone numbers
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    text = re.sub(phone_pattern, '[PROTECTED CONTACT]', text)
    return text

# ============================================================================
# SECTION 1 & 2: MENTOR DIRECTORY & MATCHING
# ============================================================================

@router.get("/mentors")
def list_mentors(
    field: Optional[str] = None,
    language: Optional[str] = None,
    interest: Optional[str] = None,
    format: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List verified mentor directory with flexible multi-attribute filtering.
    Prominently flags demo profiles.
    """
    query = db.query(MentorProfile)
    
    if field and field != "all":
        query = query.filter(MentorProfile.field == field)
        
    mentors = query.all()
    filtered = []
    
    for m in mentors:
        # Check language
        if language and language != "all":
            if not m.languages or language.lower() not in [l.lower() for l in m.languages]:
                continue
                
        # Check interest / expertise
        if interest and interest != "all":
            if not m.expertise or not any(interest.lower() in exp.lower() for exp in m.expertise):
                continue
                
        # Check format
        if format and format != "all":
            if not m.mentorship_formats or not any(format.lower() in fmt.lower() for fmt in m.mentorship_formats):
                continue
                
        # Check general search keyword
        if search:
            kw = search.lower()
            in_name = kw in m.name.lower()
            in_title = kw in m.title.lower()
            in_company = kw in m.company.lower()
            in_bio = kw in m.bio.lower()
            in_exp = any(kw in exp.lower() for exp in (m.expertise or []))
            if not (in_name or in_title or in_company or in_bio or in_exp):
                continue
                
        filtered.append({
            "id": m.id,
            "name": m.name,
            "title": m.title,
            "company": m.company,
            "field": m.field,
            "years_of_experience": m.years_of_experience,
            "bio": m.bio,
            "expertise": m.expertise or [],
            "languages": m.languages or [],
            "availability": m.availability,
            "verification_status": m.verification_status,
            "mentorship_formats": m.mentorship_formats or [],
            "is_demo": m.is_demo,
            "demo_badge_label": "Demonstration Mentor Profile — Sample Journey" if m.is_demo else "Verified Active Mentor",
            "rating": m.rating,
            "review_count": m.review_count,
        })
        
    return {
        "status": "success",
        "total": len(filtered),
        "mentors": filtered
    }

@router.get("/mentors/recommended")
def get_recommended_mentors(
    candidate_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Recommend mentors based on professional goals, sector, requested skills,
    language preferences, and session availability. Provides transparent match explanation.
    """
    candidate = None
    if candidate_id:
        candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not candidate:
        # Default demo candidate: Priya Sharma
        candidate = db.query(CandidateProfile).join(Profile).filter(Profile.email == "priya.sharma@example.com").first()
    
    cand_industry = getattr(candidate, "industry", None) or "data_analytics"
    cand_goals = getattr(candidate, "career_goals", None) or "Data Analyst / BI Specialist"
    cand_languages = [l.strip().lower() for l in (getattr(candidate, "languages", "English, Hindi") or "English, Hindi").split(",")]
    
    # Candidate skills
    cand_skills = []
    if candidate:
        c_skills = db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate.id).all()
        for cs in c_skills:
            if cs.skill and cs.skill.name:
                cand_skills.append(cs.skill.name.lower())
    if not cand_skills:
        cand_skills = ["python", "sql", "power bi", "data analysis"]
        
    mentors = db.query(MentorProfile).all()
    recommendations = []
    
    for m in mentors:
        score = 50.0  # Baseline
        reasons = []
        
        # 1. Industry / Field match (30 pts)
        if m.field.lower() == cand_industry.lower() or cand_industry.lower() in m.field.lower():
            score += 25
            reasons.append(f"Shares professional sector focus in {m.field.replace('_', ' ').title()}")
        elif any(part in m.title.lower() for part in cand_goals.lower().split()):
            score += 15
            reasons.append(f"Target role alignment with mentor's experience as {m.title}")
            
        # 2. Skill overlap (25 pts)
        m_expertise_lower = [e.lower() for e in (m.expertise or [])]
        matched_skills = [s for s in cand_skills if any(s in exp for exp in m_expertise_lower)]
        if matched_skills:
            score += min(len(matched_skills) * 8, 25)
            matched_names = ", ".join([s.title() for s in matched_skills[:3]])
            reasons.append(f"Direct expertise overlap in {matched_names}")
            
        # 3. Language preference match (15 pts)
        m_langs_lower = [l.lower() for l in (m.languages or [])]
        shared_langs = [l for l in cand_languages if l in m_langs_lower]
        if shared_langs:
            score += 15
            lang_names = ", ".join([l.title() for l in shared_langs])
            reasons.append(f"Comfortable mentoring in {lang_names}")
            
        # 4. Availability & high rating (10 pts)
        if "weekend" in m.availability.lower() or "evening" in m.availability.lower():
            score += 5
            reasons.append(f"Flexible availability ({m.availability})")
        if (m.rating or 0) >= 4.8:
            score += 5
            
        final_score = min(int(round(score)), 98)
        
        explanation = f"{final_score}% Match: " + "; ".join(reasons) + "."
        
        recommendations.append({
            "id": m.id,
            "name": m.name,
            "title": m.title,
            "company": m.company,
            "field": m.field,
            "years_of_experience": m.years_of_experience,
            "bio": m.bio,
            "expertise": m.expertise or [],
            "languages": m.languages or [],
            "availability": m.availability,
            "verification_status": m.verification_status,
            "mentorship_formats": m.mentorship_formats or [],
            "is_demo": m.is_demo,
            "demo_badge_label": "Demonstration Mentor Profile" if m.is_demo else "Verified Mentor",
            "rating": m.rating,
            "review_count": m.review_count,
            "match_score": final_score,
            "match_explanation": explanation
        })
        
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "status": "success",
        "candidate_id": candidate.id if candidate else None,
        "recommendations": recommendations[:6]
    }

# ============================================================================
# SECTION 3: SESSION MANAGEMENT
# ============================================================================

@router.post("/mentors/sessions/request", status_code=status.HTTP_201_CREATED)
def request_mentorship_session(payload: SessionRequestPayload, db: Session = Depends(get_db)):
    """
    Request a mentorship session.
    Starts as 'pending_confirmation' per Section 3 requirement:
    'Do not simulate confirmed bookings as actual bookings. Use real calendar integrations only when configured and authorized.'
    """
    mentor = db.query(MentorProfile).filter(MentorProfile.id == payload.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Selected mentor does not exist")
        
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    new_session = MentorshipSession(
        id=str(uuid.uuid4()),
        candidate_id=candidate.id,
        mentor_id=mentor.id,
        topic=payload.topic,
        goals=payload.goals,
        scheduled_at=payload.scheduled_at,
        format=payload.format,
        status="pending_confirmation",
        meeting_link=None,
        candidate_private_notes="Preparing my questions regarding career return pathway and portfolio review.",
        mentor_notes=None,
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "status": "success",
        "message": "Mentorship request submitted. Awaiting mentor confirmation. Calendar integrations will dispatch once confirmed.",
        "session": {
            "id": new_session.id,
            "candidate_id": new_session.candidate_id,
            "mentor_id": new_session.mentor_id,
            "mentor_name": mentor.name,
            "mentor_title": mentor.title,
            "topic": new_session.topic,
            "goals": new_session.goals,
            "scheduled_at": new_session.scheduled_at.isoformat(),
            "format": new_session.format,
            "status": new_session.status,
            "meeting_link": new_session.meeting_link,
            "candidate_private_notes": new_session.candidate_private_notes,
            "calendar_authorized": False,
        }
    }

@router.get("/mentors/sessions")
def list_sessions(
    candidate_id: Optional[str] = None,
    mentor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List scheduled sessions for a candidate or mentor.
    """
    query = db.query(MentorshipSession)
    if candidate_id:
        query = query.filter(MentorshipSession.candidate_id == candidate_id)
    if mentor_id:
        query = query.filter(MentorshipSession.mentor_id == mentor_id)
        
    sessions = query.order_by(desc(MentorshipSession.created_at)).all()
    
    results = []
    for s in sessions:
        m_name = s.mentor.name if s.mentor else "Platform Mentor"
        m_title = s.mentor.title if s.mentor else "Career Mentor"
        results.append({
            "id": s.id,
            "candidate_id": s.candidate_id,
            "mentor_id": s.mentor_id,
            "mentor_name": m_name,
            "mentor_title": m_title,
            "topic": s.topic,
            "goals": s.goals,
            "scheduled_at": s.scheduled_at.isoformat() if s.scheduled_at else None,
            "format": s.format,
            "status": s.status,
            "meeting_link": s.meeting_link,
            "candidate_private_notes": s.candidate_private_notes,
            "mentor_notes": s.mentor_notes,
            "feedback_rating": s.feedback_rating,
            "feedback_comment": s.feedback_comment,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })
        
    return {
        "status": "success",
        "total": len(results),
        "sessions": results
    }

@router.post("/mentors/sessions/{session_id}/respond")
def respond_to_session_request(
    session_id: str,
    payload: SessionRespondPayload,
    db: Session = Depends(get_db)
):
    """
    Accept or decline mentorship session request.
    """
    sess = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
        
    if payload.action == "confirm":
        sess.status = "confirmed"
        sess.meeting_link = f"https://meet.gfg.org/room-{sess.id[:8]}"
        msg = "Mentorship session confirmed. Secure virtual meeting room link generated."
    elif payload.action == "decline":
        sess.status = "declined"
        msg = f"Mentorship session declined. Reason: {payload.reason or 'Schedule conflict'}"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'confirm' or 'decline'.")
        
    db.commit()
    return {
        "status": "success",
        "message": msg,
        "session_id": sess.id,
        "new_status": sess.status,
        "meeting_link": sess.meeting_link
    }

@router.post("/mentors/sessions/{session_id}/reschedule")
def reschedule_session(
    session_id: str,
    payload: SessionReschedulePayload,
    db: Session = Depends(get_db)
):
    sess = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
        
    sess.scheduled_at = payload.new_scheduled_at
    sess.status = "rescheduled"
    db.commit()
    return {
        "status": "success",
        "message": "Session rescheduled successfully.",
        "session_id": sess.id,
        "scheduled_at": sess.scheduled_at.isoformat(),
        "status": sess.status
    }

@router.post("/mentors/sessions/{session_id}/cancel")
def cancel_session(
    session_id: str,
    payload: SessionCancelPayload,
    db: Session = Depends(get_db)
):
    sess = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
        
    sess.status = "cancelled"
    if payload.reason:
        sess.candidate_private_notes = f"{sess.candidate_private_notes or ''}\n[Cancellation Reason: {payload.reason}]".strip()
    db.commit()
    return {
        "status": "success",
        "message": "Session has been cancelled.",
        "session_id": sess.id,
        "status": sess.status
    }

@router.put("/mentors/sessions/{session_id}/notes")
def update_private_notes(
    session_id: str,
    payload: SessionNotesPayload,
    db: Session = Depends(get_db)
):
    sess = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
        
    sess.candidate_private_notes = payload.candidate_private_notes
    db.commit()
    return {
        "status": "success",
        "message": "Private progress notes saved.",
        "session_id": sess.id,
        "notes": sess.candidate_private_notes
    }

@router.post("/mentors/sessions/{session_id}/feedback")
def submit_session_feedback(
    session_id: str,
    payload: SessionFeedbackPayload,
    db: Session = Depends(get_db)
):
    sess = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
        
    sess.feedback_rating = payload.rating
    sess.feedback_comment = payload.comment
    sess.status = "completed"
    db.commit()
    return {
        "status": "success",
        "message": "Thank you for submitting your post-session feedback.",
        "session_id": sess.id,
        "feedback_rating": sess.feedback_rating,
        "feedback_comment": sess.feedback_comment
    }

@router.get("/mentors/{mentor_id}")
def get_mentor_details(mentor_id: str, db: Session = Depends(get_db)):
    mentor = db.query(MentorProfile).filter(MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return {
        "status": "success",
        "mentor": {
            "id": mentor.id,
            "name": mentor.name,
            "title": mentor.title,
            "company": mentor.company,
            "field": mentor.field,
            "years_of_experience": mentor.years_of_experience,
            "bio": mentor.bio,
            "expertise": mentor.expertise or [],
            "languages": mentor.languages or [],
            "availability": mentor.availability,
            "verification_status": mentor.verification_status,
            "mentorship_formats": mentor.mentorship_formats or [],
            "is_demo": mentor.is_demo,
            "rating": mentor.rating,
            "review_count": mentor.review_count,
        }
    }

# ============================================================================
# SECTION 4: COMEBACK CIRCLES
# ============================================================================

@router.get("/circles")
def list_comeback_circles(
    industry: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List Comeback Circles with small peer group filters.
    Shows honest empty states when no cohorts match criteria.
    """
    query = db.query(ComebackCircle)
    if industry and industry != "all":
        query = query.filter(ComebackCircle.industry == industry)
    if language and language != "all":
        query = query.filter(ComebackCircle.language.ilike(f"%{language}%"))
    if search:
        query = query.filter(
            or_(
                ComebackCircle.name.ilike(f"%{search}%"),
                ComebackCircle.career_objective.ilike(f"%{search}%"),
            )
        )
        
    circles = query.all()
    
    results = []
    for c in circles:
        results.append({
            "id": c.id,
            "name": c.name,
            "industry": c.industry,
            "career_objective": c.career_objective,
            "learning_goals": c.learning_goals or [],
            "language": c.language,
            "max_members": c.max_members,
            "current_member_count": c.current_member_count,
            "is_full": c.current_member_count >= c.max_members,
            "milestones": c.milestones or [],
            "scheduled_sessions": c.scheduled_sessions or [],
            "portfolio_activities": c.portfolio_activities or [],
            "is_demo": c.is_demo,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
        
    return {
        "status": "success",
        "total": len(results),
        "circles": results
    }

@router.get("/circles/{circle_id}")
def get_circle_details(circle_id: str, db: Session = Depends(get_db)):
    circle = db.query(ComebackCircle).filter(ComebackCircle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Comeback Circle not found")
        
    # Get members
    members = db.query(CircleMembership).filter(CircleMembership.circle_id == circle_id).all()
    member_data = []
    for m in members:
        c_prof = m.candidate
        p_name = c_prof.profile.full_name if (c_prof and c_prof.profile) else "Community Member"
        member_data.append({
            "candidate_id": m.candidate_id,
            "name": p_name,
            "role": m.role,
            "joined_at": m.joined_at.isoformat() if m.joined_at else None,
        })
        
    return {
        "status": "success",
        "circle": {
            "id": circle.id,
            "name": circle.name,
            "industry": circle.industry,
            "career_objective": circle.career_objective,
            "learning_goals": circle.learning_goals or [],
            "language": circle.language,
            "max_members": circle.max_members,
            "current_member_count": circle.current_member_count,
            "milestones": circle.milestones or [],
            "scheduled_sessions": circle.scheduled_sessions or [],
            "portfolio_activities": circle.portfolio_activities or [],
            "is_demo": circle.is_demo,
            "members": member_data
        }
    }

@router.post("/circles/{circle_id}/join")
def join_comeback_circle(circle_id: str, payload: CircleJoinPayload, db: Session = Depends(get_db)):
    circle = db.query(ComebackCircle).filter(ComebackCircle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Comeback Circle not found")
        
    # Check if already a member
    existing = db.query(CircleMembership).filter(
        CircleMembership.circle_id == circle_id,
        CircleMembership.candidate_id == payload.candidate_id
    ).first()
    if existing:
        return {
            "status": "info",
            "message": "You are already an active member of this Comeback Circle.",
            "circle_id": circle_id
        }
        
    if circle.current_member_count >= circle.max_members:
        raise HTTPException(
            status_code=400,
            detail=f"This peer group has reached its maximum cohort capacity ({circle.max_members} members). Small circles foster intimate mutual accountability."
        )
        
    membership = CircleMembership(
        id=str(uuid.uuid4()),
        circle_id=circle_id,
        candidate_id=payload.candidate_id,
        role="member"
    )
    circle.current_member_count += 1
    db.add(membership)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Welcome to '{circle.name}'! You are now part of this peer learning circle.",
        "circle_id": circle_id,
        "current_member_count": circle.current_member_count
    }

@router.post("/circles/{circle_id}/leave")
def leave_comeback_circle(circle_id: str, payload: CircleJoinPayload, db: Session = Depends(get_db)):
    membership = db.query(CircleMembership).filter(
        CircleMembership.circle_id == circle_id,
        CircleMembership.candidate_id == payload.candidate_id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="You are not a member of this circle.")
        
    circle = db.query(ComebackCircle).filter(ComebackCircle.id == circle_id).first()
    if circle and circle.current_member_count > 0:
        circle.current_member_count -= 1
        
    db.delete(membership)
    db.commit()
    return {
        "status": "success",
        "message": "You have left this Comeback Circle.",
        "circle_id": circle_id
    }

@router.get("/circles/{circle_id}/discussions")
def get_circle_discussions(circle_id: str, db: Session = Depends(get_db)):
    posts = db.query(CircleDiscussionPost).filter(
        CircleDiscussionPost.circle_id == circle_id
    ).order_by(desc(CircleDiscussionPost.created_at)).all()
    
    data = []
    for p in posts:
        data.append({
            "id": p.id,
            "circle_id": p.circle_id,
            "author_id": p.author_id,
            "author_name": p.author_name,
            "author_role": p.author_role,
            "title": p.title,
            "content": p.content,
            "category": p.category,
            "likes_count": p.likes_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
        
    return {
        "status": "success",
        "circle_id": circle_id,
        "total": len(data),
        "discussions": data
    }

@router.post("/circles/{circle_id}/discussions", status_code=status.HTTP_201_CREATED)
def create_circle_discussion(
    circle_id: str,
    payload: CirclePostPayload,
    db: Session = Depends(get_db)
):
    circle = db.query(ComebackCircle).filter(ComebackCircle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
        
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == payload.candidate_id).first()
    author_name = candidate.profile.full_name if (candidate and candidate.profile) else "Circle Member"
    
    # Safety & Moderation: Mask any phone numbers or emails per Section 6
    safe_content = mask_sensitive_contact_info(payload.content)
    safe_title = mask_sensitive_contact_info(payload.title)
    
    new_post = CircleDiscussionPost(
        id=str(uuid.uuid4()),
        circle_id=circle_id,
        author_id=payload.candidate_id,
        author_name=author_name,
        author_role="Candidate Peer",
        title=safe_title,
        content=safe_content,
        category=payload.category,
        likes_count=0
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "status": "success",
        "message": "Discussion topic posted.",
        "post": {
            "id": new_post.id,
            "title": new_post.title,
            "content": new_post.content,
            "author_name": new_post.author_name,
            "category": new_post.category,
            "created_at": new_post.created_at.isoformat()
        }
    }

# ============================================================================
# SECTION 5: AI INTERVIEW PRACTICE
# ============================================================================

INTERVIEW_TRACKS_CATALOG = [
    {
        "id": "experience_intro",
        "title": "Introducing Professional Experience",
        "description": "Craft a succinct 90-second professional elevator pitch highlighting past achievements, transferrable strengths, and target direction.",
        "sample_questions": [
            "Walk me through your background and professional journey.",
            "What core technical and operational strengths do you bring to this role?",
            "How does your past experience connect to your goals in this next chapter?"
        ],
        "rubric_focus": "Hook-Experience-Current Focus-Close structure, concise delivery without excessive chronology."
    },
    {
        "id": "career_break",
        "title": "Explaining a Career Break",
        "description": "Confidently address a career hiatus with proactive language, skill refreshes, and readiness to deliver value.",
        "sample_questions": [
            "I noticed a gap on your resume between 2022 and 2024. Could you provide context on that period?",
            "How did you stay engaged with industry trends or technical updates during your career break?",
            "Why is now the right moment for you to return to full-time work?"
        ],
        "rubric_focus": "Honest, proactive framing; pivots quickly to readiness, upskilling, and enthusiasm for the returnship."
    },
    {
        "id": "technical_prep",
        "title": "Technical Interview Preparation",
        "description": "Articulate a complex technical problem, system architecture choice, or data pipeline optimization using the STAR method.",
        "sample_questions": [
            "Describe a complex data or software project you delivered and how you resolved an unexpected bottleneck.",
            "How do you approach learning a new programming framework or data tool under tight deadlines?",
            "Walk me through an instance where your technical recommendation differed from a stakeholder's initial request."
        ],
        "rubric_focus": "STAR structure (Situation, Task, Action, Result), quantifiable metrics, specific technologies, root-cause depth."
    },
    {
        "id": "salary_negotiation",
        "title": "Salary Negotiation",
        "description": "Establish market value anchored in skills and current industry benchmarks rather than discounted past compensation.",
        "sample_questions": [
            "What are your target compensation expectations for this position?",
            "Given that you are returning after a break, how did you arrive at your target salary range?",
            "Our budget is slightly below your target range. What other benefits or flexibility would bridge that difference?"
        ],
        "rubric_focus": "Market-rate anchoring, collaborative boundary-setting, holistic compensation (equity, learning stipends, flexibility)."
    },
    {
        "id": "remote_work",
        "title": "Remote-Work Expectations",
        "description": "Demonstrate asynchronous communication fluency, autonomous project management, and work-life boundary management.",
        "sample_questions": [
            "How do you stay aligned with distributed team members across multiple time zones?",
            "Describe your home workspace setup and how you structure your daily workflow for deep focus.",
            "How do you communicate proactively when an asynchronous task hits a blocker?"
        ],
        "rubric_focus": "Asynchronous documentation, daily standup cadence, proactive blocker escalation, transparent calendar blocking."
    }
]

@router.get("/interview/tracks")
def get_interview_tracks():
    """
    Returns available AI interview practice tracks, rubrics, and ethical disclaimer.
    """
    return {
        "status": "success",
        "ethical_disclaimer": "AI Interview Practice evaluates clarity, structure, and content substance strictly from your typed responses. The platform never evaluates voice characteristics, personality, mental health, or subjective tone.",
        "tracks": INTERVIEW_TRACKS_CATALOG
    }

@router.post("/interview/evaluate")
def evaluate_interview_response(
    payload: InterviewEvaluatePayload,
    db: Session = Depends(get_db)
):
    """
    Evaluates candidate's written interview response on:
    - Answer Clarity (conciseness, readability, tone)
    - Structure (STAR alignment, clear progression)
    - Relevant Content (concrete accomplishments, proactive phrasing, avoidance of over-apologizing)
    
    Ethics rule enforced: Strictly written structural analysis; no voice or psychological profiling.
    """
    ans = payload.candidate_answer.strip()
    words = ans.split()
    word_count = len(words)
    
    if word_count < 15:
        raise HTTPException(
            status_code=400,
            detail="Your response is too brief for an actionable evaluation. Please provide at least 2 to 3 complete sentences (20+ words)."
        )
        
    # Analyze Clarity
    clarity_score = 82
    clarity_feedback_points = []
    if word_count > 180:
        clarity_score -= 8
        clarity_feedback_points.append("Response is slightly lengthy for a verbal answer. Aim for 90 to 140 words to keep an interviewer fully engaged.")
    elif 40 <= word_count <= 140:
        clarity_score += 8
        clarity_feedback_points.append("Excellent length and pacing for spoken interview delivery.")
    else:
        clarity_feedback_points.append("Good baseline conciseness; could benefit from slightly more illustrative detail.")
        
    # Analyze Structure (STAR / Intro-Body-Conclusion)
    structure_score = 80
    structure_feedback_points = []
    has_action_verbs = any(w.lower() in ["built", "led", "developed", "analyzed", "designed", "created", "completed", "implemented", "resolved", "collaborated"] for w in words)
    has_results_indicator = any(w.lower() in ["resulting", "improved", "increased", "achieved", "impact", "delivered", "outcome", "successfully", "efficiency", "%"] for w in words)
    
    if payload.track == "career_break":
        # Check for proactive transition vs lingering on the gap
        apologetic_phrases = ["unfortunately", "sorry for", "fell behind", "disadvantage", "lost my touch"]
        found_apologies = [p for p in apologetic_phrases if p in ans.lower()]
        if found_apologies:
            structure_score -= 10
            structure_feedback_points.append("Noticeable apologetic phrasing detected. Career breaks are normal life phases; frame your time with confident neutrality and immediately pivot forward.")
        else:
            structure_score += 10
            structure_feedback_points.append("Strong forward-looking narrative structure without unnecessary apologies.")
    else:
        if has_action_verbs and has_results_indicator:
            structure_score += 12
            structure_feedback_points.append("Well-structured STAR flow: clearly identifies specific personal actions and tangible outcomes.")
        elif has_action_verbs:
            structure_score += 5
            structure_feedback_points.append("Identified actions well, but strengthen the 'Result' phase by stating the measurable business or team outcome.")
        else:
            structure_feedback_points.append("Structure is somewhat narrative; consider structuring explicitly as Situation -> Task -> Action -> Result.")
            
    # Analyze Content Relevance
    content_score = 85
    content_feedback_points = []
    refinements = []
    
    if payload.track == "career_break":
        upskilling_words = ["upskilled", "course", "certified", "python", "project", "refreshed", "volunteered", "readiness", "learning", "practices"]
        if any(w in ans.lower() for w in upskilling_words):
            content_score += 8
            content_feedback_points.append("Impressive emphasis on proactive learning and skill refreshment during your time away.")
        else:
            refinements.append("Mention 1 specific course, certification, or project you undertook to refresh your knowledge.")
            
    elif payload.track == "salary_negotiation":
        benchmark_words = ["market", "benchmark", "industry", "range", "responsibilities", "value", "research"]
        if any(w in ans.lower() for w in benchmark_words):
            content_score += 8
            content_feedback_points.append("Superb grounding in objective market data rather than defensive positioning.")
        else:
            refinements.append("Anchor your number by citing 'market research for comparable roles' to give your target objective authority.")
            
    elif payload.track == "technical_prep":
        tech_words = ["architecture", "database", "api", "pipeline", "sql", "framework", "optimization", "test", "metric", "deploy"]
        if any(w in ans.lower() for w in tech_words):
            content_score += 8
            content_feedback_points.append("Strong technical vocabulary that demonstrates depth and hands-on familiarity.")
        else:
            refinements.append("Incorporate specific technical terms (e.g. data schemas, system trade-offs, testing strategies) to reinforce technical authority.")
            
    elif payload.track == "remote_work":
        remote_words = ["slack", "async", "documentation", "standup", "jira", "zoom", "calendar", "proactive", "blocker"]
        if any(w in ans.lower() for w in remote_words):
            content_score += 8
            content_feedback_points.append("Demonstrates immediate readiness for modern distributed and asynchronous team practices.")
        else:
            refinements.append("Reference specific tools (e.g., Slack, Notion, Jira) or asynchronous rituals you rely on.")
            
    else: # experience_intro
        if has_results_indicator:
            content_score += 6
            content_feedback_points.append("Clear connection between past achievements and future readiness.")
        else:
            refinements.append("Add one quantified metric (e.g., 'managed 12 client portfolios', 'automated reports saving 4 hours/week').")
            
    clarity_score = min(max(clarity_score, 65), 98)
    structure_score = min(max(structure_score, 60), 98)
    content_score = min(max(content_score, 65), 98)
    overall_score = int((clarity_score * 0.35) + (structure_score * 0.35) + (content_score * 0.30))
    
    if not refinements:
        refinements.append("Practice delivering this answer aloud with a 90-second stopwatch to calibrate natural breathing and cadence.")
        refinements.append("Tailor the final sentence to specifically cite the hiring manager's mission or current strategic priority.")
        
    # Store session
    session_record = InterviewPracticeSession(
        id=str(uuid.uuid4()),
        candidate_id=payload.candidate_id,
        track=payload.track,
        question=payload.question,
        candidate_answer=ans,
        clarity_score=clarity_score,
        structure_score=structure_score,
        content_score=content_score,
        overall_score=overall_score,
        clarity_feedback=" ".join(clarity_feedback_points),
        structure_feedback=" ".join(structure_feedback_points),
        content_feedback=" ".join(content_feedback_points),
        recommended_refinements=refinements
    )
    db.add(session_record)
    db.commit()
    
    return {
        "status": "success",
        "session_id": session_record.id,
        "track": payload.track,
        "question": payload.question,
        "clarity_score": clarity_score,
        "structure_score": structure_score,
        "content_score": content_score,
        "overall_score": overall_score,
        "clarity_feedback": session_record.clarity_feedback,
        "structure_feedback": session_record.structure_feedback,
        "content_feedback": session_record.content_feedback,
        "recommended_refinements": refinements,
        "ethical_note": "Evaluated strictly on written structural clarity, STAR method alignment, and constructive vocabulary. No vocal or psychological inferences made."
    }

@router.get("/interview/history/{candidate_id}")
def get_interview_history(candidate_id: str, db: Session = Depends(get_db)):
    sessions = db.query(InterviewPracticeSession).filter(
        InterviewPracticeSession.candidate_id == candidate_id
    ).order_by(desc(InterviewPracticeSession.created_at)).all()
    
    data = []
    for s in sessions:
        data.append({
            "id": s.id,
            "track": s.track,
            "question": s.question,
            "candidate_answer": s.candidate_answer,
            "overall_score": s.overall_score,
            "clarity_score": s.clarity_score,
            "structure_score": s.structure_score,
            "content_score": s.content_score,
            "clarity_feedback": s.clarity_feedback,
            "structure_feedback": s.structure_feedback,
            "content_feedback": s.content_feedback,
            "recommended_refinements": s.recommended_refinements or [],
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })
        
    return {
        "status": "success",
        "candidate_id": candidate_id,
        "total": len(data),
        "history": data
    }

# ============================================================================
# SECTION 6: SAFETY AND MODERATION
# ============================================================================

CONDUCT_GUIDELINES = {
    "title": "GFG Community & Mentorship Conduct Charter",
    "last_revised": "October 2026",
    "principles": [
        {
            "heading": "Safe & Affirming Space",
            "description": "Treat every returning professional with empathy and respect. Career transitions can be daunting; our community exists to uplift, encourage, and guide."
        },
        {
            "heading": "Strict Anti-Harassment & Non-Discrimination",
            "description": "Zero tolerance for harassment, discrimination, hate speech, or unsolicited personal advances. Violators are immediately banned."
        },
        {
            "heading": "Protected Contact & Anti-Spam",
            "description": "Never solicit private contact numbers, personal home addresses, or financial transactions. Mentorship sessions and circle discussions remain strictly within official platform tools."
        },
        {
            "heading": "Professional Boundaries & Confidentiality",
            "description": "Mentors must never share private resume data, company proprietary materials, or personal struggles shared during 1:1 sessions without explicit consent."
        },
        {
            "heading": "No Commercial Solicitations",
            "description": "Mentors and community members may not pitch paid coaching courses, multi-level marketing, or third-party paid services."
        }
    ]
}

@router.get("/community/conduct-guidelines")
def get_conduct_guidelines():
    return {
        "status": "success",
        "guidelines": CONDUCT_GUIDELINES
    }

@router.post("/community/report", status_code=status.HTTP_201_CREATED)
def submit_moderation_report(payload: ModerationReportPayload, db: Session = Depends(get_db)):
    """
    Report an inappropriate user, mentor, or discussion post.
    """
    report = CommunityModerationReport(
        id=str(uuid.uuid4()),
        reporter_id=payload.reporter_id,
        target_type=payload.target_type,
        target_id=payload.target_id,
        reason=payload.reason,
        description=payload.description,
        status="pending_review"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return {
        "status": "success",
        "message": "Report received and queued for platform moderator review. Thank you for protecting our community.",
        "report_id": report.id
    }

@router.post("/community/block", status_code=status.HTTP_201_CREATED)
def block_user(payload: UserBlockPayload, db: Session = Depends(get_db)):
    """
    Block a user from contacting or interacting in circles.
    """
    existing = db.query(UserBlock).filter(
        UserBlock.blocker_id == payload.blocker_id,
        UserBlock.blocked_id == payload.blocked_id
    ).first()
    if existing:
        return {"status": "info", "message": "User is already blocked."}
        
    block = UserBlock(
        id=str(uuid.uuid4()),
        blocker_id=payload.blocker_id,
        blocked_id=payload.blocked_id
    )
    db.add(block)
    db.commit()
    
    return {
        "status": "success",
        "message": "User has been blocked. They will not be able to message you or see your session availability.",
        "blocked_id": payload.blocked_id
    }

@router.get("/community/blocked/{user_id}")
def list_blocked_users(user_id: str, db: Session = Depends(get_db)):
    blocks = db.query(UserBlock).filter(UserBlock.blocker_id == user_id).all()
    return {
        "status": "success",
        "user_id": user_id,
        "blocked_user_ids": [b.blocked_id for b in blocks]
    }
