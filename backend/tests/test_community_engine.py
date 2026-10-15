import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_mentor_directory_and_filtering():
    # 1. Fetch all mentors
    res = client.get("/api/mentors")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["total"] >= 6
    mentors = data["mentors"]
    
    # Verify demo profile labeling
    demo_mentors = [m for m in mentors if m["is_demo"]]
    assert len(demo_mentors) > 0
    assert "Demonstration Mentor Profile" in demo_mentors[0]["demo_badge_label"]
    
    # 2. Filter by field
    res_data = client.get("/api/mentors?field=data_analytics")
    assert res_data.status_code == 200
    analytics_mentors = res_data.json()["mentors"]
    assert len(analytics_mentors) >= 1
    for m in analytics_mentors:
        assert m["field"] == "data_analytics"
        
    # 3. Filter by language
    res_hindi = client.get("/api/mentors?language=Hindi")
    assert res_hindi.status_code == 200
    hindi_mentors = res_hindi.json()["mentors"]
    assert len(hindi_mentors) >= 1
    for m in hindi_mentors:
        assert "Hindi" in m["languages"]

    # 4. Filter by session format
    res_video = client.get("/api/mentors?format=1:1 Video")
    assert res_video.status_code == 200
    assert len(res_video.json()["mentors"]) >= 1

def test_recommended_mentors_and_explanation():
    res = client.get("/api/mentors/recommended")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    recs = data["recommendations"]
    assert len(recs) >= 1
    
    top_rec = recs[0]
    assert "match_score" in top_rec
    assert top_rec["match_score"] >= 60
    assert "match_explanation" in top_rec
    assert "Match:" in top_rec["match_explanation"]
    # Check that explanation mentions alignment points
    assert any(term in top_rec["match_explanation"].lower() for term in ["alignment", "overlap", "sector", "availability", "mentoring"])

def test_session_management_lifecycle():
    # 1. Get a mentor and a candidate from DB
    from backend.app.database.database import SessionLocal
    from backend.app.models.candidate import CandidateProfile
    db = SessionLocal()
    cand = db.query(CandidateProfile).first()
    assert cand is not None, "Candidate must exist in database"
    candidate_id = cand.id
    db.close()

    m_res = client.get("/api/mentors")
    mentor_id = m_res.json()["mentors"][0]["id"]
    
    # 2. Submit a session booking request
    sched_time = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    req_res = client.post("/api/mentors/sessions/request", json={
        "candidate_id": candidate_id,
        "mentor_id": mentor_id,
        "topic": "Career Break Transition Strategy & Resume Review",
        "goals": "Clarify my 3-year gap explanation and benchmark current SQL requirements.",
        "scheduled_at": sched_time,
        "format": "1:1 Video"
    })
    assert req_res.status_code == 201
    sess_data = req_res.json()["session"]
    assert sess_data["status"] == "pending_confirmation"
    assert sess_data["meeting_link"] is None
    assert sess_data["calendar_authorized"] is False
    session_id = sess_data["id"]
    
    # 3. List sessions for candidate
    list_res = client.get(f"/api/mentors/sessions?candidate_id={candidate_id}")
    assert list_res.status_code == 200
    candidate_sessions = list_res.json()["sessions"]
    assert any(s["id"] == session_id for s in candidate_sessions)
    
    # 4. Mentor confirms request
    confirm_res = client.post(f"/api/mentors/sessions/{session_id}/respond", json={
        "action": "confirm"
    })
    assert confirm_res.status_code == 200
    assert confirm_res.json()["new_status"] == "confirmed"
    assert confirm_res.json()["meeting_link"] is not None
    
    # 5. Candidate saves private progress notes
    notes_res = client.put(f"/api/mentors/sessions/{session_id}/notes", json={
        "candidate_private_notes": "Reviewed PostgreSQL CTEs. Need to ask mentor about remote vs hybrid returnships."
    })
    assert notes_res.status_code == 200
    assert "Reviewed PostgreSQL" in notes_res.json()["notes"]
    
    # 6. Post-session feedback
    feedback_res = client.post(f"/api/mentors/sessions/{session_id}/feedback", json={
        "rating": 5,
        "comment": "Incredible clarity on framing my sabbatical. Highly encouraging!"
    })
    assert feedback_res.status_code == 200
    assert feedback_res.json()["feedback_rating"] == 5

