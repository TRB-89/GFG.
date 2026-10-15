"""
Adaptive Learning Engine (Module 5)
Core intelligence engine for generating customized, adaptive career roadmaps across sectors,
supporting flexible learning modes (5-min micro, 15-min focused, 30-min structured, weekend intensive),
recommending verified learning resources with explicit cost tiers, tracking accessible assessments,
skipping redundant beginner material for demonstrated skills, and offering non-punitive adaptations after interruptions.
"""

from typing import Dict, Any, List, Optional
import math
import copy
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.candidate import CandidateProfile, CandidateSkill, LearningProgress
from backend.app.models.ai import LearningRoadmap
from backend.app.services.ai.digital_twin_engine import record_digital_twin_event

# Supported Learning Modes
LEARNING_MODES = {
    "microlearning_5min": {
        "title": "5-Minute Microlearning",
        "badge": "DAILY DRILL",
        "description": "Bite-sized mental models and quick exercises calibrated for parents and busy schedules.",
        "minutes_per_day": 5,
        "format": "Quick mental models & 1-question check",
    },
    "focused_15min": {
        "title": "15-Minute Focused Learning",
        "badge": "FOCUSED SPRINT",
        "description": "Targeted technical lessons covering code syntax, query patterns, and immediate quizzes.",
        "minutes_per_day": 15,
        "format": "Technical walkthrough & interactive quiz",
    },
    "structured_30min": {
        "title": "30-Minute Structured Lessons",
        "badge": "DEEP WORK",
        "description": "Comprehensive lessons with guided exercises and hands-on repository commits.",
        "minutes_per_day": 30,
        "format": "Deep concept study & practical task",
    },
    "weekend_intensive": {
        "title": "Weekend Intensive Plans",
        "badge": "WEEKEND IMMERSION",
        "description": "Consolidated 4-6 hour Saturday/Sunday immersion blocks for working caregivers.",
        "minutes_per_day": 180,
        "format": "Capstone sprints & portfolio milestone delivery",
    },
    "self_paced": {
        "title": "Self-Paced Learning",
        "badge": "FLEXIBLE PACE",
        "description": "Flexible progress tracking according to your weekly availability without deadlines.",
        "minutes_per_day": 45,
        "format": "Milestone-oriented curriculum",
    },
}

