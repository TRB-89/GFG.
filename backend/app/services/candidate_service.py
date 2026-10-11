from typing import Dict, Any, List
from backend.app.models.candidate import CandidateProfile
from backend.app.models.user import Profile

def calculate_profile_completion(cand: CandidateProfile, user: Profile) -> int:
    """
    Weighted scoring per Section 15:
    - Basic Information: 15%
    - Professional Information: 20%
    - Career Break Information: 10%
    - Skills: 20%
    - Interests: 10%
    - Resume: 10%
    - Projects: 10%
    - Availability: 5%
    Total = 100%
    """
    score = 0

    # Basic Information (15%)
    if user.full_name and user.email:
        score += 8
    if user.phone or user.location or user.bio:
        score += 7

    # Professional Information (20%)
    if cand.headline and cand.highest_qualification:
        score += 10
    if cand.years_experience and cand.previous_job_title:
        score += 10

    # Career Break Information (10%)
    if cand.career_breaks and len(cand.career_breaks) > 0:
        score += 10

    # Skills (20%)
    if cand.skills and len(cand.skills) >= 3:
        score += 20
    elif cand.skills and len(cand.skills) > 0:
        score += 10

    # Interests (10%)
    if cand.interests and len(cand.interests) > 0:
        score += 10

    # Resume (10%)
    if cand.resume_url:
        score += 10

    # Projects or Certificates (10%)
    if (cand.projects and len(cand.projects) > 0) or (cand.certificates and len(cand.certificates) > 0):
        score += 10

    # Availability (5%)
    if cand.available_hours_per_day and cand.preferred_work_mode:
        score += 5

    return min(100, score)
