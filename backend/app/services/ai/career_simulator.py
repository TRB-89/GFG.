"""
Career Future Simulator Engine (Module 4)
Interactive, grounded career-planning simulator allowing candidates to explore how acquiring skills,
earning qualifications, changing industries, switching to remote work, adjusting availability,
completing projects, or starting returnships influences their career readiness and options.
Grounded in versioned occupational taxonomies. Distinguishes hypothetical from verified credentials.
"""

from typing import Dict, Any, List, Optional
import math
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.candidate import CandidateProfile, CandidateSkill, CandidateProject, Certificate, LearningProgress, SavedSimulation
from backend.app.services.ai.digital_twin_engine import DOCUMENTED_OCCUPATIONS, OCCUPATION_TAXONOMY_VERSION, compute_return_readiness

# Reference library of skills, qualifications, projects, and industries
SIMULATABLE_SKILLS = {
    "Power BI": {
        "hours": 40,
        "category": "BI & Analytics",
        "unlocked_requirements": [
            "Interactive Business Intelligence Dashboards",
            "DAX (Data Analysis Expressions) calculated measures",
            "Executive KPI reporting & data modeling (star-schema)"
        ],
        "project": {
            "title": "Customer Churn Executive Telemetry Dashboard",
            "tools": "Power BI, DAX, Star-Schema, SQL Server",
            "description": "Interactive multi-tab executive dashboard analyzing customer retention drivers, cohort telemetry, and monthly recurring revenue."
        },
        "target_boosts": {
            "Data Analyst": 9,
            "Business Intelligence Specialist": 14,
            "Technical Program Associate": 5,
            "Full Stack Web Developer": 2,
            "Cloud & DevOps Associate": 2,
        }
    },
    "Python": {
        "hours": 45,
        "category": "Programming & Data Science",
        "unlocked_requirements": [
            "Automated data ingestion with Pandas & NumPy",
            "Scripted data transformation & cleansing pipelines",
            "Basic statistical modeling & exploratory data analysis"
        ],
        "project": {
            "title": "Automated ETL Pipeline & Data Cleaning Service",
            "tools": "Python, Pandas, Requests, SQLite, Pytest",
            "description": "Production Python script that consumes REST API data, handles anomalies and missing records, and outputs cleaned relational tables."
        },
        "target_boosts": {
            "Data Analyst": 10,
            "Business Intelligence Specialist": 8,
            "Full Stack Web Developer": 10,
            "Cloud & DevOps Associate": 7,
            "Technical Program Associate": 4,
        }
    },
    "AWS Cloud": {
        "hours": 50,
        "category": "Cloud Infrastructure",
        "unlocked_requirements": [
            "Cloud storage (S3) and serverless functions (Lambda)",
            "Relational database management (RDS / Aurora)",
            "Basic IAM role security and VPC network architecture"
        ],
        "project": {
            "title": "Serverless Data Extraction Architecture on AWS",
            "tools": "AWS S3, Lambda, IAM, CloudWatch, Terraform",
            "description": "Event-driven architecture that processes incoming batch files, triggers transformations, and alerts via SNS."
        },
        "target_boosts": {
            "Cloud & DevOps Associate": 16,
            "Full Stack Web Developer": 8,
            "Data Analyst": 5,
            "Business Intelligence Specialist": 4,
            "Technical Program Associate": 6,
        }
    },
    "Docker": {
        "hours": 30,
        "category": "DevOps & Containers",
        "unlocked_requirements": [
            "Containerization of application runtimes and microservices",
            "Multi-stage Dockerfile optimization and lightweight images",
            "Local service orchestration using Docker Compose"
        ],
        "project": {
            "title": "Containerized Multi-Container Application Stack",
            "tools": "Docker, Docker Compose, Nginx, PostgreSQL",
            "description": "Fully reproducible local container environment with web, worker, and database services isolated in dedicated networks."
        },
        "target_boosts": {
            "Cloud & DevOps Associate": 12,
            "Full Stack Web Developer": 9,
            "Data Analyst": 3,
            "Business Intelligence Specialist": 3,
            "Technical Program Associate": 5,
        }
    },
    "React": {
        "hours": 50,
        "category": "Frontend Engineering",
        "unlocked_requirements": [
            "Component-driven responsive user interfaces",
            "State management with React Hooks and Context",
            "Client-side API consumption and asynchronous data loading"
        ],
        "project": {
            "title": "Accessible SaaS Metrics & Operational Portal",
            "tools": "React, TypeScript, TailwindCSS, Chart.js",
            "description": "Modern responsive dashboard offering interactive data filters, live chart updates, and WCAG AA accessibility compliance."
        },
        "target_boosts": {
            "Full Stack Web Developer": 18,
            "Business Intelligence Specialist": 5,
            "Data Analyst": 4,
            "Technical Program Associate": 5,
            "Cloud & DevOps Associate": 3,
        }
    },
    "Tableau": {
        "hours": 35,
        "category": "BI & Analytics",
        "unlocked_requirements": [
            "Enterprise visual data storytelling and dashboards",
            "Calculated fields and level-of-detail (LOD) expressions",
            "Published interactive workbooks with parameter controls"
        ],
        "project": {
            "title": "Regional Sales Performance Visual Story",
            "tools": "Tableau Desktop, LOD Expressions, Parameter Controls",
            "description": "Geographical sales breakdown visual story allowing stakeholders to drill down from country to territory level."
        },
        "target_boosts": {
            "Business Intelligence Specialist": 12,
            "Data Analyst": 8,
            "Technical Program Associate": 4,
            "Full Stack Web Developer": 2,
            "Cloud & DevOps Associate": 1,
        }
    },
    "Statistics & A/B Testing": {
        "hours": 30,
        "category": "Statistical Science",
        "unlocked_requirements": [
            "Hypothesis testing (p-values, t-tests, confidence intervals)",
            "Sample size determination and statistical power analysis",
            "Controlled experiment measurement and confounding variable control"
        ],
        "project": {
            "title": "E-Commerce Checkout Funnel A/B Experimentation Report",
            "tools": "Python, SciPy, Statsmodels, Jupyter Notebook",
            "description": "Rigorous statistical analysis of a simulated 50,000-user A/B test with statistical significance testing and executive takeaway memo."
        },
        "target_boosts": {
            "Data Analyst": 9,
            "Business Intelligence Specialist": 6,
            "Technical Program Associate": 5,
            "Full Stack Web Developer": 2,
            "Cloud & DevOps Associate": 1,
        }
    }
}