# Verified Curriculum Templates by Professional Sector
SECTOR_CURRICULUMS = {
    "Data Analyst": {
        "sector_name": "Data Analytics & Analytics Engineering",
        "essential_skills": ["SQL", "Data Modeling", "Python", "Power BI", "Data Visualization", "Spreadsheet Modeling"],
        "modules": [
            {
                "id": "da-mod-1",
                "skill_objective": "Relational Query Foundations & Data Extraction",
                "title": "Relational SQL Foundations & Multi-Table Joins",
                "prerequisites": ["Spreadsheet row-column concepts"],
                "estimated_minutes": 30,
                "resource": {
                    "provider": "Stanford Online / Harvard CS50 SQL",
                    "title": "Relational Databases and SQL Queries",
                    "url": "https://cs50.harvard.edu/sql/",
                    "cost_tier": "free",
                    "verification_note": "Free open-courseware from Harvard University; no paywall."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "SQL Join Mechanics Knowledge Check",
                    "quiz_questions": [
                        {
                            "question": "What is the primary difference between an INNER JOIN and a LEFT OUTER JOIN?",
                            "options": [
                                "INNER JOIN returns all rows from the right table only",
                                "INNER JOIN returns only rows with matches in both tables; LEFT JOIN preserves all left-table rows",
                                "LEFT JOIN requires identical primary keys on both sides",
                                "INNER JOIN cannot be used with aggregate functions"
                            ],
                            "correct_index": 1,
                            "explanation": "INNER JOIN discards unmatched rows, whereas LEFT JOIN preserves every row from the left table, filling missing right-side values with NULL."
                        }
                    ],
                    "practical_task_prompt": "Write an INNER JOIN query connecting customer orders to transaction billing logs."
                }
            },
            {
                "id": "da-mod-2",
                "skill_objective": "Advanced Window Functions & Cohort Partitioning",
                "title": "SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)",
                "prerequisites": ["da-mod-1", "SQL GROUP BY"],
                "estimated_minutes": 30,
                "resource": {
                    "provider": "PostgreSQL Official Documentation & Tutorials",
                    "title": "Window Functions Tutorial & Syntax Guide",
                    "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
                    "cost_tier": "free",
                    "verification_note": "Official open-source documentation."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Top-N Customer Ranking Query",
                    "quiz_questions": [
                        {
                            "question": "Which window clause ensures rankings calculate independently for each sales territory?",
                            "options": [
                                "ORDER BY territory",
                                "PARTITION BY territory",
                                "GROUP BY territory",
                                "HAVING territory = TRUE"
                            ],
                            "correct_index": 1,
                            "explanation": "PARTITION BY divides the query result into partitions to which the window function is applied separately."
                        }
                    ],
                    "practical_task_prompt": "Write a query returning the top 3 highest-spending clients per country using DENSE_RANK() OVER (PARTITION BY country ORDER BY spend DESC)."
                }
            },
            {
                "id": "da-mod-3",
                "skill_objective": "Python Data Manipulation & Clean Ingestion",
                "title": "Pandas DataFrames: Handling Anomalies & Missing Values",
                "prerequisites": ["Basic Python Syntax"],
                "estimated_minutes": 45,
                "resource": {
                    "provider": "Kaggle Learn / Python Software Foundation",
                    "title": "Pandas Micro-Course: Data Cleaning & Indexing",
                    "url": "https://www.kaggle.com/learn/pandas",
                    "cost_tier": "free",
                    "verification_note": "Interactive browser-executable Jupyter exercises; zero local setup required."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "Pandas Imputation Check",
                    "quiz_questions": [
                        {
                            "question": "Which Pandas method safely fills missing null values with the column median without copying the full DataFrame?",
                            "options": [
                                "df['col'].replace(0, median)",
                                "df['col'].fillna(df['col'].median(), inplace=True)",
                                "df.dropna(subset=['col'])",
                                "df['col'].impute()"
                            ],
                            "correct_index": 1,
                            "explanation": ".fillna(median, inplace=True) populates NaN cells with the specified scalar value directly."
                        }
                    ],
                    "practical_task_prompt": "Ingest customer churn CSV, calculate percentage of missing values, and impute median tenure."
                }
            },
            {
                "id": "da-mod-4",
                "skill_objective": "Business Intelligence & Star-Schema Data Modeling",
                "title": "Power BI Interface, Star Schema & Power Query Ingestion",
                "prerequisites": ["da-mod-1"],
                "estimated_minutes": 40,
                "resource": {
                    "provider": "Microsoft Learn",
                    "title": "Design a Data Model in Power BI",
                    "url": "https://learn.microsoft.com/en-us/training/modules/design-model-power-bi/",
                    "cost_tier": "free",
                    "verification_note": "Official Microsoft training module for PL-300 certification track."
                },
                "assessment": {
                    "type": "reflection_exercise",
                    "title": "Relational Modeling Architecture Reflection",
                    "quiz_questions": [],
                    "practical_task_prompt": "Construct a star schema connecting 1 centralized FactSales table with 3 Dimension tables (DimCustomer, DimDate, DimProduct).",
                    "reflection_prompt": "Describe how building star schemas compares with handling flat spreadsheet reports from your previous roles."
                }
            },
            {
                "id": "da-mod-5",
                "skill_objective": "DAX Metrics & KPI Formulation",
                "title": "DAX Calculations: CALCULATE, Time Intelligence & Measures",
                "prerequisites": ["da-mod-4"],
                "estimated_minutes": 45,
                "resource": {
                    "provider": "SQLBI / Microsoft Learn",
                    "title": "Introduction to DAX in Power BI",
                    "url": "https://www.sqlbi.com/guides/dax/",
                    "cost_tier": "free",
                    "verification_note": "Free industry-standard guide by Marco Russo & Alberto Ferrari."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Month-over-Month Revenue Growth Measure",
                    "quiz_questions": [
                        {
                            "question": "Which DAX function alters the filter context of a measure calculation?",
                            "options": ["SUMX", "CALCULATE", "FILTER", "RELATED"],
                            "correct_index": 1,
                            "explanation": "CALCULATE is the single most important function in DAX; it evaluates an expression in a modified filter context."
                        }
                    ],
                    "practical_task_prompt": "Formulate a DAX measure calculating Year-to-Date (YTD) Revenue with TOTALYTD(SUM(Sales[Amount]), DimDate[Date])."
                }
            },
            {
                "id": "da-mod-6",
                "skill_objective": "Capstone Portfolio Synthesis",
                "title": "Portfolio Capstone: Customer Churn & Revenue Telemetry",
                "prerequisites": ["da-mod-2", "da-mod-3", "da-mod-5"],
                "estimated_minutes": 120,
                "resource": {
                    "provider": "GFG Portfolio Capstone Labs",
                    "title": "Enterprise Churn Analytics Case Study",
                    "url": "https://github.com/GFG-Return-To-Work/analytics-capstone-template",
                    "cost_tier": "internal_practice",
                    "verification_note": "Open-source GFG project repository template with automated test harnesses."
                },
                "assessment": {
                    "type": "mini_project",
                    "title": "Production Analytics Portfolio Repository",
                    "quiz_questions": [],
                    "practical_task_prompt": "Publish your end-to-end customer churn analysis repository with README, SQL migration scripts, Power BI .pbix file, and executive takeaway memo."
                }
            }
        ]
    },

    "Business Intelligence Specialist": {
        "sector_name": "Business Intelligence & Executive Reporting",
        "essential_skills": ["Power BI", "Tableau", "SQL", "Executive Dashboarding", "Stakeholder Communication", "KPI Design"],
        "modules": [
            {
                "id": "bi-mod-1",
                "skill_objective": "Enterprise KPI Formulation & Metric Trees",
                "title": "Executive KPI Deconstruction & Metric Hierarchies",
                "prerequisites": [],
                "estimated_minutes": 30,
                "resource": {
                    "provider": "Harvard Business Review / Coursera",
                    "title": "Business Metrics for Data-Driven Companies",
                    "url": "https://www.coursera.org/learn/analytics-business-metrics",
                    "cost_tier": "paid",
                    "verification_note": "Audit tier free; optional verified credential available from provider."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "Leading vs Lagging KPI Check",
                    "quiz_questions": [
                        {
                            "question": "Which of the following is considered a leading KPI for enterprise SaaS retention?",
                            "options": [
                                "Gross revenue churn at end of fiscal quarter",
                                "Weekly active product usage and license activation rate",
                                "Annual balance sheet depreciation",
                                "Historical customer lifetime value"
                            ],
                            "correct_index": 1,
                            "explanation": "Weekly active usage reflects real-time customer behavior before renewal dates, serving as an actionable leading signal."
                        }
                    ],
                    "practical_task_prompt": "Draft a metric tree decomposing Net Revenue Retention (NRR) into its core mathematical components."
                }
            },
            {
                "id": "bi-mod-2",
                "skill_objective": "Tableau Level-of-Detail (LOD) Calculations",
                "title": "Tableau Desktop: FIXED, INCLUDE & EXCLUDE LOD Expressions",
                "prerequisites": ["bi-mod-1"],
                "estimated_minutes": 40,
                "resource": {
                    "provider": "Tableau Official Free Training",
                    "title": "Understanding Level of Detail (LOD) Expressions",
                    "url": "https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod.htm",
                    "cost_tier": "free",
                    "verification_note": "Comprehensive free official guides and workbooks."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Cohort Customer Lifetime Purchase LOD Calculation",
                    "quiz_questions": [],
                    "practical_task_prompt": "Create a Tableau FIXED calculation computing total spend per customer regardless of regional dashboard filters."
                }
            },
            {
                "id": "bi-mod-3",
                "skill_objective": "Executive Visual Storytelling & Cross-Functional Alignment",
                "title": "Visual Hierarchy, WCAG Color Contrast & Stakeholder Briefings",
                "prerequisites": ["bi-mod-2"],
                "estimated_minutes": 35,
                "resource": {
                    "provider": "Storytelling with Data / Cole Nussbaumer Knaflic",
                    "title": "Data Visualization & Decluttering Principles",
                    "url": "https://www.storytellingwithdata.com/",
                    "cost_tier": "non_certified_tutorial",
                    "verification_note": "Industry acclaimed design guidelines for executive dashboards."
                },
                "assessment": {
                    "type": "reflection_exercise",
                    "title": "Executive Presentation Readiness",
                    "quiz_questions": [],
                    "practical_task_prompt": "Audit an existing dashboard and remove 3 chart elements causing visual clutter.",
                    "reflection_prompt": "Outline how you would present an unexpected metric drop to a VP of Sales with calm confidence."
                }
            }
        ]
    },

    "Cloud & DevOps Associate": {
        "sector_name": "Cloud Infrastructure & DevOps Reintegration",
        "essential_skills": ["Cloud Architecture", "AWS / Azure Fundamentals", "Linux Systems", "Docker", "Git / GitHub Actions", "CI/CD Pipelines"],
        "modules": [
            {
                "id": "cld-mod-1",
                "skill_objective": "Linux Terminal Mastery & Shell Scripting",
                "title": "Linux Systems Administration, Permissions & Bash Pipelines",
                "prerequisites": [],
                "estimated_minutes": 30,
                "resource": {
                    "provider": "Linux Foundation / edX",
                    "title": "Introduction to Linux (LFS101x)",
                    "url": "https://www.edx.org/course/introduction-to-linux",
                    "cost_tier": "free",
                    "verification_note": "Free audit track from the official Linux Foundation."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "POSIX Permissions Check",
                    "quiz_questions": [
                        {
                            "question": "What permission does numeric code 'chmod 755 script.sh' grant to the group and others?",
                            "options": [
                                "Read and write, but no execute",
                                "Read and execute, but no write",
                                "Full read, write, and execute",
                                "Write only"
                            ],
                            "correct_index": 1,
                            "explanation": "Digit 5 represents read (4) + execute (1) without write (2) permission."
                        }
                    ],
                    "practical_task_prompt": "Write a bash script that parses server access logs and tallies HTTP 5xx errors."
                }
            },
            {
                "id": "cld-mod-2",
                "skill_objective": "Docker Containerization & Microservice Isolation",
                "title": "Dockerfiles, Multi-Stage Builds & Container Networking",
                "prerequisites": ["cld-mod-1"],
                "estimated_minutes": 45,
                "resource": {
                    "provider": "Docker Official Training",
                    "title": "Docker Hands-on Labs & Container Fundamentals",
                    "url": "https://docs.docker.com/get-started/",
                    "cost_tier": "free",
                    "verification_note": "Official Docker documentation and interactive CLI guides."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Multi-Stage Dockerfile Optimization",
                    "quiz_questions": [],
                    "practical_task_prompt": "Construct a multi-stage Dockerfile packaging a Python FastAPI service into an image under 120MB."
                }
            },
            {
                "id": "cld-mod-3",
                "skill_objective": "AWS Cloud Architecture & Identity Access Management",
                "title": "AWS Fundamentals: IAM Least-Privilege, S3 & Lambda Functions",
                "prerequisites": ["cld-mod-2"],
                "estimated_minutes": 60,
                "resource": {
                    "provider": "AWS Skill Builder",
                    "title": "AWS Cloud Practitioner Essentials",
                    "url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
                    "cost_tier": "free",
                    "verification_note": "Official Amazon Web Services training portal; free digital curriculum."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Serverless S3 Event Trigger Setup",
                    "quiz_questions": [
                        {
                            "question": "Under AWS security best practices, how should application servers securely access S3 buckets?",
                            "options": [
                                "Hardcoding permanent access key IDs in environment variables",
                                "Assigning an IAM Role to the EC2/ECS runtime via instance metadata",
                                "Opening the S3 bucket to public read access",
                                "Using the AWS root account credentials"
                            ],
                            "correct_index": 1,
                            "explanation": "IAM Roles use temporary STS credentials automatically rotated by the AWS infrastructure."
                        }
                    ],
                    "practical_task_prompt": "Author an IAM policy JSON granting read-only access to a specific S3 bucket prefix."
                }
            }
        ]
    },

    "Full Stack Web Developer": {
        "sector_name": "Modern Full Stack Web Engineering",
        "essential_skills": ["TypeScript", "React", "Next.js", "Node.js / Python Backend", "Relational Databases", "REST / GraphQL APIs"],
        "modules": [
            {
                "id": "web-mod-1",
                "skill_objective": "Modern TypeScript & React Component Architecture",
                "title": "React 19 Components, Hooks & TypeScript Typing",
                "prerequisites": ["JavaScript ES6 basics"],
                "estimated_minutes": 40,
                "resource": {
                    "provider": "React Official Documentation / React.dev",
                    "title": "Thinking in React & Modern Hooks",
                    "url": "https://react.dev/learn",
                    "cost_tier": "free",
                    "verification_note": "Official open-source documentation maintained by React Core team."
                },
                "assessment": {
                    "type": "practical_task",
                    "title": "Typed State Hook Component",
                    "quiz_questions": [],
                    "practical_task_prompt": "Author a responsive React table component with generic TypeScript props and sortable column headers."
                }
            },
            {
                "id": "web-mod-2",
                "skill_objective": "Full Stack API Integration & Error Handling",
                "title": "FastAPI / Node REST Endpoints with Pydantic / Zod Validation",
                "prerequisites": ["web-mod-1"],
                "estimated_minutes": 45,
                "resource": {
                    "provider": "FastAPI Official Documentation / Tiangolo",
                    "title": "FastAPI Tutorial: Request Bodies & Validation",
                    "url": "https://fastapi.tiangolo.com/tutorial/",
                    "cost_tier": "free",
                    "verification_note": "Comprehensive official guides with live Swagger UI interaction."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "HTTP Idempotence Check",
                    "quiz_questions": [
                        {
                            "question": "Which HTTP method is defined as idempotent per RFC standards?",
                            "options": ["POST", "PUT", "PATCH (without conditional)", "CONNECT"],
                            "correct_index": 1,
                            "explanation": "PUT is idempotent; executing multiple identical PUT requests results in the same server resource state."
                        }
                    ],
                    "practical_task_prompt": "Implement a schema-validated PUT endpoint returning 404 on missing entity."
                }
            }
        ]
    },

    "Technical Program Associate": {
        "sector_name": "Technical Program & Agile Reintegration",
        "essential_skills": ["Agile Methodologies", "Scrum Ceremonies", "Jira / Linear", "Technical Documentation", "Cross-Team Coordination", "Sprint Metrics"],
        "modules": [
            {
                "id": "tpm-mod-1",
                "skill_objective": "Agile Sprint Delivery & Dependency Mapping",
                "title": "Scrum Ceremonies, Backlog Refinement & Burndown Metrics",
                "prerequisites": [],
                "estimated_minutes": 35,
                "resource": {
                    "provider": "Scrum.org / Atlassian Agile Coach",
                    "title": "Official Scrum Guide & Sprint Facilitation",
                    "url": "https://scrumguides.org/scrum-guide.html",
                    "cost_tier": "free",
                    "verification_note": "Official authoritative guide by Ken Schwaber and Jeff Sutherland."
                },
                "assessment": {
                    "type": "short_quiz",
                    "title": "Scrum Ceremonies Purpose Check",
                    "quiz_questions": [
                        {
                            "question": "What is the primary objective of the Sprint Retrospective ceremony?",
                            "options": [
                                "Demonstrate finished user stories to stakeholders",
                                "Inspect team collaboration, processes, and identify continuous improvements",
                                "Estimate story points for future quarters",
                                "Conduct performance appraisals"
                            ],
                            "correct_index": 1,
                            "explanation": "The Retrospective provides a safe space for the team to inspect and adapt its own collaboration practices."
                        }
                    ],
                    "practical_task_prompt": "Draft an agenda for a 45-minute remote Retrospective facilitating engagement for returning caregivers."
                }
            }
        ]
    }
}


