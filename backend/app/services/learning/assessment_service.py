from datetime import datetime, timezone
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.learning import (
    Assessment,
    AssessmentQuestion,
    AssessmentAttempt,
    CourseEnrollment,
)
from backend.app.schemas.learning import AssessmentResultResponse, QuestionFeedback


def grade_assessment_submission(
    db: Session,
    assessment_id: str,
    user_id: str,
    submitted_answers: Dict[str, List[str]]
) -> AssessmentResultResponse:
    """
    Server-side assessment grading engine.
    Compares user submitted answers against correct_option_ids in database,
    evaluates attempts limits, calculates score percentage, and persists the attempt.
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ASSESSMENT_NOT_FOUND", "message": "Assessment does not exist."}
        )

    # Check attempt limit
    existing_attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment_id,
        AssessmentAttempt.user_id == user_id
    ).order_by(AssessmentAttempt.attempt_number.desc()).all()

    attempts_count = len(existing_attempts)
    if attempts_count >= assessment.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "ATTEMPT_LIMIT_REACHED",
                "message": f"Maximum attempt limit ({assessment.max_attempts}) reached for this assessment."
            }
        )

    attempt_number = attempts_count + 1

    # Load questions
    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.assessment_id == assessment_id
    ).order_by(AssessmentQuestion.order_index.asc()).all()

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "NO_QUESTIONS", "message": "Assessment currently contains no questions."}
        )

    total_points = sum(q.points for q in questions)
    earned_points = 0.0
    feedback_items: List[QuestionFeedback] = []

    for q in questions:
        # User answer for this question
        raw_user_ans = submitted_answers.get(q.id, [])
        if isinstance(raw_user_ans, str):
            raw_user_ans = [raw_user_ans]
        user_ans = [str(a).strip().lower() for a in raw_user_ans]

        # Correct answer(s)
        correct_ids = [str(cid).strip().lower() for cid in (q.correct_option_ids or [])]

        # Check correctness
        is_correct = False
        if q.question_type == "multiple_choice":
            # Must match all correct options exactly
            is_correct = sorted(user_ans) == sorted(correct_ids)
        else:
            # Single choice: first selected matches
            is_correct = len(user_ans) > 0 and user_ans[0] in correct_ids

        if is_correct:
            earned_points += q.points

        feedback_items.append(
            QuestionFeedback(
                question_id=q.id,
                question_text=q.question_text,
                user_answers=raw_user_ans,
                correct_answers=q.correct_option_ids or [],
                is_correct=is_correct,
                explanation=q.explanation
            )
        )

    score_pct = round((earned_points / total_points) * 100.0, 1) if total_points > 0 else 0.0
    passed = score_pct >= assessment.passing_score_percentage

    # Persist attempt record
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        user_id=user_id,
        attempt_number=attempt_number,
        score_percentage=score_pct,
        passed=passed,
        answers=submitted_answers,
        feedback=[f.model_dump() for f in feedback_items],
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(attempt)

    # Check if enrollment progress should be updated
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == assessment.course_id,
        CourseEnrollment.user_id == user_id
    ).first()
    if enrollment:
        enrollment.last_accessed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(attempt)

    attempts_remaining = max(0, assessment.max_attempts - attempt_number)
    can_retry = (not passed) and (attempts_remaining > 0)

    return AssessmentResultResponse(
        attempt_id=attempt.id,
        assessment_id=assessment.id,
        attempt_number=attempt_number,
        score_percentage=score_pct,
        passed=passed,
        passing_score_percentage=assessment.passing_score_percentage,
        feedback=feedback_items,
        attempts_remaining=attempts_remaining,
        can_retry=can_retry,
        submitted_at=attempt.submitted_at
    )