SIMULATABLE_QUALIFICATIONS = {
    "Microsoft PL-300: Power BI Data Analyst": {
        "issuer": "Microsoft",
        "hours": 60,
        "target_boost": {"Business Intelligence Specialist": 16, "Data Analyst": 12},
        "summary": "Industry-standard credential demonstrating enterprise proficiency in data preparation, modeling, visualization, and workspace deployment."
    },
    "AWS Certified Cloud Practitioner": {
        "issuer": "Amazon Web Services",
        "hours": 50,
        "target_boost": {"Cloud & DevOps Associate": 15, "Full Stack Web Developer": 8, "Data Analyst": 5},
        "summary": "Validates foundational cloud concepts, security compliance, billing architecture, and core AWS compute/storage services."
    },
    "Google Data Analytics Professional Certificate": {
        "issuer": "Google",
        "hours": 70,
        "target_boost": {"Data Analyst": 14, "Business Intelligence Specialist": 10},
        "summary": "Comprehensive 8-course program covering spreadsheet manipulation, SQL queries, R programming, Tableau, and case study presentation."
    },
    "Professional Scrum Master I (PSM I)": {
        "issuer": "Scrum.org",
        "hours": 35,
        "target_boost": {"Technical Program Associate": 18, "Full Stack Web Developer": 4},
        "summary": "Demonstrates mastery of Agile principles, sprint ceremonies, backlog grooming, and servant-leadership facilitation."
    }
}

