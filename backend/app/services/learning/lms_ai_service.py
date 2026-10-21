import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from backend.app.config.settings import settings
from backend.app.models.learning import Course, Lesson, AssessmentAttempt

logger = logging.getLogger("GFG_LMS_AI")

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

LMS_SYSTEM_GUARDRAILS = """
You are the GFG AI Learning Companion for women re-entering the professional workforce after life breaks (maternity, caregiving, relocation, sabbaticals).
Your role:
1. Explain technical and professional concepts with clarity, empathy, and practical corporate relevance.
2. Provide step-by-step guidance on practical assignments without doing the entire work for them.
3. Help learners understand errors on quizzes with pedagogical encouragement and root-cause clarity.
4. Suggest achievable weekly study schedules tailored to their available daily hours (2-8 hrs/day).
5. Always maintain professional, encouraging, and dignified tone.

STRICT INVARIANTS:
- You DO NOT have permission to alter quiz scores, award certificates, or override administrative decisions.
- Never claim official governmental, corporate or university accreditation on behalf of GFG without authorization.
- Keep responses structured, concise, and easy to read on mobile.
"""


async def call_gemini_api(prompt: str, context: Optional[str] = None) -> Optional[str]:
    """Call Google Gemini 1.5 Flash REST API if key is configured."""
    api_key = getattr(settings, "GEMINI_API_KEY", "") or settings.AI_API_KEY
    if not api_key or len(api_key.strip()) < 8:
        return None

    url = f"{GEMINI_API_BASE}?key={api_key.strip()}"
    headers = {"Content-Type": "application/json"}
    full_prompt = f"{LMS_SYSTEM_GUARDRAILS}\n\nContext:\n{context or 'GFG Learning Hub'}\n\nUser Question:\n{prompt}"

    body = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=headers, json=body)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")

    return None


def get_curated_fallback_explanation(course_slug: str, question: str, lesson_title: Optional[str] = None) -> Dict[str, Any]:
    """
    High-fidelity curated pedagogical engine for the three core GFG courses.
    Guarantees instant, rich responses even in offline / local demo modes.
    """
    q_lower = question.lower()

    # Course: Excel for Career Returners
    if "excel" in course_slug or "xlookup" in q_lower or "pivot" in q_lower or "formula" in q_lower:
        if "xlookup" in q_lower or "vlookup" in q_lower:
            return {
                "answer": (
                    "**Understanding XLOOKUP vs VLOOKUP**:\n\n"
                    "1. **Syntax**: `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])`.\n"
                    "2. **Why it's superior**: Unlike VLOOKUP, XLOOKUP searches both left and right, doesn't break when columns are inserted, and has built-in error handling via `[if_not_found]` without needing nested `IFERROR()`.\n"
                    "3. **Returnship Pro-Tip**: In technical interviews, interviewers love when you point out that XLOOKUP defaults to an exact match (`match_mode=0`), eliminating the classic VLOOKUP `FALSE` argument trap!"
                ),
                "recommended_resources": [
                    {"title": "Microsoft XLOOKUP Documentation", "url": "https://support.microsoft.com/en-us/office/xlookup-function"},
                    {"title": "GFG Excel Formula Cheat Sheet (Lesson 1.1)", "url": "#resources"}
                ],
                "suggested_followups": [
                    "How do I do a two-way two-dimensional lookup with nested XLOOKUP?",
                    "What is the difference between INDEX/MATCH and XLOOKUP in older Excel versions?"
                ]
            }
        elif "pivot" in q_lower or "dashboard" in q_lower:
            return {
                "answer": (
                    "**Mastering Dynamic Pivot Tables**:\n\n"
                    "• **Data Source Best Practice**: Always convert your raw range into an official Excel Table (`Ctrl + T`) before creating a Pivot Table. When new rows are appended, clicking 'Refresh' instantly updates your Pivot Table.\n"
                    "• **Grouping Dates**: Right-click any date cell in your Pivot Table row area and choose 'Group' to summarize by Months, Quarters, or Years automatically.\n"
                    "• **Executive Presentation**: Pair your Pivot Table with interactive Slicers and a clean Pivot Chart with muted palette colors for leadership reviews."
                ),
                "recommended_resources": [
                    {"title": "GFG Executive Dashboard Template (Lesson 3.2)", "url": "#resources"}
                ],
                "suggested_followups": [
                    "How do I add a Calculated Field inside a Pivot Table?",
                    "How do I connect one Slicer to multiple Pivot Tables?"
                ]
            }

    # Course: Workplace Digital Skills
    if "digital" in course_slug or "async" in q_lower or "slack" in q_lower or "security" in q_lower:
        if "async" in q_lower or "meeting" in q_lower:
            return {
                "answer": (
                    "**Mastering Asynchronous Collaboration**:\n\n"
                    "• **The 3-Sentence Update Rule**: State what you accomplished, what you are working on next, and any blockers or dependencies.\n"
                    "• **Thread Discipline**: Always reply inside topic threads in Slack or Teams rather than cluttering main channels. This allows distributed teammates to catch up across time zones.\n"
                    "• **Protecting Your Focus**: Use calendar blocks ('Deep Work - Async') and status messages ('Focused - Back at 2 PM') so colleagues know when to expect your response without meeting anxiety."
                ),
                "recommended_resources": [
                    {"title": "GFG Remote Collaboration Blueprint (Lesson 2.1)", "url": "#resources"},
                    {"title": "Calendar & Boundary Setting Checklist", "url": "#resources"}
                ],
                "suggested_followups": [
                    "How do I write a project brief in Notion or Google Docs for my team?",
                    "What is the best way to handle urgent escalations asynchronously?"
                ]
            }

    # Course: Career Comeback Readiness
    if "comeback" in course_slug or "interview" in q_lower or "break" in q_lower or "resume" in q_lower:
        return {
            "answer": (
                "**The 3-Part Comeback Narrative Formula**:\n\n"
                "1. **Anchor (Tenure & Background)**: 'Prior to my career pause, I spent 4.5 years delivering enterprise systems with high reliability.'\n"
                "2. **Pivot (Purposeful Pause)**: 'I stepped back to prioritize full-time caregiving—a period that strengthened my crisis management, prioritization, and resilience under pressure.'\n"
                "3. **Launch (Refreshed Readiness)**: 'Over the past four months, I completed GFG's verified coursework in modern architectures and practical projects, and I am excited to contribute with renewed focus.'\n\n"
                "**Key Rule**: Never apologize for your career break. Frame it with ownership, dignity, and forward-looking momentum."
            ),
            "recommended_resources": [
                {"title": "GFG Comeback Elevator Pitch Worksheet (Lesson 1.2)", "url": "#resources"},
                {"title": "Top 10 Returnship Interview Questions Guide", "url": "#resources"}
            ],
            "suggested_followups": [
                "How do I format a skills-first resume that de-emphasizes the chronological gap?",
                "What should I do if an interviewer presses negatively on my gap duration?"
            ]
        }

    # General LMS AI Response
    lesson_context = f"in lesson '{lesson_title}'" if lesson_title else "in your current course"
    return {
        "answer": (
            f"Here is a key conceptual explanation for your question {lesson_context}:\n\n"
            f"Focus on the core principle: break the problem down into verifiable steps. In modern workplaces, documentation, clear communication, and deliberate practice are prioritized above memorization.\n\n"
            f"Review the downloadable template attached to this lesson to see this concept applied to real workplace returnship scenarios."
        ),
        "recommended_resources": [
            {"title": "Lesson Reference Guide & Key Takeaways", "url": "#resources"}
        ],
        "suggested_followups": [
            "Can you give me an example of how this applies to a real company project?",
            "What common mistakes should I avoid in the practical assignment?"
        ]
    }


