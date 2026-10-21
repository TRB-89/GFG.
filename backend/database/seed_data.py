import uuid
from datetime import date, datetime, timedelta, timezone
from backend.app.database.database import SessionLocal, init_db
from backend.app.models.user import Profile
from backend.app.models.candidate import (
    CandidateProfile,
    CareerBreak,
    Skill,
    CandidateSkill,
    Interest,
    CandidateInterest,
    CandidateProject,
    Certificate,
    LearningProgress,
)
from backend.app.models.company import Company
from backend.app.models.job import Job, JobSkill
from backend.app.models.application import Application
from backend.app.models.community import (
    MentorProfile,
    ComebackCircle,
    CircleMembership,
    CircleDiscussionPost,
)
from backend.app.utils.security import hash_password

DEFAULT_PASSWORD_HASH = hash_password("Password@123")

def seed_community_data(db):
    """Seed Module 8 Mentors and Comeback Circles if not already present."""
    if db.query(MentorProfile).first():
        return

    print("Seeding Module 8 Mentorship and Comeback Circles...")
    
    mentors_to_seed = [
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Dr. Meera Iyer",
            title="Lead Data Scientist & Returnship Advisor",
            company="Microsoft / Ex-ThoughtWorks",
            field="data_analytics",
            years_of_experience=12,
            bio="Specializes in helping women relaunch careers in data analytics, SQL warehousing, and applied machine learning after maternity and extended career breaks.",
            expertise=["Data Analytics", "SQL", "Python", "Power BI", "Career Break Narrative", "Technical Interview Prep"],
            languages=["English", "Hindi", "Tamil"],
            availability="Saturdays (10:00 AM - 2:00 PM) & Tuesday Evenings",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "Portfolio Critique", "Resume Deep Dive"],
            is_demo=True,
            rating=4.9,
            review_count=28
        ),
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Pooja Ramanathan",
            title="Engineering Director & Cloud Architect",
            company="Amazon Web Services",
            field="software_it",
            years_of_experience=14,
            bio="Transitioned back into tech after a 3-year sabbatical. Passionate about cloud architectures, distributed backend systems, and salary negotiation for mid-career women.",
            expertise=["Cloud Architecture", "System Design", "Backend Engineering", "Salary Negotiation", "Career Break Transition"],
            languages=["English", "Kannada", "Hindi"],
            availability="Sundays (11:00 AM - 3:00 PM)",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "System Design Mock", "Salary Strategy"],
            is_demo=True,
            rating=4.95,
            review_count=34
        ),
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Ananya Sen",
            title="VP of Risk Analytics & Financial Modeling",
            company="HDFC Bank / Ex-Barclays",
            field="banking_finance",
            years_of_experience=11,
            bio="Guides professionals into corporate finance, quantitative risk management, and regulatory compliance following career pauses.",
            expertise=["Financial Modeling", "Risk Analytics", "Regulatory Compliance", "Interview Prep"],
            languages=["English", "Bengali", "Hindi"],
            availability="Thursday Evenings & Saturday Mornings",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "Async Resume Review"],
            is_demo=True,
            rating=4.85,
            review_count=19
        ),
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Sneha Kulkarni",
            title="Growth Marketing Director & Brand Strategist",
            company="Nykaa / D2C Advisory",
            field="marketing",
            years_of_experience=9,
            bio="Helping marketing professionals master modern performance analytics, social storytelling, and remote-first agency workflows.",
            expertise=["Growth Marketing", "Content Strategy", "Performance Analytics", "Remote Work Setup"],
            languages=["English", "Marathi", "Hindi"],
            availability="Wednesday & Friday Evenings",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "Portfolio Critique", "Async Feedback"],
            is_demo=True,
            rating=4.88,
            review_count=22
        ),
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Kavita Desai",
            title="Head of People & Inclusive Talent Programs",
            company="TalentBridge Global",
            field="human_resources",
            years_of_experience=13,
            bio="Experienced in returnship program design, behavioral interviewing, and transparent pay equity discussions for returning candidates.",
            expertise=["Behavioral Interviewing", "Salary Negotiation", "Career Break Framing", "HR Strategy"],
            languages=["English", "Gujarati", "Hindi"],
            availability="Tuesday & Thursday Mornings",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "Mock Behavioral Interview"],
            is_demo=True,
            rating=4.92,
            review_count=31
        ),
        MentorProfile(
            id=str(uuid.uuid4()),
            name="Dr. Radhika Nair",
            title="Dean of Online Learning & EdTech Curriculum Lead",
            company="UpGrad / Ex-IIT Madras",
            field="teaching_education",
            years_of_experience=16,
            bio="Mentors educators and academic professionals shifting into instructional design, online pedagogy, and corporate training.",
            expertise=["Instructional Design", "EdTech Curriculum", "Higher Ed Transition", "Public Speaking"],
            languages=["English", "Malayalam", "Hindi"],
            availability="Weekend Mornings",
            verification_status="verified",
            mentorship_formats=["1:1 Video", "Portfolio Review"],
            is_demo=True,
            rating=4.9,
            review_count=17
        ),
    ]
    for mentor in mentors_to_seed:
        db.add(mentor)
        
    # Comeback Circles
    circle_1 = ComebackCircle(
        id=str(uuid.uuid4()),
        name="Data Analytics Restarters Cohort",
        industry="data_analytics",
        career_objective="Returning to full-time Data Analyst & BI Specialist roles within 3 to 6 months.",
        learning_goals=[
            "Master SQL window functions and aggregations",
            "Build an interactive Power BI sales & churn dashboard",
            "Complete 2 peer resume and portfolio reviews"
        ],
        language="English & Hindi",
        max_members=15,
        current_member_count=8,
        milestones=[
            {"id": 1, "title": "SQL Portfolio Database Schema Finalized", "completed": True},
            {"id": 2, "title": "Power BI Executive Dashboard Published", "completed": False},
            {"id": 3, "title": "Peer Mock Technical Interview Round", "completed": False}
        ],
        scheduled_sessions=[
            {"title": "Weekly Cohort Standup & Progress Sync", "time": "Every Saturday 10:30 AM IST"},
            {"title": "Live SQL Query Clinic & Code Review", "time": "Alternate Wednesdays 7:00 PM IST"}
        ],
        portfolio_activities=[
            {"title": "Kaggle Dataset Exploration Exchange", "description": "Pairs review each other's exploratory data analysis scripts and notebook documentation."}
        ],
        is_demo=True
    )
    
    circle_2 = ComebackCircle(
        id=str(uuid.uuid4()),
        name="Women in Tech Moms & Returners",
        industry="software_it",
        career_objective="Refreshing full-stack and cloud competencies to secure software engineering returnships.",
        learning_goals=[
            "Refresh Git workflow and modern CI/CD pipelines",
            "Deploy a full-stack React + FastAPI portfolio project",
            "Practice system design fundamentals"
        ],
        language="English",
        max_members=15,
        current_member_count=11,
        milestones=[
            {"id": 1, "title": "GitHub Profile Readme Overhaul", "completed": True},
            {"id": 2, "title": "API Microservice Deployed to Cloud", "completed": True},
            {"id": 3, "title": "Data Structures & Algorithms 30-Day Sprint", "completed": False}
        ],
        scheduled_sessions=[
            {"title": "Tech Moms Coding Hour", "time": "Sundays 4:00 PM IST"},
            {"title": "System Design Whiteboard Jam", "time": "Tuesdays 8:00 PM IST"}
        ],
        portfolio_activities=[
            {"title": "Code Review Buddies", "description": "Review and critique pull requests on fellow cohort members' GitHub repositories."}
        ],
        is_demo=True
    )
    
    circle_3 = ComebackCircle(
        id=str(uuid.uuid4()),
        name="Bilingual Career Relaunchers (Hindi & English)",
        industry="administration",
        career_objective="Re-entering project management, business administration, and client operations.",
        learning_goals=[
            "Agile Scrum and Jira sprint management practice",
            "Executive business communication and presentation clinic",
            "Stakeholder budget tracking models in Excel"
        ],
        language="Hindi & English",
        max_members=15,
        current_member_count=6,
        milestones=[
            {"id": 1, "title": "Jira Sprint Board Simulation", "completed": True},
            {"id": 2, "title": "Executive Summary Deck Presentation", "completed": False}
        ],
        scheduled_sessions=[
            {"title": "Bi-weekly PM Case Study Discussion", "time": "Thursdays 6:30 PM IST"}
        ],
        portfolio_activities=[
            {"title": "Project Scope Document Review", "description": "Drafting and peer-auditing project charter templates."}
        ],
        is_demo=True
    )
    
    db.add(circle_1)
    db.add(circle_2)
    db.add(circle_3)
    db.flush()
    
    # Add initial discussion posts to Circle 1
    post_1 = CircleDiscussionPost(
        id=str(uuid.uuid4()),
        circle_id=circle_1.id,
        author_id="demo-cand-1",
        author_name="Ritu Verma",
        author_role="Candidate Peer",
        title="Tips for practicing window functions in PostgreSQL?",
        content="Hey cohort! I am currently working on Milestone 1 (SQL Window Functions). Did anyone find a clean dataset to practice ROW_NUMBER() and DENSE_RANK() partitioning? Happy to pair up this Friday!",
        category="Learning Goal",
        likes_count=4
    )
    post_2 = CircleDiscussionPost(
        id=str(uuid.uuid4()),
        circle_id=circle_1.id,
        author_id="demo-cand-2",
        author_name="Ananya Sen",
        author_role="Candidate Peer",
        title="First returnship technical interview scheduled!",
        content="Wanted to share a win with everyone — after 3 years out of tech, I just heard back from Nova Solutions for a returnship screening! The AI interview practice module on explaining career breaks helped calm my nerves so much.",
        category="Wins & Encouragement",
        likes_count=9
    )
    db.add(post_1)
    db.add(post_2)
    db.commit()
    print("Module 8 Mentors and Comeback Circles seeded successfully.")