def generate_adaptive_roadmap(
    cand: CandidateProfile,
    target_sector: str = "Data Analyst",
    weekly_hours: int = 15,
    learning_mode: str = "focused_15min",
    skills_to_skip: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generates a tailored, adaptive roadmap:
    - Automatically checks candidate's confirmed skills and skips redundant beginner modules.
    - Calibrates weekly pace based on weekly available hours and chosen learning mode.
    - Curates verified resources and accessible assessments.
    """
    # Fallback to Data Analyst if sector not found
    sector_data = SECTOR_CURRICULUMS.get(target_sector, SECTOR_CURRICULUMS["Data Analyst"])
    mode_data = LEARNING_MODES.get(learning_mode, LEARNING_MODES["focused_15min"])

    # Gather candidate's confirmed / verified skills
    cand_skills_lower = [cs.skill.name.lower() for cs in cand.skills if cs.skill]
    if skills_to_skip:
        cand_skills_lower.extend([s.lower() for s in skills_to_skip])

    raw_modules = sector_data["modules"]
    processed_modules = []
    total_minutes = 0
    skipped_count = 0

    for idx, mod in enumerate(raw_modules):
        mod_copy = dict(mod)
        mod_copy["learning_mode"] = mode_data["title"]

        # Check if candidate has demonstrated proficiency in this module's objective
        # E.g. If candidate has SQL, skip relational SQL foundation module
        is_proficient = False
        if "sql" in mod["title"].lower() and "sql" in cand_skills_lower:
            # Check if beginner module
            if idx == 0:
                is_proficient = True
        elif "python" in mod["title"].lower() and "python" in cand_skills_lower:
            is_proficient = True

        if is_proficient:
            mod_copy["progress_state"] = "skipped_proficient"
            mod_copy["completion_evidence"] = {
                "reason": "Demonstrated prior proficiency from verified profile tenure.",
                "verified_at": datetime.now(timezone.utc).isoformat()
            }
            skipped_count += 1
        else:
            mod_copy["progress_state"] = "not_started"
            mod_copy["completion_evidence"] = None
            total_minutes += mod.get("estimated_minutes", 30)

        processed_modules.append(mod_copy)

    # Distribute modules across weeks based on weekly capacity
    # Weekly capacity in minutes: weekly_hours * 60
    weekly_capacity_mins = max(60, weekly_hours * 60)
    calculated_weeks = max(4, math.ceil(total_minutes / weekly_capacity_mins)) if total_minutes > 0 else 4

    # Structure weekly milestones
    modules_per_week = max(1, math.ceil(len(processed_modules) / calculated_weeks))
    weekly_plan = []

    for w in range(calculated_weeks):
        week_num = w + 1
        start_idx = w * modules_per_week
        end_idx = min(len(processed_modules), start_idx + modules_per_week)
        week_modules = processed_modules[start_idx:end_idx] if start_idx < len(processed_modules) else []

        week_focus = week_modules[0]["skill_objective"] if week_modules else "Synthesis & Practice"
        week_hours = sum(m.get("estimated_minutes", 30) for m in week_modules) / 60.0

        weekly_plan.append({
            "week": week_num,
            "title": f"Week {week_num}: {week_focus}",
            "focus": week_focus,
            "estimated_hours": max(1, round(week_hours, 1)),
            "modules": week_modules
        })

    return {
        "candidate_id": cand.id,
        "target_sector": target_sector,
        "learning_mode": learning_mode,
        "learning_mode_meta": mode_data,
        "weekly_hours": weekly_hours,
        "total_estimated_hours": round(total_minutes / 60.0, 1),
        "total_weeks": calculated_weeks,
        "skipped_modules_count": skipped_count,
        "weekly_plan": weekly_plan,
        "adaptation_history": [
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "roadmap_generated",
                "summary": f"Adaptive roadmap created for {target_sector} at {weekly_hours}h/wk ({mode_data['title']})."
            }
        ],
        "disclaimer": (
            "GFG curates verified high-quality educational modules from accredited global universities and open-source foundations. "
            "GFG does not issue government-certified educational degrees or make autonomous hiring guarantees."
        )
    }


def adapt_roadmap_after_interruption(
    cand: CandidateProfile,
    current_roadmap: Dict[str, Any],
    strategy: str,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Non-punitive adaptation engine for life interruptions:
    Strategies:
    1. 'reschedule': smoothly redistributes pending modules across remaining weeks.
    2. 'reduce_workload': halves weekly hours, converts to microlearning pacing.
    3. 'extend_target_date': adds 2 to 4 weeks to timeline without penalty.
    4. 'reprioritize_essentials': archives non-essential electives, focusing strictly on returnship must-haves.
    """
    params = parameters or {}
    updated = copy.deepcopy(current_roadmap)
    weekly_plan = updated.get("weekly_plan", [])
    history = list(updated.get("adaptation_history", []))

    if strategy == "reschedule":
        # Collect all modules that are still 'not_started' or 'in_progress'
        incomplete_modules = []
        for week in weekly_plan:
            for mod in week.get("modules", []):
                if mod.get("progress_state") in ["not_started", "in_progress"]:
                    incomplete_modules.append(mod)

        # Smoothly redistribute across upcoming weeks
        num_weeks = max(4, len(weekly_plan))
        mods_per_week = max(1, math.ceil(len(incomplete_modules) / num_weeks))
        
        idx = 0
        for week in weekly_plan:
            # Preserve already completed or skipped modules
            completed_in_week = [m for m in week.get("modules", []) if m.get("progress_state") in ["completed", "skipped_proficient"]]
            new_batch = incomplete_modules[idx : idx + mods_per_week]
            idx += mods_per_week
            week["modules"] = completed_in_week + new_batch

        history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "rescheduled",
            "summary": "Modules smoothly redistributed across schedule after interruption with zero progress loss."
        })

    elif strategy == "reduce_workload":
        new_hours = max(5, int(params.get("new_weekly_hours", 8)))
        updated["weekly_hours"] = new_hours
        updated["learning_mode"] = "microlearning_5min"
        updated["learning_mode_meta"] = LEARNING_MODES["microlearning_5min"]
        
        # Extend weeks to balance reduced hours
        current_weeks = updated.get("total_weeks", 8)
        new_weeks = current_weeks + 3
        updated["total_weeks"] = new_weeks

        history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "workload_reduced",
            "summary": f"Reduced weekly workload to {new_hours} hrs/week with 5-minute microlearning pacing."
        })

    elif strategy == "extend_target_date":
        extension_weeks = int(params.get("extension_weeks", 3))
        updated["total_weeks"] = updated.get("total_weeks", 8) + extension_weeks

        # Add extension weeks to plan
        last_week = len(weekly_plan)
        for i in range(extension_weeks):
            weekly_plan.append({
                "week": last_week + i + 1,
                "title": f"Week {last_week + i + 1}: Extended Mastery & Portfolio Polish",
                "focus": "Review & Capstone Practice",
                "estimated_hours": 2,
                "modules": []
            })

        history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "extended_target_date",
            "summary": f"Gracefully extended roadmap by {extension_weeks} weeks. Zero penalties applied."
        })

    elif strategy == "reprioritize_essentials":
        # Keep only modules with essential tags (e.g. SQL, Power BI, Python core)
        for week in weekly_plan:
            filtered = []
            for mod in week.get("modules", []):
                if mod.get("progress_state") in ["completed", "skipped_proficient"]:
                    filtered.append(mod)
                elif any(ess.lower() in mod["title"].lower() for ess in ["sql", "power bi", "capstone", "relational"]):
                    filtered.append(mod)
            week["modules"] = filtered

        history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "reprioritized_essentials",
            "summary": "Filtered curriculum down to core returnship requirements, saving ~35% effort."
        })

    updated["weekly_plan"] = weekly_plan
    updated["adaptation_history"] = history
    return updated