def test_comeback_circles_and_discussion_with_pii_masking():
    # 1. List circles
    res = client.get("/api/circles")
    assert res.status_code == 200
    circles = res.json()["circles"]
    assert len(circles) >= 3
    
    circle = circles[0]
    assert circle["max_members"] == 15
    assert len(circle["learning_goals"]) >= 1
    assert len(circle["milestones"]) >= 1
    assert len(circle["scheduled_sessions"]) >= 1
    assert len(circle["portfolio_activities"]) >= 1
    circle_id = circle["id"]
    
    # 2. Join circle
    join_res = client.post(f"/api/circles/{circle_id}/join", json={
        "candidate_id": "test-candidate-xyz"
    })
    assert join_res.status_code in [200, 201]
    
    # 3. Post to discussion with sensitive PII (email & phone)
    post_res = client.post(f"/api/circles/{circle_id}/discussions", json={
        "candidate_id": "test-candidate-xyz",
        "title": "Study group for Power BI! Reach me at test.user@example.com",
        "content": "Hey everyone, call me at 987-654-3210 or email me at candidate@workmail.com to sync up!",
        "category": "Resource Share"
    })
    assert post_res.status_code == 201
    created_post = post_res.json()["post"]
    # Verify contact information is protected/masked
    assert "test.user@example.com" not in created_post["title"]
    assert "[PROTECTED EMAIL]" in created_post["title"]
    assert "candidate@workmail.com" not in created_post["content"]
    assert "[PROTECTED EMAIL]" in created_post["content"]
    assert "987-654-3210" not in created_post["content"]
    assert "[PROTECTED CONTACT]" in created_post["content"]
    
    # 4. Leave circle
    leave_res = client.post(f"/api/circles/{circle_id}/leave", json={
        "candidate_id": "test-candidate-xyz"
    })
    assert leave_res.status_code == 200

def test_ai_interview_practice():
    # 1. Fetch tracks catalog
    tracks_res = client.get("/api/interview/tracks")
    assert tracks_res.status_code == 200
    data = tracks_res.json()
    assert len(data["tracks"]) == 5
    track_ids = [t["id"] for t in data["tracks"]]
    for expected in ["experience_intro", "career_break", "technical_prep", "salary_negotiation", "remote_work"]:
        assert expected in track_ids
    # Verify ethical disclaimer
    assert "never evaluates voice" in data["ethical_disclaimer"].lower() or "strictly from your typed" in data["ethical_disclaimer"].lower()
    
    # 2. Reject short response (< 15 words)
    short_res = client.post("/api/interview/evaluate", json={
        "candidate_id": "demo-cand-1",
        "track": "career_break",
        "question": "Can you explain your 2-year career gap?",
        "candidate_answer": "I took some time off for family."
    })
    assert short_res.status_code == 400
    
    # 3. Evaluate constructive response on career break
    eval_res = client.post("/api/interview/evaluate", json={
        "candidate_id": "demo-cand-1",
        "track": "career_break",
        "question": "I noticed a break in your resume. How do you feel about returning to work now?",
        "candidate_answer": "I intentionally paused my career for two years to care for my young family. During this sabbatical, I refreshed my technical toolkit by completing an advanced PostgreSQL course and building a Power BI analytics portfolio. I am now fully ready and excited to bring my analytical rigor and problem-solving skills to this returnship role."
    })
    assert eval_res.status_code == 200
    res_data = eval_res.json()
    assert res_data["clarity_score"] >= 75
    assert res_data["structure_score"] >= 80
    assert res_data["content_score"] >= 80
    assert res_data["overall_score"] >= 75
    assert len(res_data["recommended_refinements"]) >= 1
    assert "strictly on written structural clarity" in res_data["ethical_note"]

def test_safety_and_moderation():
    # 1. Conduct charter
    guide_res = client.get("/api/community/conduct-guidelines")
    assert guide_res.status_code == 200
    assert len(guide_res.json()["guidelines"]["principles"]) >= 4
    
    # 2. Report user
    rep_res = client.post("/api/community/report", json={
        "reporter_id": "user-cand-1",
        "target_type": "user",
        "target_id": "user-spammer-99",
        "reason": "Commercial solicitation",
        "description": "Posted external paid crypto coaching link in Comeback Circle."
    })
    assert rep_res.status_code == 201
    assert "report_id" in rep_res.json()
    
    # 3. Block user
    block_res = client.post("/api/community/block", json={
        "blocker_id": "user-cand-1",
        "blocked_id": "user-spammer-99"
    })
    assert block_res.status_code == 201
    
    # 4. Check blocked users list
    list_blocked = client.get("/api/community/blocked/user-cand-1")
    assert list_blocked.status_code == 200
    assert "user-spammer-99" in list_blocked.json()["blocked_user_ids"]