def seed_database():
    init_db()
    db = SessionLocal()

    # Ensure admin user exists
    admin_prof = db.query(Profile).filter(Profile.email == "admin@gfg.org").first()
    if not admin_prof:
        admin_prof = Profile(
            id=str(uuid.uuid4()),
            full_name="GFG Platform Administrator",
            email="admin@gfg.org",
            password_hash=DEFAULT_PASSWORD_HASH,
            phone="+91 99999 00000",
            location="Bengaluru, India",
            role="admin",
            approval_status="active",
            bio="Platform administrator and governance reviewer."
        )
        db.add(admin_prof)
        db.commit()

    # Always ensure Module 8 community data is populated
    seed_community_data(db)

    # Always ensure Phase 8 LMS courses & assessments are populated
    from backend.database.seed_learning import seed_learning_hub_data
    seed_learning_hub_data(db)

    # Check if already seeded for core data
    existing_priya = db.query(Profile).filter(Profile.email == "priya.sharma@example.com").first()
    if existing_priya:
        print("Database already seeded with demo data.")
        db.close()
        return

    print("Seeding database with GFG Module 2 demo data...")

    # 1. SEED SKILLS (25+ skills)
    skills_data = [
        ("Python", "Programming"),
        ("Java", "Programming"),
        ("SQL", "Database"),
        ("React", "Frontend"),
        ("Power BI", "Data Analytics"),
        ("Machine Learning", "AI / Data"),
        ("UI/UX", "Design"),
        ("AWS", "Cloud"),
        ("Communication", "Soft Skills"),
        ("Marketing", "Marketing"),
        ("Spring Boot", "Backend"),
        ("Tableau", "Data Analytics"),
        ("Docker", "DevOps"),
        ("Kubernetes", "DevOps"),
        ("JavaScript", "Frontend"),
        ("TypeScript", "Frontend"),
        ("Product Management", "Management"),
        ("Agile / Scrum", "Management"),
        ("Data Visualization", "Data Analytics"),
        ("Pandas", "Data Analytics"),
        ("PostgreSQL", "Database"),
        ("Git & GitHub", "Tools"),
        ("Figma", "Design"),
        ("Cybersecurity Fundamentals", "Security"),
        ("Financial Analysis", "Finance"),
    ]
    skill_objs = {}
    for name, cat in skills_data:
        s = Skill(id=str(uuid.uuid4()), name=name, category=cat)
        db.add(s)
        skill_objs[name] = s
    db.flush()

    # 2. SEED INTERESTS (15+ interests)
    interests_data = [
        ("AI / ML", "Technology"),
        ("Data Analytics", "Analytics"),
        ("Cloud", "Infrastructure"),
        ("Cybersecurity", "Security"),
        ("Web Development", "Engineering"),
        ("UI/UX", "Design"),
        ("Business Analysis", "Business"),
        ("HR", "People"),
        ("Finance", "Finance"),
        ("Marketing", "Growth"),
        ("Project Management", "Operations"),
        ("Teaching", "Education"),
        ("FinTech", "Domain"),
        ("Healthcare Tech", "Domain"),
        ("EdTech", "Domain"),
    ]
    interest_objs = {}
    for name, cat in interests_data:
        i = Interest(id=str(uuid.uuid4()), name=name, category=cat)
        db.add(i)
        interest_objs[name] = i
    db.flush()

    # 3. SEED EMPLOYERS & COMPANIES (Section 27: Nova Technologies + 9 others)
    employers_meta = [
        {
            "name": "Nova Technologies HR",
            "email": "hr@novatech.com",
            "company_name": "Nova Technologies",
            "industry": "Enterprise Software & Cloud Platforms",
            "website": "https://novatech.example.com",
            "location": "Bengaluru, India (Remote-First)",
            "desc": "Leading cloud solutions provider committed to diversity and return-to-work equity.",
            "size": "500-1000 employees"
        },
        {
            "name": "Tata Digital Returners",
            "email": "careers@tatadigital.com",
            "company_name": "Tata Digital",
            "industry": "Digital Ecosystem & Consumer Tech",
            "website": "https://tatadigital.example.com",
            "location": "Mumbai, India",
            "desc": "Empowering women professionals through the Tata Re-Ignite career program.",
            "size": "5000+ employees"
        },
        {
            "name": "Infosys Springboard Talent",
            "email": "diversity@infosys.com",
            "company_name": "Infosys Springboard",
            "industry": "IT & Consulting",
            "website": "https://infosys.example.com",
            "location": "Bengaluru, India",
            "desc": "Global technology leader running structured returnship tracks for experienced tech leaders.",
            "size": "10000+ employees"
        },
        {
            "name": "Flipkart Back2Work Lead",
            "email": "reboot@flipkart.com",
            "company_name": "Flipkart Commerce",
            "industry": "E-Commerce & Supply Chain Tech",
            "website": "https://flipkart.example.com",
            "location": "Bengaluru, India",
            "desc": "Flipkart Back2Work initiative facilitates smooth transitions back into product and tech.",
            "size": "5000+ employees"
        },
        {
            "name": "Accenture Re-Start Hub",
            "email": "restart@accenture.com",
            "company_name": "Accenture Re-Start",
            "industry": "Strategy & Consulting",
            "website": "https://accenture.example.com",
            "location": "Gurugram, India",
            "desc": "Providing flexible on-ramps, mentorship, and high-impact project assignments.",
            "size": "10000+ employees"
        },
        {
            "name": "Wipro V-Inc Team",
            "email": "careers@wipro.com",
            "company_name": "Wipro Enterprise",
            "industry": "IT & Cloud Services",
            "website": "https://wipro.example.com",
            "location": "Hyderabad, India",
            "desc": "Dedicated returnee cohorts in Cloud, Data, and Quality Engineering.",
            "size": "5000+ employees"
        },
        {
            "name": "Microsoft Leap Recruiter",
            "email": "leap@microsoft.com",
            "company_name": "Microsoft India",
            "industry": "Software & AI Solutions",
            "website": "https://microsoft.example.com",
            "location": "Hyderabad, India",
            "desc": "The Microsoft Leap program recruits unconventional talent into engineering roles.",
            "size": "10000+ employees"
        },
        {
            "name": "CrediAI Labs Talent",
            "email": "careers@crediai.com",
            "company_name": "CrediAI Labs",
            "industry": "Fintech & Algorithmic Risk",
            "website": "https://crediai.example.com",
            "location": "Chennai, India",
            "desc": "Next-generation credit scoring and risk analytics platform.",
            "size": "100-250 employees"
        },
        {
            "name": "Zomato Reboot Careers",
            "email": "people@zomato.com",
            "company_name": "Zomato Media",
            "industry": "Consumer Tech & Quick Commerce",
            "website": "https://zomato.example.com",
            "location": "Gurugram, India",
            "desc": "Progressive remote-friendly returnships across product analytics and operations.",
            "size": "1000-5000 employees"
        },
        {
            "name": "Razorpay Diversity Team",
            "email": "diversity@razorpay.com",
            "company_name": "Razorpay Payments",
            "industry": "Fintech & Financial Infrastructure",
            "website": "https://razorpay.example.com",
            "location": "Bengaluru, India",
            "desc": "Powering seamless returnships for engineers, analysts, and project leads.",
            "size": "1000-5000 employees"
        },
    ]

    company_objs = {}
    employer_profiles = []
    for emp in employers_meta:
        prof = Profile(
            id=str(uuid.uuid4()),
            full_name=emp["name"],
            email=emp["email"],
            password_hash=DEFAULT_PASSWORD_HASH,
            phone="+91 98765 00000",
            location=emp["location"],
            role="employer",
            bio=f"Hiring manager at {emp['company_name']}."
        )
        db.add(prof)
        db.flush()
        employer_profiles.append(prof)

        comp = Company(
            id=str(uuid.uuid4()),
            owner_user_id=prof.id,
            name=emp["company_name"],
            industry=emp["industry"],
            website=emp["website"],
            location=emp["location"],
            description=emp["desc"],
            company_size=emp["size"],
            verified=True
        )
        db.add(comp)
        db.flush()
        company_objs[emp["company_name"]] = comp

    nova_comp = company_objs["Nova Technologies"]

    # 4. SEED 20 RETURNSHIP / JOB OPPORTUNITIES
    # Section 27: Data Analyst Returnship at Nova Technologies is the PRIMARY DEMO JOB
    jobs_meta = [
        {
            "comp": "Nova Technologies",
            "title": "Data Analyst Returnship",
            "desc": "Join Nova Technologies as an aspiring Data Analyst in our structured 4-month returnship. Work with SQL, Power BI, and Python datasets with dedicated mentorship, flexible 4-hour daily schedules, and a clear permanent conversion trajectory.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Remote / Bengaluru",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 35000.0,
            "sal_max": 40000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 4,
            "perm": True,
            "skills": [("SQL", True), ("Power BI", True), ("Python", False), ("Data Visualization", False)]
        },
        {
            "comp": "Nova Technologies",
            "title": "Software Engineer Returnship",
            "desc": "Hands-on engineering returnship focused on backend microservices, Java/Spring Boot and cloud-native architecture.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Remote / Bengaluru",
            "min_exp": 3.0,
            "min_break": 6,
            "max_break": 48,
            "sal_min": 45000.0,
            "sal_max": 55000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 5,
            "perm": True,
            "skills": [("Java", True), ("Spring Boot", True), ("SQL", True), ("AWS", False)]
        },
        {
            "comp": "Tata Digital",
            "title": "Business Analyst Returnship",
            "desc": "Translate business requirements into analytical insights and feature specifications for our multi-brand digital apps.",
            "emp_type": "returnship",
            "work_mode": "hybrid",
            "loc": "Mumbai, India",
            "min_exp": 2.5,
            "min_break": 8,
            "max_break": 40,
            "sal_min": 40000.0,
            "sal_max": 50000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 6,
            "perm": True,
            "skills": [("SQL", True), ("Product Management", False), ("Agile / Scrum", True)]
        },
        {
            "comp": "Infosys Springboard",
            "title": "Cloud Associate Returnship",
            "desc": "Upgrade and apply your infrastructure knowledge in AWS and cloud migration projects with dedicated learning paths.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Bengaluru, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 38000.0,
            "sal_max": 48000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 4,
            "perm": True,
            "skills": [("AWS", True), ("Docker", False), ("Linux", False)]
        },
        {
            "comp": "Flipkart Commerce",
            "title": "UX Designer Returnship",
            "desc": "Design empathetic, accessible customer journeys across web and mobile. Mentorship by senior design directors.",
            "emp_type": "returnship",
            "work_mode": "hybrid",
            "loc": "Bengaluru, India",
            "min_exp": 3.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 45000.0,
            "sal_max": 60000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 5,
            "perm": True,
            "skills": [("UI/UX", True), ("Figma", True), ("Communication", False)]
        },
        {
            "comp": "Accenture Re-Start",
            "title": "QA Automation Engineer Returnship",
            "desc": "Automated testing, test suite design, and regression execution in agile project teams.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Gurugram, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 48,
            "sal_min": 35000.0,
            "sal_max": 45000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("Java", True), ("SQL", False), ("Git & GitHub", False)]
        },
        {
            "comp": "CrediAI Labs",
            "title": "Product Analyst Returnship",
            "desc": "Analyze credit funnel telemetry, risk score distributions, and feature engagement metrics.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Chennai, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 30,
            "sal_min": 42000.0,
            "sal_max": 52000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 4,
            "perm": True,
            "skills": [("SQL", True), ("Python", True), ("Pandas", False)]
        },
        {
            "comp": "Wipro Enterprise",
            "title": "Full-Stack Web Developer",
            "desc": "Frontend React and backend Node/Python development for enterprise client portals.",
            "emp_type": "part_time",
            "work_mode": "remote",
            "loc": "Hyderabad, India",
            "min_exp": 3.0,
            "min_break": 4,
            "max_break": 60,
            "sal_min": 50000.0,
            "sal_max": 65000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 5,
            "perm": True,
            "skills": [("React", True), ("TypeScript", True), ("SQL", False)]
        },
        {
            "comp": "Zomato Media",
            "title": "Digital Marketing Specialist Returnship",
            "desc": "Plan content, run digital acquisition campaigns, and analyze user retention curves.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Delhi NCR / Remote",
            "min_exp": 1.5,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 32000.0,
            "sal_max": 42000.0,
            "sal_curr": "INR",
            "dur": 3,
            "hours": 4,
            "perm": True,
            "skills": [("Marketing", True), ("Communication", True)]
        },
        {
            "comp": "Razorpay Payments",
            "title": "HR Associate (People Operations)",
            "desc": "Support employee onboarding, diversity program coordination, and talent engagement.",
            "emp_type": "part_time",
            "work_mode": "hybrid",
            "loc": "Bengaluru, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 35000.0,
            "sal_max": 45000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("Communication", True)]
        },
        {
            "comp": "Tata Digital",
            "title": "Project Coordinator Returnship",
            "desc": "Coordinate sprint delivery schedules, cross-functional dependencies, and stakeholder status updates.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Mumbai, India",
            "min_exp": 2.5,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 38000.0,
            "sal_max": 48000.0,
            "sal_curr": "INR",
            "dur": 5,
            "hours": 4,
            "perm": True,
            "skills": [("Agile / Scrum", True), ("Communication", True)]
        },
        {
            "comp": "Microsoft India",
            "title": "Machine Learning Associate Returnship",
            "desc": "Train, evaluate, and deploy classification and NLP models with Azure ML tools.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Hyderabad, India",
            "min_exp": 3.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 60000.0,
            "sal_max": 75000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 5,
            "perm": True,
            "skills": [("Python", True), ("Machine Learning", True), ("SQL", False)]
        },
        {
            "comp": "Infosys Springboard",
            "title": "Database Administrator (PostgreSQL)",
            "desc": "Query tuning, schema design, backup strategies, and migration pipelines.",
            "emp_type": "contract",
            "work_mode": "remote",
            "loc": "Bengaluru, India",
            "min_exp": 3.5,
            "min_break": 6,
            "max_break": 48,
            "sal_min": 45000.0,
            "sal_max": 55000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("SQL", True), ("PostgreSQL", True)]
        },
        {
            "comp": "Flipkart Commerce",
            "title": "Supply Chain Data Analyst",
            "desc": "Forecast inventory replenishment models and shipping turnaround times.",
            "emp_type": "full_time",
            "work_mode": "hybrid",
            "loc": "Bengaluru, India",
            "min_exp": 2.5,
            "min_break": 6,
            "max_break": 24,
            "sal_min": 55000.0,
            "sal_max": 70000.0,
            "sal_curr": "INR",
            "dur": 12,
            "hours": 8,
            "perm": True,
            "skills": [("SQL", True), ("Power BI", True), ("Pandas", False)]
        },
        {
            "comp": "CrediAI Labs",
            "title": "Financial Risk Modeler Returnship",
            "desc": "Design credit risk benchmarks and historical default distribution analysis.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Chennai, India",
            "min_exp": 3.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 48000.0,
            "sal_max": 60000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 4,
            "perm": True,
            "skills": [("Financial Analysis", True), ("SQL", True), ("Python", False)]
        },
        {
            "comp": "Zomato Media",
            "title": "Customer Experience Operations Lead",
            "desc": "Evaluate user support SLA metrics and train chat resolution teams.",
            "emp_type": "part_time",
            "work_mode": "remote",
            "loc": "Gurugram, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 30000.0,
            "sal_max": 40000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("Communication", True)]
        },
        {
            "comp": "Wipro Enterprise",
            "title": "Frontend React Engineer Returnship",
            "desc": "Re-enter frontend development using React 19, TypeScript, and modern component systems.",
            "emp_type": "returnship",
            "work_mode": "remote",
            "loc": "Hyderabad, India",
            "min_exp": 2.5,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 42000.0,
            "sal_max": 52000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("React", True), ("JavaScript", True), ("TypeScript", False)]
        },
        {
            "comp": "Accenture Re-Start",
            "title": "Cybersecurity Compliance Associate",
            "desc": "Review ISO 27001 audit controls, SOC2 evidence documents, and access controls.",
            "emp_type": "contract",
            "work_mode": "remote",
            "loc": "Gurugram, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 40000.0,
            "sal_max": 50000.0,
            "sal_curr": "INR",
            "dur": 6,
            "hours": 4,
            "perm": True,
            "skills": [("Cybersecurity Fundamentals", True), ("Communication", False)]
        },
        {
            "comp": "Razorpay Payments",
            "title": "Merchant Integration Specialist",
            "desc": "Guide merchants through webhook configuration and payment gateway integration.",
            "emp_type": "full_time",
            "work_mode": "hybrid",
            "loc": "Bengaluru, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 24,
            "sal_min": 45000.0,
            "sal_max": 58000.0,
            "sal_curr": "INR",
            "dur": 12,
            "hours": 7,
            "perm": True,
            "skills": [("Communication", True), ("JavaScript", False)]
        },
        {
            "comp": "Nova Technologies",
            "title": "DevOps Junior Associate",
            "desc": "Assist infrastructure automation, CI/CD pipelines in GitHub Actions and Docker containerization.",
            "emp_type": "internship",
            "opp_type": "internship",
            "sector": "software_it",
            "work_mode": "remote",
            "loc": "Bengaluru, India",
            "min_exp": 1.0,
            "min_break": 6,
            "max_break": 24,
            "sal_min": 30000.0,
            "sal_max": 38000.0,
            "sal_curr": "INR",
            "dur": 3,
            "hours": 4,
            "perm": True,
            "skills": [("Docker", True), ("Git & GitHub", True), ("AWS", False)]
        },
        {
            "comp": "Infosys Springboard",
            "title": "EdTech Curriculum & Instruction Lead",
            "desc": "Design learning progressions, interactive video modules, and self-paced assessments for women in technology tracks.",
            "emp_type": "full_time",
            "opp_type": "remote",
            "sector": "teaching_education",
            "work_mode": "remote",
            "loc": "Remote / Bengaluru",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 45000.0,
            "sal_max": 55000.0,
            "sal_curr": "INR",
            "dur": 12,
            "hours": 6,
            "perm": True,
            "skills": [("Communication", True), ("Python", False)]
        },
        {
            "comp": "Tata Digital",
            "title": "Health Informatics & Patient Analytics Returnship",
            "desc": "Support health data harmonization, clinical metric extraction, and telehealth analytics dashboards.",
            "emp_type": "returnship",
            "opp_type": "returnship",
            "sector": "healthcare",
            "work_mode": "hybrid",
            "loc": "Mumbai, India",
            "min_exp": 2.0,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 40000.0,
            "sal_max": 52000.0,
            "sal_curr": "INR",
            "dur": 4,
            "hours": 4,
            "perm": True,
            "skills": [("SQL", True), ("Data Visualization", True)]
        },
        {
            "comp": "Accenture Re-Start",
            "title": "Public Policy & Governance Research Fellow",
            "desc": "Analyze regulatory guidelines, public policy metrics, and digital governance initiatives with state and central agencies.",
            "emp_type": "full_time",
            "opp_type": "full_time",
            "sector": "gov_exams",
            "work_mode": "hybrid",
            "loc": "New Delhi / Remote",
            "min_exp": 2.5,
            "min_break": 6,
            "max_break": 48,
            "sal_min": 48000.0,
            "sal_max": 62000.0,
            "sal_curr": "INR",
            "dur": 12,
            "hours": 7,
            "perm": True,
            "skills": [("Communication", True), ("Financial Analysis", False)]
        },
        {
            "comp": "CrediAI Labs",
            "title": "Data Engineering Independent Consultant",
            "desc": "Short-term consulting sprint optimizing PostgreSQL query performance, ETL cron schedules, and data validation rules.",
            "emp_type": "contract",
            "opp_type": "freelance",
            "sector": "freelance_consulting",
            "work_mode": "remote",
            "loc": "Remote / Chennai",
            "min_exp": 3.5,
            "min_break": 4,
            "max_break": 36,
            "sal_min": 60000.0,
            "sal_max": 80000.0,
            "sal_curr": "INR",
            "dur": 3,
            "hours": 4,
            "perm": False,
            "skills": [("SQL", True), ("PostgreSQL", True), ("Python", True)]
        },
        {
            "comp": "Nova Technologies",
            "title": "Women in Tech Startup Bootcamp Fellow",
            "desc": "Join our venture builder incubator track. Develop prototype MVPs, learn venture economics, and validate product-market fit.",
            "emp_type": "returnship",
            "opp_type": "short_term_project",
            "sector": "entrepreneurship",
            "work_mode": "remote",
            "loc": "Remote / Bengaluru",
            "min_exp": 1.5,
            "min_break": 6,
            "max_break": 36,
            "sal_min": 35000.0,
            "sal_max": 45000.0,
            "sal_curr": "INR",
            "dur": 3,
            "hours": 4,
            "perm": True,
            "skills": [("Product Management", True), ("Communication", True)]
        },
    ]

    job_objs = []
    demo_data_analyst_job = None

    for jm in jobs_meta:
        comp = company_objs[jm["comp"]]
        sec = jm.get("sector")
        if not sec:
            t = jm["title"].lower()
            if "data" in t or "analyst" in t or "machine learning" in t:
                sec = "data_analytics"
            elif "marketing" in t:
                sec = "marketing"
            elif "hr" in t or "people" in t:
                sec = "human_resources"
            elif "project" in t or "coordinator" in t:
                sec = "administration"
            elif "customer" in t:
                sec = "retail_support"
            elif "risk" in t or "merchant" in t:
                sec = "banking_finance"
            else:
                sec = "software_it"

        opp_t = jm.get("opp_type", jm["emp_type"])
        job = Job(
            id=str(uuid.uuid4()),
            company_id=comp.id,
            title=jm["title"],
            description=jm["desc"],
            employment_type=jm["emp_type"],
            opportunity_type=opp_t,
            sector=sec,
            work_mode=jm["work_mode"],
            location=jm["loc"],
            minimum_experience=jm["min_exp"],
            minimum_break_months=jm["min_break"],
            maximum_break_months=jm["max_break"],
            salary_min=jm["sal_min"],
            salary_max=jm["sal_max"],
            salary_currency=jm["sal_curr"],
            duration_months=jm["dur"],
            hours_per_day=jm["hours"],
            permanent_conversion_possible=jm["perm"],
            application_deadline=date.today() + timedelta(days=45),
            status="active",
            employer_verification_status="verified",
            is_verified_employer=True,
            data_source="verified_partner",
            learning_objectives="Structured returnship curriculum with 1:1 senior mentorship, weekly sprint check-ins, and hands-on production codebases.",
            mentorship_available=True,
            stipend_or_salary_type="paid",
            stipend_amount_description=f"₹{int(jm['sal_min']):,} - ₹{int(jm['sal_max']):,} / month stipend",
            eligibility_criteria=f"Career break >= {jm['min_break']} months, welcoming all caregiving or maternal pause backgrounds.",
            conversion_rate_percentage=78 if jm["perm"] else 40,
        )
        db.add(job)
        db.flush()
        job_objs.append(job)

        if jm["title"] == "Data Analyst Returnship" and jm["comp"] == "Nova Technologies":
            demo_data_analyst_job = job

        for sk_name, req in jm["skills"]:
            if sk_name in skill_objs:
                js = JobSkill(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    skill_id=skill_objs[sk_name].id,
                    importance="required" if req else "preferred",
                    required=req
                )
                db.add(js)

    db.flush()

    # 5. SEED CANDIDATE PROFILES (Section 26: Priya Sharma + 4 others)
    # PRIYA SHARMA - DEMO CANDIDATE
    priya_prof = Profile(
        id=str(uuid.uuid4()),
        full_name="Priya Sharma",
        email="priya.sharma@example.com",
        password_hash=DEFAULT_PASSWORD_HASH,
        phone="+91 98123 45678",
        location="Bengaluru, India",
        role="candidate",
        bio="Former Software Engineer with 4.5 years of experience in backend systems and data analytics, returning to the workforce following a 14-month maternity sabbatical."
    )
    db.add(priya_prof)
    db.flush()

    priya_cand = CandidateProfile(
        id=str(uuid.uuid4()),
        user_id=priya_prof.id,
        headline="Experienced Software Engineer & Data Enthusiast | Returning Professional",
        highest_qualification="B.Tech in Computer Science",
        years_experience=4.5,
        previous_job_title="Software Engineer",
        previous_company="Infosys Limited",
        preferred_work_mode="remote",
        preferred_location="Bengaluru (Open to Remote)",
        available_hours_per_day=4,
        current_status="ready_to_return",
        resume_url="/storage/resumes/priya_sharma_resume.pdf",
        linkedin_url="https://linkedin.com/in/priyasharma-demo",
        github_url="https://github.com/priyasharma-demo",
        portfolio_url="https://priyasharma.me",
        return_readiness_status="active",
        career_break_visibility="employers"
    )
    db.add(priya_cand)
    db.flush()

    # Priya's Career Break (Maternity, 14 months)
    break_start = date.today() - timedelta(days=14 * 30)
    priya_break = CareerBreak(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        break_type="maternity",
        start_date=break_start,
        end_date=date.today(),
        currently_on_break=False,
        description="Maternity leave and full-time early child care. During this period, refreshed Python and SQL skills via specialized data analytics coursework.",
        expected_return_date=date.today()
    )
    db.add(priya_break)

    # Priya's Skills: Java, SQL, Spring Boot, Python, Power BI
    priya_skills = [
        ("Java", "advanced", 4.0),
        ("SQL", "advanced", 4.5),
        ("Spring Boot", "intermediate", 3.0),
        ("Python", "intermediate", 2.0),
        ("Power BI", "intermediate", 1.5),
    ]
    for s_name, prof_level, yrs in priya_skills:
        if s_name in skill_objs:
            cs = CandidateSkill(
                id=str(uuid.uuid4()),
                candidate_id=priya_cand.id,
                skill_id=skill_objs[s_name].id,
                proficiency=prof_level,
                years_experience=yrs,
                last_used_date=date.today() - timedelta(days=60)
            )
            db.add(cs)

    # Priya's Interests: Data Analytics, AI
    priya_interests = ["Data Analytics", "AI / ML", "FinTech"]
    for i_name in priya_interests:
        if i_name in interest_objs:
            ci = CandidateInterest(
                id=str(uuid.uuid4()),
                candidate_id=priya_cand.id,
                interest_id=interest_objs[i_name].id,
                priority=1
            )
            db.add(ci)

    # Priya's Projects
    proj = CandidateProject(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        title="Credit Risk Distribution Dashboard",
        description="Built interactive Power BI and SQL dashboards analyzing default probabilities across 50,000 anonymized loan portfolios.",
        technologies="SQL, Power BI, Python, Pandas",
        project_url="https://github.com/priyasharma-demo/credit-risk-analytics",
        github_url="https://github.com/priyasharma-demo/credit-risk-analytics",
        start_date=date.today() - timedelta(days=90),
        end_date=date.today() - timedelta(days=30)
    )
    db.add(proj)

    # Priya's Certificate
    cert = Certificate(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        certificate_name="Google Advanced Data Analytics Professional",
        issuer="Coursera / Google",
        issue_date=date.today() - timedelta(days=45),
        credential_url="https://coursera.org/verify/GOOGLE-DATA-9988",
        certificate_file_url="/storage/certificates/priya_google_cert.pdf"
    )
    db.add(cert)

    # Priya's Learning Progress
    learn = LearningProgress(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        course_name="Modern Enterprise Cloud & AWS Data Architecture",
        provider="AWS Training",
        category="Cloud",
        progress_percentage=65,
        status="in_progress",
        started_at=datetime.now(timezone.utc) - timedelta(days=40)
    )
    db.add(learn)

    # 4 OTHER CANDIDATES
    other_candidates_meta = [
        {
            "name": "Ananya Desai",
            "email": "ananya.desai@example.com",
            "headline": "Business & Product Analyst | Returning Professional",
            "exp": 3.0,
            "prev_title": "Product Analyst",
            "prev_comp": "Swiggy",
            "break_type": "childcare",
            "break_months": 18,
            "skills": [("SQL", "advanced", 3.0), ("Product Management", "intermediate", 2.0), ("Communication", "expert", 3.0)],
            "interests": ["Business Analysis", "FinTech"]
        },
        {
            "name": "Neha Reddy",
            "email": "neha.reddy@example.com",
            "headline": "Senior UX/UI Designer | Returnship Applicant",
            "exp": 5.0,
            "prev_title": "UI/UX Designer",
            "prev_comp": "Freshworks",
            "break_type": "health",
            "break_months": 12,
            "skills": [("UI/UX", "expert", 5.0), ("Figma", "expert", 4.0), ("Communication", "advanced", 5.0)],
            "interests": ["UI/UX", "Web Development"]
        },
        {
            "name": "Ritu Patel",
            "email": "ritu.patel@example.com",
            "headline": "Cloud Solutions & DevOps Specialist",
            "exp": 2.5,
            "prev_title": "Junior DevOps Engineer",
            "prev_comp": "TCS",
            "break_type": "relocation",
            "break_months": 9,
            "skills": [("AWS", "intermediate", 2.0), ("Docker", "intermediate", 1.5), ("Git & GitHub", "advanced", 2.5)],
            "interests": ["Cloud", "Cybersecurity"]
        },
        {
            "name": "Kavita Iyer",
            "email": "kavita.iyer@example.com",
            "headline": "Senior QA Automation Engineer",
            "exp": 4.0,
            "prev_title": "QA Automation Engineer",
            "prev_comp": "Capgemini",
            "break_type": "caregiving",
            "break_months": 20,
            "skills": [("Java", "advanced", 4.0), ("SQL", "intermediate", 3.0), ("Git & GitHub", "intermediate", 3.0)],
            "interests": ["Web Development", "AI / ML"]
        },
    ]

    candidate_objs = [priya_cand]
    for cdata in other_candidates_meta:
        cp = Profile(
            id=str(uuid.uuid4()),
            full_name=cdata["name"],
            email=cdata["email"],
            password_hash=DEFAULT_PASSWORD_HASH,
            phone="+91 97000 12345",
            location="Bengaluru, India",
            role="candidate",
            bio=f"Returning professional with {cdata['exp']} years of experience."
        )
        db.add(cp)
        db.flush()

        cand = CandidateProfile(
            id=str(uuid.uuid4()),
            user_id=cp.id,
            headline=cdata["headline"],
            highest_qualification="Bachelor of Engineering",
            years_experience=cdata["exp"],
            previous_job_title=cdata["prev_title"],
            previous_company=cdata["prev_comp"],
            preferred_work_mode="remote",
            preferred_location="Bengaluru",
            available_hours_per_day=4,
            current_status="ready_to_return",
            resume_url=f"/storage/resumes/{cdata['name'].lower().replace(' ', '_')}.pdf",
            return_readiness_status="active"
        )
        db.add(cand)
        db.flush()
        candidate_objs.append(cand)

        cbreak = CareerBreak(
            id=str(uuid.uuid4()),
            candidate_id=cand.id,
            break_type=cdata["break_type"],
            start_date=date.today() - timedelta(days=cdata["break_months"] * 30),
            end_date=date.today(),
            currently_on_break=False,
            expected_return_date=date.today()
        )
        db.add(cbreak)

        for s_name, prof_lvl, yrs in cdata["skills"]:
            if s_name in skill_objs:
                cs = CandidateSkill(
                    id=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    skill_id=skill_objs[s_name].id,
                    proficiency=prof_lvl,
                    years_experience=yrs
                )
                db.add(cs)

        for iname in cdata["interests"]:
            if iname in interest_objs:
                ci = CandidateInterest(
                    id=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    interest_id=interest_objs[iname].id,
                    priority=1
                )
                db.add(ci)

    db.flush()

    # 6. SEED 15 APPLICATIONS ACROSS JOBS & CANDIDATES
    # Note: We do NOT apply Priya to Nova's Data Analyst Returnship yet,
    # so that during the DEMO, Priya clicks Apply live on screen!
    # Priya has 2 other sample applications in her dashboard already:
    app1 = Application(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        job_id=job_objs[2].id, # Business Analyst at Tata Digital
        status="under_review",
        cover_note="Excited to bring my 4.5 years of backend data experience to Tata Digital's ecosystem.",
        resume_url=priya_cand.resume_url,
        applied_at=datetime.now(timezone.utc) - timedelta(days=4)
    )
    db.add(app1)

    app2 = Application(
        id=str(uuid.uuid4()),
        candidate_id=priya_cand.id,
        job_id=job_objs[6].id, # Product Analyst at CrediAI
        status="shortlisted",
        cover_note="Passionate about fintech analytics and risk telemetry modeling.",
        resume_url=priya_cand.resume_url,
        applied_at=datetime.now(timezone.utc) - timedelta(days=7)
    )
    db.add(app2)

    # 13 other applications from other candidates
    other_statuses = ["submitted", "under_review", "shortlisted", "interview", "selected", "rejected"]
    for i in range(13):
        cand_idx = (i % 4) + 1 # Ananya, Neha, Ritu, Kavita
        job_idx = (i + 3) % len(job_objs)
        # Check uniqueness before adding
        cand = candidate_objs[cand_idx]
        target_job = job_objs[job_idx]
        
        app = Application(
            id=str(uuid.uuid4()),
            candidate_id=cand.id,
            job_id=target_job.id,
            status=other_statuses[i % len(other_statuses)],
            cover_note="Eager to restart my professional career journey through this returnship opportunity.",
            resume_url=cand.resume_url,
            applied_at=datetime.now(timezone.utc) - timedelta(days=i + 1)
        )
        db.add(app)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