async def answer_learner_question(
    db: Any,
    course_id: str,
    question: str,
    lesson_id: Optional[str] = None
) -> Dict[str, Any]:
    """Answers learner question via Gemini AI (if key is set) with curated educational fallback."""
    course = db.query(Course).filter(Course.id == course_id).first()
    course_slug = course.slug if course else ""
    course_title = course.title if course else "Course"

    lesson = None
    if lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    context_str = f"Course: {course_title}. "
    if lesson:
        context_str += f"Lesson: {lesson.title}. Content Summary: {lesson.content_markdown[:300]}"

    # Attempt Gemini LLM
    gemini_text = await call_gemini_api(question, context_str)
    if gemini_text:
        return {
            "answer": gemini_text,
            "recommended_resources": [
                {"title": f"{course_title} Learning Materials", "url": "#resources"}
            ],
            "suggested_followups": [
                "Can you show a practical example of this concept?",
                "How does this connect with the course practical assignment?"
            ]
        }

    # Fallback to high-fidelity curated domain response
    return get_curated_fallback_explanation(course_slug, question, lesson.title if lesson else None)


def generate_personalized_study_plan(
    course: Course,
    available_hours_per_week: int,
    target_weeks: int
) -> Dict[str, Any]:
    """
    Generates a personalized, realistic weekly study schedule respecting the learner's time commitments.
    """
    total_hours = course.estimated_duration_hours or 12
    weekly_hours_needed = max(2, round(total_hours / max(1, target_weeks)))

    schedule = []
    modules = course.modules or []

    for i in range(1, target_weeks + 1):
        if i <= len(modules):
            mod = modules[i - 1]
            focus_title = mod.title
            goals = [f"Complete lessons in {mod.title}", "Take inline knowledge checks"]
        elif i == target_weeks:
            focus_title = "Final Assessment & Practical Assignment Submission"
            goals = ["Review all module summary notes", "Pass final quiz with 70%+", "Submit practical project"]
        else:
            focus_title = "Capstone Project Preparation & Practice Drills"
            goals = ["Draft project deliverables", "Refine practical rubric criteria"]

        schedule.append({
            "week": i,
            "title": f"Week {i}: {focus_title}",
            "recommended_study_hours": min(available_hours_per_week, weekly_hours_needed),
            "suggested_daily_pace": f"{round(weekly_hours_needed / 5.0, 1)} hours/day (5 days/week)",
            "goals": goals
        })

    return {
        "course_title": course.title,
        "weekly_schedule": schedule,
        "tips": [
            f"You have budgeted {available_hours_per_week} hours/week for {target_weeks} weeks.",
            "Study in focused 30-45 minute blocks rather than marathon sessions to reduce fatigue.",
            "All lessons save your progress automatically so you can resume anytime without penalty."
        ]
    }