SIMULATABLE_INDUSTRIES = {
    "HealthTech": {
        "context": "Healthcare & Life Sciences",
        "specific_demands": ["HIPAA & patient privacy compliance", "Clinical data standards (HL7/FHIR)", "High data fidelity tolerance"],
        "transferable_leverage": "Existing data hygiene and precision habits transfer seamlessly to audit-sensitive healthcare workflows."
    },
    "FinTech": {
        "context": "Financial Services & Banking",
        "specific_demands": ["PCI-DSS financial security", "Real-time ledger reconciliation", "Fraud anomaly detection"],
        "transferable_leverage": "Strong SQL aggregation and double-entry mathematical precision translate directly into quantitative financial analysis."
    },
    "EdTech": {
        "context": "Education Technology & Learning Analytics",
        "specific_demands": ["Learner engagement telemetry", "Cohort retention metrics", "Gamified feature assessment"],
        "transferable_leverage": "Analytics on user progress and retention metrics mirror customer churn and product health analytics."
    },
    "ClimateTech": {
        "context": "Clean Energy & Carbon Accounting",
        "specific_demands": ["Scope 1/2/3 carbon tracking", "Sensor IoT data streams", "Environmental regulatory reporting"],
        "transferable_leverage": "Time-series data manipulation and multi-source ETL pipelines apply directly to carbon accounting models."
    },
    "E-Commerce": {
        "context": "Retail & Digital Commerce",
        "specific_demands": ["Clickstream conversion funnels", "Inventory turnover forecasting", "Recommendation engine signals"],
        "transferable_leverage": "Customer segmentation, purchase behavior analysis, and dashboarding are standard across modern e-commerce desks."
    }
}

SIMULATABLE_PROJECTS = {
    "Customer Churn Telemetry Dashboard": {
        "hours": 25,
        "readiness_boost": 6,
        "target_role": "Data Analyst",
        "technologies": "Power BI, DAX, SQL, Star Schema",
        "summary": "End-to-end customer churn analytics project with multi-dimensional filters, metric decomposers, and business strategy findings."
    },
    "Automated Multi-Source ETL Pipeline": {
        "hours": 30,
        "readiness_boost": 7,
        "target_role": "Data Analyst",
        "technologies": "Python, Pandas, PostgreSQL, Docker",
        "summary": "Automated ingestion pipeline with automated testing, error recovery, schema validation, and logging."
    },
    "Full-Stack Metric Exploration Portal": {
        "hours": 40,
        "readiness_boost": 8,
        "target_role": "Full Stack Web Developer",
        "technologies": "React, TypeScript, FastAPI, SQLite",
        "summary": "Interactive web app enabling non-technical users to query database metrics and export reports."
    },
    "Infrastructure as Code Deployment": {
        "hours": 35,
        "readiness_boost": 8,
        "target_role": "Cloud & DevOps Associate",
        "technologies": "AWS, Terraform, Docker, GitHub Actions",
        "summary": "Fully declarative cloud environment deploying containerized microservices through CI/CD pipelines."
    }
}


def get_candidate_baseline(cand: CandidateProfile) -> Dict[str, Any]:
    """Computes candidate's current baseline state."""
    skills = [s.skill.name for s in cand.skills if s.skill]
    target_role = cand.career_goals or cand.previous_job_title or "Data Analyst"
    
    # Calculate baseline readiness score
    user_prof = cand.user if hasattr(cand, "user") else None
    readiness = compute_return_readiness(cand, user_prof) if user_prof else {"readiness_score": 82}
    base_readiness = readiness.get("readiness_score", 82)

    # Calculate baseline match to target role
    target_doc = DOCUMENTED_OCCUPATIONS.get(target_role, DOCUMENTED_OCCUPATIONS["Data Analyst"])
    req_skills = target_doc.get("core_requirements", [])
    
    skill_names_lower = [s.lower() for s in skills]
    satisfied_count = sum(1 for req in req_skills if req.lower() in skill_names_lower)
    base_match = min(92, max(65, int((satisfied_count / max(1, len(req_skills))) * 85) + 10))

    missing_skills = [req for req in req_skills if req.lower() not in skill_names_lower]
    
    return {
        "target_role": target_role,
        "readiness_score": base_readiness,
        "target_role_match": base_match,
        "verified_skills": skills,
        "remaining_gaps": missing_skills,
        "weekly_hours": (cand.available_hours_per_day * 5) if cand.available_hours_per_day else 15,
        "work_mode": cand.preferred_work_mode or "Hybrid",
        "target_occupations_baseline": {
            occ: min(92, max(60, int(sum(1 for s in DOCUMENTED_OCCUPATIONS[occ].get("core_requirements", []) if s.lower() in skill_names_lower) / max(1, len(DOCUMENTED_OCCUPATIONS[occ].get("core_requirements", []))) * 85) + 10))
            for occ in DOCUMENTED_OCCUPATIONS
        }
    }