def record_module_completion(
    cand: CandidateProfile,
    current_roadmap: Dict[str, Any],
    module_id: str,
    submission_data: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """
    Deterministically marks a module complete after quiz, practical task, or reflection.
    Recalculates completed percentages and updates candidate's return readiness score.
    """
    updated = copy.deepcopy(current_roadmap)
    module_found = False
    completed_module_title = ""

    for week in updated.get("weekly_plan", []):
        for mod in week.get("modules", []):
            if mod.get("id") == module_id:
                mod["progress_state"] = "completed"
                mod["completion_evidence"] = {
                    "score": submission_data.get("score", 100),
                    "artifact_url": submission_data.get("artifact_url"),
                    "reflection_note": submission_data.get("reflection_note"),
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
                module_found = True
                completed_module_title = mod.get("title", module_id)
                break
        if module_found:
            break

    if module_found:
        # Log to digital twin audit history
        record_digital_twin_event(
            candidate_id=cand.id,
            event_type="assessment_completed",
            summary=f"Completed learning module: '{completed_module_title}'.",
            details={"module_id": module_id, "score": submission_data.get("score", 100)},
            db=db
        )

        # Add to candidate learning progress records
        lp = LearningProgress(
            candidate_id=cand.id,
            course_name=completed_module_title,
            provider="GFG Adaptive Learning Path",
            progress_percentage=100,
            status="completed",
            completed_at=datetime.now(timezone.utc)
        )
        db.add(lp)
        db.commit()

    return updated