def simulate_career_scenario(
    cand: CandidateProfile,
    scenario_type: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executes a structured, grounded career future simulation.
    Scenarios:
    1. learn_skill
    2. earn_qualification
    3. change_industry
    4. switch_remote
    5. adjust_availability
    6. complete_project
    7. start_returnship
    """
    baseline = get_candidate_baseline(cand)
    target_role = parameters.get("target_career") or baseline["target_role"]
    weekly_hours = int(parameters.get("weekly_hours", 15))
    learning_intensity = parameters.get("learning_intensity", "steady") # relaxed (5-10), steady (15-20), intensive (25-30)
    work_mode = parameters.get("work_mode") or baseline["work_mode"]

    after_readiness = baseline["readiness_score"]
    after_match = baseline["target_role_match"]
    hypothetical_gained = []
    newly_satisfied = []
    remaining_gaps = list(baseline["remaining_gaps"])
    learning_hours = 0
    pathways_affected = []
    roadmap_changes = []
    capstone_project = None
    ai_explanation = ""

    # Ensure target_role exists in documented occupations
    target_doc = DOCUMENTED_OCCUPATIONS.get(target_role, DOCUMENTED_OCCUPATIONS["Data Analyst"])

    # -------------------------------------------------------------
    # 1. LEARN A NEW SKILL
    # -------------------------------------------------------------
    if scenario_type == "learn_skill":
        skill_name = parameters.get("skill", "Power BI")
        meta = SIMULATABLE_SKILLS.get(skill_name, {
            "hours": 40,
            "category": "Technical Competency",
            "unlocked_requirements": [f"Demonstrated proficiency in {skill_name}"],
            "project": {
                "title": f"Applied {skill_name} Milestone Project",
                "tools": f"{skill_name}, SQL, Git",
                "description": f"Hands-on portfolio repository applying {skill_name} to real-world domain problems."
            },
            "target_boosts": {target_role: 8}
        })

        learning_hours = meta["hours"]
        hypothetical_gained.append({
            "name": skill_name,
            "provenance": "hypothetical_simulation",
            "proficiency": "Intermediate (Projected)",
            "category": meta.get("category", "Technical")
        })

        newly_satisfied = meta.get("unlocked_requirements", [])
        # Remove from remaining gaps if present
        remaining_gaps = [g for g in remaining_gaps if g.lower() != skill_name.lower()]

        boost = meta.get("target_boosts", {}).get(target_role, 8)
        after_match = min(98, baseline["target_role_match"] + boost)
        after_readiness = min(98, baseline["readiness_score"] + int(boost * 0.75))

        capstone_project = meta.get("project")

        # Affect on other pathways
        for occ, occ_meta in DOCUMENTED_OCCUPATIONS.items():
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            occ_boost = meta.get("target_boosts", {}).get(occ, 2)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(98, base_occ_match + occ_boost),
                "delta": occ_boost
            })

        roadmap_changes = [
            {"week": 3, "change": f"Inject 2-week deep dive into {skill_name} core mechanics and data pipelines."},
            {"week": 5, "change": f"Upgrade portfolio deliverable to feature {capstone_project['title']}."}
        ]

        ai_explanation = (
            f"Acquiring {skill_name} directly addresses a core requirement for {target_role}. "
            f"Based on your background in {', '.join(baseline['verified_skills'][:3])}, your existing foundations "
            f"allow you to master {skill_name} in an estimated {learning_hours} hours. "
            f"At {weekly_hours} hours/week, you could complete this milestone in ~{max(1, math.ceil(learning_hours / max(1, weekly_hours)))} weeks."
        )

    # -------------------------------------------------------------
    # 2. EARN A QUALIFICATION
    # -------------------------------------------------------------
    elif scenario_type == "earn_qualification":
        qual_name = parameters.get("qualification", "Microsoft PL-300: Power BI Data Analyst")
        qual_meta = SIMULATABLE_QUALIFICATIONS.get(qual_name, {
            "issuer": "Accredited Body",
            "hours": 50,
            "target_boost": {target_role: 12},
            "summary": f"Recognized credential validating competency in {qual_name}."
        })

        learning_hours = qual_meta["hours"]
        hypothetical_gained.append({
            "name": qual_name,
            "provenance": "hypothetical_simulation",
            "proficiency": "Certified (Projected)",
            "issuer": qual_meta.get("issuer", "Accredited")
        })

        newly_satisfied = [
            f"Formal accredited validation: {qual_name}",
            "Enterprise compliance and governance standards",
            "Validated domain competence on Career Passport"
        ]

        boost = qual_meta.get("target_boost", {}).get(target_role, 10)
        after_match = min(98, baseline["target_role_match"] + boost)
        after_readiness = min(98, baseline["readiness_score"] + int(boost * 0.85))

        capstone_project = {
            "title": f"Official Exam Preparation & Capstone Case Study ({qual_name})",
            "tools": "Exam Syllabus, Practice Test Suites, GitHub Portfolio",
            "description": qual_meta.get("summary", "Rigorous preparation curriculum with official practice assessments.")
        }

        for occ, occ_meta in DOCUMENTED_OCCUPATIONS.items():
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            occ_boost = qual_meta.get("target_boost", {}).get(occ, 3)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(98, base_occ_match + occ_boost),
                "delta": occ_boost
            })

        roadmap_changes = [
            {"week": 4, "change": f"Integrate exam readiness mocks for {qual_name}."},
            {"week": 8, "change": "Publish verified digital credential to Career Passport."}
        ]

        ai_explanation = (
            f"Earning the {qual_name} credential adds third-party verified credibility to your comeback profile. "
            f"Employers value structured certifications after a career break because they demonstrate up-to-date domain rigour. "
            f"Estimated commitment is {learning_hours} total hours (~{max(1, math.ceil(learning_hours / max(1, weekly_hours)))} weeks)."
        )

    # -------------------------------------------------------------
    # 3. CHANGE INDUSTRIES
    # -------------------------------------------------------------
    elif scenario_type == "change_industry":
        target_industry = parameters.get("industry", "HealthTech")
        ind_meta = SIMULATABLE_INDUSTRIES.get(target_industry, {
            "context": target_industry,
            "specific_demands": ["Domain compliance", "Sector data models", "Industry KPI standards"],
            "transferable_leverage": "Core analytical logic and problem solving translate across sectors."
        })

        learning_hours = 25
        hypothetical_gained.append({
            "name": f"{target_industry} Domain Knowledge",
            "provenance": "hypothetical_simulation",
            "proficiency": "Applied Familiarity (Projected)",
            "category": "Domain Context"
        })

        newly_satisfied = ind_meta.get("specific_demands", [])
        boost = 6
        after_match = min(96, baseline["target_role_match"] + boost)
        after_readiness = min(95, baseline["readiness_score"] + 4)

        capstone_project = {
            "title": f"{target_industry} Domain Benchmark Case Study",
            "tools": "SQL, Python, Domain Standards Documentation",
            "description": f"Tailored analytics study analyzing core challenges, regulations, and operational metrics in {target_industry}."
        }

        for occ in DOCUMENTED_OCCUPATIONS:
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(95, base_occ_match + 4),
                "delta": 4
            })

        roadmap_changes = [
            {"week": 2, "change": f"Study {target_industry} regulatory constraints and data schemas."},
            {"week": 6, "change": f"Align capstone business problem with {target_industry} operational hurdles."}
        ]

        ai_explanation = (
            f"Pivoting into {target_industry} is facilitated by your transferable experience in {', '.join(baseline['verified_skills'][:2])}. "
            f"{ind_meta.get('transferable_leverage', '')} By spending {learning_hours} hours on domain-specific vocabulary and compliance, "
            f"your candidacy becomes compelling for returnship tracks in {target_industry}."
        )

    # -------------------------------------------------------------
    # 4. SWITCH TO REMOTE WORK
    # -------------------------------------------------------------
    elif scenario_type == "switch_remote":
        new_mode = parameters.get("work_mode", "Remote")
        learning_hours = 15
        hypothetical_gained.append({
            "name": "Asynchronous Remote Collaboration Mastery",
            "provenance": "hypothetical_simulation",
            "proficiency": "Demonstrated Practice",
            "category": "Work Arrangement"
        })

        newly_satisfied = [
            "Demonstrated asynchronous documentation (Notion / Loom / Slack)",
            "Autonomous milestone delivery with transparent Git commit logs",
            "Distributed team communication and timezone compatibility"
        ]

        boost = 4
        after_match = min(96, baseline["target_role_match"] + boost)
        after_readiness = min(96, baseline["readiness_score"] + 3)

        capstone_project = {
            "title": "Asynchronous Project Portfolio & Architecture Logbook",
            "tools": "Git, Markdown, Loom, GitHub Discussions",
            "description": "Showcase of self-directed technical documentation proving ease of delivery in distributed, fully remote workplaces."
        }

        for occ in DOCUMENTED_OCCUPATIONS:
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(96, base_occ_match + 3),
                "delta": 3
            })

        roadmap_changes = [
            {"week": 1, "change": "Adopt asynchronous documentation practices across all assignments."},
            {"week": 7, "change": "Simulate remote sprint handoffs and technical RFC memos."}
        ]

        ai_explanation = (
            f"Setting your target to {new_mode} broadens your potential hiring pool to national returnship cohorts. "
            f"Remote returnships prioritize candidates with transparent, written asynchronous hygiene. "
            f"Showcasing documented Git repos and clear technical writing eliminates any employer uncertainty about remote readiness."
        )

    # -------------------------------------------------------------
    # 5. ADJUST WEEKLY AVAILABILITY
    # -------------------------------------------------------------
    elif scenario_type == "adjust_availability":
        new_hours = int(parameters.get("weekly_hours", 20))
        intensity = parameters.get("learning_intensity", "steady")
        
        # Total remaining curriculum hours estimated at 120 hours for career return
        total_curriculum_hours = 110
        base_weeks = math.ceil(total_curriculum_hours / max(1, baseline["weekly_hours"]))
        sim_weeks = math.ceil(total_curriculum_hours / max(1, new_hours))
        weeks_saved = base_weeks - sim_weeks

        learning_hours = total_curriculum_hours
        hypothetical_gained.append({
            "name": f"Paced Commitment ({new_hours} hrs/week - {intensity.title()})",
            "provenance": "hypothetical_simulation",
            "proficiency": f"{new_hours} hrs/wk",
            "category": "Availability"
        })

        newly_satisfied = [
            f"Predictable weekly returnship availability of {new_hours} hours/week",
            f"Accelerated time-to-return: {sim_weeks} weeks vs baseline {base_weeks} weeks",
            "Consistent focus time for capstone and portfolio reviews"
        ]

        # Readines boost from commitment confidence
        boost = 5 if new_hours >= 20 else 2
        after_match = min(96, baseline["target_role_match"] + boost)
        after_readiness = min(96, baseline["readiness_score"] + (5 if new_hours >= 20 else 1))

        for occ in DOCUMENTED_OCCUPATIONS:
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(96, base_occ_match + boost),
                "delta": boost
            })

        roadmap_changes = [
            {"week": 1, "change": f"Re-calibrated daily study blocks for {math.ceil(new_hours / 5)} hours/day, Monday through Friday."},
            {"week": sim_weeks, "change": f"Graduation and employer submission ready at Week {sim_weeks} (accelerated by {abs(weeks_saved)} weeks)."}
        ]

        ai_explanation = (
            f"Adjusting your availability to {new_hours} hours/week under a {intensity} pace "
            f"compresses your comeback timeline from ~{base_weeks} weeks to ~{sim_weeks} weeks. "
            f"This dedicated focus allows you to absorb complex technical material while preserving personal wellbeing."
        )

    # -------------------------------------------------------------
    # 6. COMPLETE A PORTFOLIO PROJECT
    # -------------------------------------------------------------
    elif scenario_type == "complete_project":
        proj_choice = parameters.get("project_title", "Customer Churn Telemetry Dashboard")
        proj_meta = SIMULATABLE_PROJECTS.get(proj_choice, {
            "hours": 30,
            "readiness_boost": 7,
            "target_role": target_role,
            "technologies": "SQL, Python, Analytics",
            "summary": f"Rigorous capstone project demonstrating {proj_choice}."
        })

        learning_hours = proj_meta["hours"]
        hypothetical_gained.append({
            "name": f"Portfolio Artifact: {proj_choice}",
            "provenance": "hypothetical_simulation",
            "proficiency": "Verified Deliverable (Projected)",
            "technologies": proj_meta.get("technologies")
        })

        newly_satisfied = [
            "Independently verifiable GitHub repository with clear README",
            f"Demonstrated application of {proj_meta.get('technologies')}",
            "Practical evidence overcoming the career break tenure gap"
        ]

        boost = proj_meta.get("readiness_boost", 7)
        after_match = min(98, baseline["target_role_match"] + boost)
        after_readiness = min(98, baseline["readiness_score"] + boost)

        capstone_project = {
            "title": proj_choice,
            "tools": proj_meta.get("technologies"),
            "description": proj_meta.get("summary")
        }

        for occ in DOCUMENTED_OCCUPATIONS:
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            p_boost = boost if occ == proj_meta.get("target_role", target_role) else 3
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(98, base_occ_match + p_boost),
                "delta": p_boost
            })

        roadmap_changes = [
            {"week": 4, "change": f"Kick off sprint for {proj_choice}."},
            {"week": 6, "change": f"Peer code-review and publish interactive live demo on Career Passport."}
        ]

        ai_explanation = (
            f"Completing '{proj_choice}' is the most effective single action to convert theoretical readiness into hiring credibility. "
            f"Employers consistently prioritize tangible recent code and dashboard artifacts over historical credentials alone. "
            f"Estimated build time is {learning_hours} hours."
        )

    # -------------------------------------------------------------
    # 7. START A SHORT-TERM RETURNSHIP
    # -------------------------------------------------------------
    elif scenario_type == "start_returnship":
        returnship_title = parameters.get("returnship_title", "Nova Tech 12-Week Analytics Returnship")
        learning_hours = 120 # Over 8-12 weeks
        hypothetical_gained.append({
            "name": f"Returnship Tenure: {returnship_title}",
            "provenance": "hypothetical_simulation",
            "proficiency": "Live Corporate Experience",
            "category": "Corporate Reintegration"
        })

        newly_satisfied = [
            "Recent verifiable corporate tenure on resume & Career Passport",
            "Direct corporate manager recommendation and code-review endorsements",
            "Demonstrated integration into modern engineering and agile sprint cycles",
            "Zero perceived 'career gap penalty' from corporate hiring boards"
        ]

        boost = 14
        after_match = min(98, baseline["target_role_match"] + boost)
        after_readiness = min(98, baseline["readiness_score"] + 12)

        capstone_project = {
            "title": f"Corporate Returnship Capstone at {returnship_title.split()[0]}",
            "tools": "Enterprise SQL Data Warehouse, BI Suites, Jira, Git",
            "description": "Production deliverables implemented under mentorship of senior engineering leads."
        }

        for occ in DOCUMENTED_OCCUPATIONS:
            base_occ_match = baseline["target_occupations_baseline"].get(occ, 70)
            pathways_affected.append({
                "role": occ,
                "before_match": base_occ_match,
                "after_match": min(98, base_occ_match + 8),
                "delta": 8
            })

        roadmap_changes = [
            {"week": 1, "change": "Corporate onboarding, security clearances, and mentor pairing."},
            {"week": 8, "change": "Mid-term returnship presentation to department engineering leadership."},
            {"week": 12, "change": "Conversion evaluation for permanent senior associate role."}
        ]

        ai_explanation = (
            f"Participating in a structured returnship such as '{returnship_title}' eliminates the friction of a career break. "
            f"Returnships provide structured psychological safety, senior peer mentorship, and recent verifiable corporate impact, "
            f"positioning you with a 95%+ permanent placement alignment upon completion."
        )

    # Calculate estimated weeks
    weeks_to_complete = max(1, math.ceil(learning_hours / max(1, weekly_hours))) if learning_hours > 0 else 4

    # Build the full response package
    results = {
        "scenario_type": scenario_type,
        "scenario_name": parameters.get("scenario_name") or f"Simulate: {scenario_type.replace('_', ' ').title()}",
        "parameters": parameters,
        "taxonomy_version": OCCUPATION_TAXONOMY_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "before": {
            "readiness_score": baseline["readiness_score"],
            "target_role": target_role,
            "target_role_match": baseline["target_role_match"],
            "verified_skills": baseline["verified_skills"],
            "remaining_gaps": baseline["remaining_gaps"],
            "weekly_hours": baseline["weekly_hours"],
            "work_mode": baseline["work_mode"],
        },
        "after": {
            "projected_readiness_score": after_readiness,
            "readiness_delta": after_readiness - baseline["readiness_score"],
            "projected_target_role_match": after_match,
            "match_delta": after_match - baseline["target_role_match"],
            "hypothetical_skills_gained": hypothetical_gained,
            "newly_satisfied_requirements": newly_satisfied,
            "remaining_gaps": remaining_gaps,
            "estimated_learning_hours": learning_hours,
            "estimated_weeks_to_complete": weeks_to_complete,
            "weekly_hours": weekly_hours,
            "learning_intensity": learning_intensity,
            "work_mode": work_mode,
            "recommended_capstone_project": capstone_project,
            "pathways_affected": pathways_affected,
            "roadmap_changes": roadmap_changes,
        },
        "ai_explanation": ai_explanation,
        "responsible_ai_disclaimer": (
            "This simulation is an illustrative career-planning projection based on versioned occupational standards. "
            "It does not guarantee employment or specific salary outcomes, does not manufacture employer openings, "
            "and strictly distinguishes hypothetical assets from your verified Career Passport credentials."
        )
    }

    return results


def save_candidate_simulation(
    db: Session,
    cand: CandidateProfile,
    scenario_name: str,
    scenario_type: str,
    parameters: Dict[str, Any],
    results: Dict[str, Any]
) -> SavedSimulation:
    """Saves a simulation scenario for persistent candidate comparison."""
    sim = SavedSimulation(
        candidate_id=cand.id,
        scenario_name=scenario_name,
        scenario_type=scenario_type,
        parameters=parameters,
        results=results
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim


def compare_two_simulations(
    sim_a: Dict[str, Any],
    sim_b: Dict[str, Any]
) -> Dict[str, Any]:
    """Provides side-by-side comparative diagnostics between two scenarios."""
    return {
        "scenario_a": {
            "name": sim_a.get("scenario_name", "Scenario A"),
            "type": sim_a.get("scenario_type"),
            "readiness_score": sim_a.get("after", {}).get("projected_readiness_score"),
            "match_score": sim_a.get("after", {}).get("projected_target_role_match"),
            "learning_hours": sim_a.get("after", {}).get("estimated_learning_hours"),
            "weeks": sim_a.get("after", {}).get("estimated_weeks_to_complete"),
            "skills_gained": [s["name"] for s in sim_a.get("after", {}).get("hypothetical_skills_gained", [])],
            "satisfied_requirements": sim_a.get("after", {}).get("newly_satisfied_requirements", []),
        },
        "scenario_b": {
            "name": sim_b.get("scenario_name", "Scenario B"),
            "type": sim_b.get("scenario_type"),
            "readiness_score": sim_b.get("after", {}).get("projected_readiness_score"),
            "match_score": sim_b.get("after", {}).get("projected_target_role_match"),
            "learning_hours": sim_b.get("after", {}).get("estimated_learning_hours"),
            "weeks": sim_b.get("after", {}).get("estimated_weeks_to_complete"),
            "skills_gained": [s["name"] for s in sim_b.get("after", {}).get("hypothetical_skills_gained", [])],
            "satisfied_requirements": sim_b.get("after", {}).get("newly_satisfied_requirements", []),
        },
        "comparison_delta": {
            "readiness_delta": (sim_b.get("after", {}).get("projected_readiness_score", 0) - 
                               sim_a.get("after", {}).get("projected_readiness_score", 0)),
            "match_delta": (sim_b.get("after", {}).get("projected_target_role_match", 0) - 
                           sim_a.get("after", {}).get("projected_target_role_match", 0)),
            "hours_delta": (sim_b.get("after", {}).get("estimated_learning_hours", 0) - 
                           sim_a.get("after", {}).get("estimated_learning_hours", 0)),
            "weeks_delta": (sim_b.get("after", {}).get("estimated_weeks_to_complete", 0) - 
                           sim_a.get("after", {}).get("estimated_weeks_to_complete", 0)),
        },
        "guidance": (
            f"Scenario B yields a {sim_b.get('after', {}).get('projected_readiness_score', 0)}% readiness score "
            f"vs {sim_a.get('after', {}).get('projected_readiness_score', 0)}% in Scenario A. "
            "Choose the scenario that best balances your target role priorities with your available weekly bandwidth."
        )
    }
