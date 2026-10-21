import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.user import Profile
from backend.app.models.learning import (
    Course,
    CourseModule,
    Lesson,
    Assessment,
    AssessmentQuestion,
    PracticalAssignment,
)
from backend.app.utils.security import hash_password


def seed_learning_hub_data(db: Session):
    """
    Seeds Phase 8's three complete, authentic courses into GFG Learning Hub:
    1. Workplace Digital Skills
    2. Excel for Career Returners
    3. Career Comeback Readiness
    Also ensures a verified platform admin user exists for administration.
    """
    # 0. Ensure Platform Administrator account exists
    admin_user = db.query(Profile).filter(Profile.email == "admin@gapforgood.org").first()
    if not admin_user:
        admin_user = Profile(
            id=str(uuid.uuid4()),
            full_name="GFG Platform Administrator",
            email="admin@gapforgood.org",
            password_hash=hash_password("Password@123"),
            phone="+91 99000 11223",
            location="Bengaluru, India",
            role="admin",
            approval_status="active",
            bio="Lead administrator for GFG Career Continuity Platform & Credential Governance Board."
        )
        db.add(admin_user)
        db.flush()

    # Check if courses already seeded
    existing_course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    if existing_course:
        return

    print("Seeding Phase 8 GFG Learning Hub Courses & Real Curriculums...")

    # =========================================================================
    # COURSE 1: WORKPLACE DIGITAL SKILLS
    # =========================================================================
    c1 = Course(
        id=str(uuid.uuid4()),
        slug="workplace-digital-skills",
        title="Workplace Digital Skills for Career Returners",
        subtitle="Master modern hybrid collaboration, asynchronous communication, cloud document architectures, and data security.",
        description=(
            "Designed specifically for professionals re-entering the workforce, this course bridges the digital toolchain "
            "evolution over recent years. You will master asynchronous collaboration tools (Slack, Teams, Notion, Google Workspace), "
            "develop professional digital etiquette, organize cloud directories with granular security permissions, and build confidence "
            "operating in modern distributed work environments."
        ),
        category="Digital Literacy",
        difficulty="Beginner to Intermediate",
        estimated_duration_hours=12,
        thumbnail_url="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
        status="published",
        learning_outcomes=[
            "Confidently navigate modern enterprise asynchronous communication stacks (Slack, Microsoft Teams, Notion).",
            "Structure collaborative cloud workspaces with role-based access control and live document versioning.",
            "Formulate concise, executive-ready written updates that reduce unnecessary meetings.",
            "Apply cyber hygiene best practices including 2FA, password managers, and DPDP-compliant data handling in hybrid offices."
        ],
        prerequisites=["Basic computer literacy and internet connectivity."],
        target_audience="Women returning to corporate, tech, or professional service roles after 1+ years career break.",
        language_primary="en",
        language_available=["en", "ta"],
        passing_score_percentage=70,
        attempt_limit=3,
        version="v1.0"
    )
    db.add(c1)
    db.flush()

    # Module 1
    m1_1 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c1.id,
        title="Module 1: The Modern Hybrid Workplace Ecosystem",
        description="Understanding how corporate communication evolved from email-heavy silos to collaborative cloud platforms.",
        order_index=1,
        duration_minutes=90
    )
    db.add(m1_1)
    db.flush()

    l1_1_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m1_1.id,
        course_id=c1.id,
        title="Navigating Enterprise Communication: Channels, Threads & Direct Messages",
        slug="navigating-enterprise-communication",
        order_index=1,
        content_type="video_and_text",
        video_url="https://www.youtube.com/watch?v=M7lc1UVf-VE",
        estimated_minutes=25,
        is_mandatory=True,
        content_markdown="""# Navigating Enterprise Communication: Channels, Threads & DMs

Welcome to your first step in refreshing your digital workplace capabilities. If your last role was several years ago, you may remember corporate communication dominated by lengthy CC-heavy email chains. Modern companies have transitioned toward **real-time and asynchronous messaging platforms** like Slack and Microsoft Teams.

### The Three Layers of Modern Messaging

1. **Public & Private Channels**:
   - Organized by project, team, or interest (e.g., `#proj-q3-returnship`, `#eng-backend`, `#announcements`).
   - *Golden Rule*: Conduct discussions in designated channels so knowledge remains searchable by all teammates.

2. **Thread Discipline**:
   - Never respond to a specific question by sending a new top-level message in the channel. Always click **'Reply in thread'**.
   - *Why this matters*: Threads prevent channel clutter and enable parallel discussions without notifications waking the entire team.

3. **Direct Messages (DMs)**:
   - Reserved for 1:1 confidential touchpoints, personal check-ins, or sensitive feedback.
   - Avoid using DMs for project updates—if another teammate needs the context, information gets trapped in private silos.

### Professional Status Etiquette

Setting your digital status is your shield against remote burnout. Use transparent, friendly statuses:
- 🟢 *Active* (Normal working hours)
- 🟡 *Deep Work / Focus Mode (Back at 2:00 PM)*
- ☕ *Caregiver Break (12:30 PM - 1:30 PM)*
- 🔴 *Off for the Day / Async Responses Tomorrow*

Transparent statuses communicate reliability while protecting your family boundaries.""",
        downloadable_resources=[
            {
                "title": "Slack & Teams Shortcut Cheat Sheet (PDF)",
                "url": "/storage/resources/wds_shortcuts_guide.pdf",
                "file_type": "pdf",
                "size_kb": 320,
                "description": "Top keyboard shortcuts for rapid navigation and search."
            }
        ],
        knowledge_check={
            "question": "A colleague asks for your feedback on a design mockup in a project channel. How should you respond?",
            "options": [
                "Post a brand new top-level message in the channel.",
                "Send them an email with CC to the entire department.",
                "Click 'Reply in thread' on their original message so the conversation stays organized.",
                "Ignore it until the next weekly meeting."
            ],
            "correct_index": 2,
            "explanation": "Replying inside the thread keeps the discussion tied to the context and prevents distracting other channel members."
        }
    )
    db.add(l1_1_1)

    l1_1_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m1_1.id,
        course_id=c1.id,
        title="Cloud Workspace Architecture: Google Drive, OneDrive & Notion",
        slug="cloud-workspace-architecture",
        order_index=2,
        content_type="text",
        estimated_minutes=30,
        is_mandatory=True,
        content_markdown="""# Cloud Workspace Architecture & Permission Management

In modern organizations, local files saved on desktop hard drives (`Final_Presentation_v2_FINAL.docx`) are replaced by **living cloud documents**.

### Directory Hierarchies & Shared Drives

- **Personal vs. Shared Drives**:
  - Personal Drive: For personal scratch notes or works-in-progress.
  - Shared Drives (Google Workspace) / SharePoint Document Libraries: Owned by the organization. When an employee transitions or takes leave, the files stay preserved with the team.

### Granular Sharing Permissions

Understanding sharing levels protects proprietary company data:
- **Viewer**: Can read and download, but cannot edit or comment.
- **Commenter**: Ideal for stakeholder review. Allows inline suggestions without modifying master text.
- **Editor**: Can alter text, delete rows, and manage document structure.
- **Owner / Administrator**: Can manage who has access and transfer document stewardship.

### Version History: Your Safety Net

Never fear making mistakes in cloud documents. Both Google Docs and Microsoft 365 maintain continuous, timestamped **Version History**:
1. Click *File -> Version History -> See Version History*.
2. Review edits by user and timestamp.
3. You can restore any historical version with one click!""",
        downloadable_resources=[
            {
                "title": "Cloud Workspace Directory Structure Template",
                "url": "/storage/resources/cloud_folder_structure.pdf",
                "file_type": "pdf",
                "size_kb": 210,
                "description": "Standard folder taxonomy for product, engineering, and HR teams."
            }
        ]
    )
    db.add(l1_1_2)

    # Module 2
    m1_2 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c1.id,
        title="Module 2: Asynchronous Agility & Written Communication",
        description="Write concise, executive updates, protect calendar boundaries, and conduct asynchronous standups.",
        order_index=2,
        duration_minutes=90
    )
    db.add(m1_2)
    db.flush()

    l1_2_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m1_2.id,
        course_id=c1.id,
        title="The Power of Async-First: Writing Concise Executive Updates",
        slug="power-of-async-first-communication",
        order_index=1,
        content_type="text",
        estimated_minutes=25,
        is_mandatory=True,
        content_markdown="""# The Power of Async-First: The 3-Sentence Update Rule

As working mothers and returning professionals, our most scarce commodity is uninterrupted time. Traditional workplace cultures rely on 30-minute meetings for questions that could be answered in 3 written sentences. **Async-First** organizations prioritize thoughtful written documentation over synchronous meetings.

### The 3-Sentence Update Framework

When posting a daily standup or project status update, use this formula:

1. **Accomplished (What is finished)**:
   - *Example*: "Finalized the Q3 returnship onboarding checklist in Notion and shared with HR for review."
2. **Next Priority (What you are tackling today)**:
   - *Example*: "Auditing the 25 candidate profile schemas in PostgreSQL."
3. **Blockers & Dependencies (Where you need help)**:
   - *Example*: "Blocked on access to the staging API key; pinged @DevOps in `#ops-access`."

### BLUF: Bottom Line Up Front

Executives read dozens of messages every hour. Never bury your conclusion at the end of a long paragraph.
- **Weak**: "Hi everyone, after reviewing multiple datasets and looking at the past 6 months of trends, we noticed a slight dip in conversions, and after talking to support, we think we should change the landing button."
- **Strong (BLUF)**: "**Recommendation**: Change the primary CTA to 'Apply for Returnship' by Friday to increase applicant conversion by ~14%. Details and data below: [Link]" """,
        downloadable_resources=[
            {
                "title": "Executive Communication Templates (Word/Docx)",
                "url": "/storage/resources/async_update_templates.docx",
                "file_type": "docx",
                "size_kb": 180,
                "description": "Plug-and-play templates for standups, meeting agendas, and project briefs."
            }
        ]
    )
    db.add(l1_2_1)

    l1_2_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m1_2.id,
        course_id=c1.id,
        title="Cybersecurity Hygiene & DPDP Act Data Privacy",
        slug="cybersecurity-hygiene-and-privacy",
        order_index=2,
        content_type="text",
        estimated_minutes=30,
        is_mandatory=True,
        content_markdown="""# Cybersecurity Hygiene & Data Privacy (DPDP Act 2023)

In hybrid and remote workplaces, security is every employee's responsibility. Organizations handle sensitive customer data governed by stringent laws such as India's **Digital Personal Data Protection Act (DPDP Act 2023)**.

### The 4 Non-Negotiable Cyber Hygiene Rules

1. **Multi-Factor Authentication (MFA / 2FA)**:
   - Never use SMS verification when an Authenticator App (Google Authenticator, Microsoft Authenticator) or hardware security key is supported. Authenticator apps protect against SIM-swap attacks.

2. **Enterprise Password Managers**:
   - Modern teams use Bitwarden or 1Password. Never reuse passwords across personal and work accounts. Let the manager generate 16+ character random passwords.

3. **Spotting Phishing & Social Engineering**:
   - Look for spoofed sender domains (`hr-novatech.co` instead of `novatech.com`).
   - Be skeptical of urgent requests from 'executives' asking for wire transfers or gift cards. Always verify out-of-band via phone or official Slack channel.

4. **Data Handling & Personal Device Separation**:
   - Never store customer PII (names, phone numbers, Aadhaar, salary records) on unencrypted personal USB drives or personal cloud accounts.
   - Use dedicated browser profiles or virtual desktops provided by your employer.""",
        downloadable_resources=[
            {
                "title": "Home Office Security & Privacy Audit Checklist",
                "url": "/storage/resources/cyber_security_checklist.pdf",
                "file_type": "pdf",
                "size_kb": 290,
                "description": "10-point checklist to secure your home Wi-Fi, laptop, and browser."
            }
        ]
    )
    db.add(l1_2_2)

    # Assessment for Course 1
    a1 = Assessment(
        id=str(uuid.uuid4()),
        course_id=c1.id,
        title="Workplace Digital Skills Comprehensive Certification Assessment",
        description="10 server-graded questions evaluating your practical mastery of asynchronous communication, cloud sharing, security hygiene, and modern toolchains.",
        assessment_type="quiz",
        passing_score_percentage=70,
        max_attempts=3,
        time_limit_minutes=25,
        randomize_questions=False,
        is_mandatory_for_certificate=True
    )
    db.add(a1)
    db.flush()

    c1_questions = [
        ("In Slack or Microsoft Teams, what is the primary benefit of replying inside a message thread rather than posting in the main channel?",
         [{"id": "a", "text": "It keeps the message invisible to company administrators."},
          {"id": "b", "text": "It keeps discussions contextually organized and prevents distracting all channel members with notifications."},
          {"id": "c", "text": "It automatically generates a calendar invite for the team."},
          {"id": "d", "text": "It bypasses corporate internet firewalls."}],
         ["b"],
         "Replying in thread keeps conversation context together and prevents unnecessary notification fatigue across the team.", 1),
        ("You are sharing a confidential quarterly budget spreadsheet with department heads for their comments only. Which permission level is safest?",
         [{"id": "a", "text": "Editor with Public Link access"},
          {"id": "b", "text": "Owner"},
          {"id": "c", "text": "Commenter / Suggestion mode restricted to specific named emails"},
          {"id": "d", "text": "Viewer with Anonymous Link"}],
         ["c"],
         "Commenter mode lets reviewers make annotations without risking accidental formula deletion, restricted to designated emails.", 1),
        ("What does BLUF stand for in modern executive communication?",
         [{"id": "a", "text": "Basic Level User Formatting"},
          {"id": "b", "text": "Bottom Line Up Front"},
          {"id": "c", "text": "Broadcast Live Unified Feed"},
          {"id": "d", "text": "Backup Last Updated Files"}],
         ["b"],
         "Bottom Line Up Front places the key conclusion or recommendation first so busy stakeholders immediately understand the context.", 1),
        ("Which of the following is the most secure multi-factor authentication (MFA) method?",
         [{"id": "a", "text": "SMS text message code"},
          {"id": "b", "text": "An Authenticator App (e.g. Google/Microsoft Authenticator) or hardware security key"},
          {"id": "c", "text": "A mother's maiden name security question"},
          {"id": "d", "text": "Sending a verification email to your personal inbox"}],
         ["b"],
         "Time-based one-time password (TOTP) apps and hardware security keys are immune to SIM-swapping attacks.", 1),
        ("Under India's DPDP Act 2023, what should you do if an unauthorized person requests customer phone numbers via email?",
         [{"id": "a", "text": "Reply immediately with an exported CSV file."},
          {"id": "b", "text": "Post the customer data in the public Slack channel."},
          {"id": "c", "text": "Refuse and escalate to your company's Data Protection Officer / Security lead following formal verification procedures."},
          {"id": "d", "text": "Upload the data to your personal Google Drive."}],
         ["c"],
         "Customer personal data is protected; sharing without lawful purpose and authorization violates privacy regulations.", 1),
        ("How can you restore an accidental deletion in a shared Google Doc or Microsoft Word Online file?",
         [{"id": "a", "text": "Re-type the entire document from memory."},
          {"id": "b", "text": "Access 'Version History', inspect prior timestamps, and restore the desired historical state."},
          {"id": "c", "text": "Delete the file and start a new one."},
          {"id": "d", "text": "It is permanently gone and cannot be recovered."}],
         ["b"],
         "Cloud platforms maintain continuous timestamped version history allowing one-click rollback.", 1),
        ("What is the recommended 3-sentence daily update structure for asynchronous standups?",
         [{"id": "a", "text": "Greetings, weather commentary, personal complaints."},
          {"id": "b", "text": "What was accomplished, what is being worked on next, and any blockers/dependencies."},
          {"id": "c", "text": "A list of every website visited during the day."},
          {"id": "d", "text": "No update is needed unless directly asked."}],
         ["b"],
         "Accomplished, Next Priorities, and Blockers deliver complete clarity in under 30 seconds of reading time.", 1),
        ("An email arrives from 'ceo-executive-office@novatech-portal.biz' asking you to urgently buy gift cards for a client. What is this?",
         [{"id": "a", "text": "An authentic VIP priority assignment."},
          {"id": "b", "text": "A classic CEO fraud / social engineering phishing attempt."},
          {"id": "c", "text": "A standard company bonus procedure."},
          {"id": "d", "text": "A system test from Google."}],
         ["b"],
         "Spoofed domains requesting urgent gift cards or money transfers are classic social engineering scams.", 1),
        ("Why are Shared Drives / SharePoint Libraries preferred over personal drives for team projects?",
         [{"id": "a", "text": "Files are owned by the organization, so access isn't lost when individual employees take leave or move teams."},
          {"id": "b", "text": "They use less computer electricity."},
          {"id": "c", "text": "They automatically delete files after 7 days."},
          {"id": "d", "text": "They prevent anyone from viewing the document."}],
         ["a"],
         "Shared Drives maintain organizational continuity and avoid knowledge silos.", 1),
        ("What is the primary purpose of setting your Slack/Teams status to 'Focused / Deep Work (Back at 2 PM)'?",
         [{"id": "a", "text": "To appear busy when doing nothing."},
          {"id": "b", "text": "To set transparent expectations on response times while protecting uninterrupted work focus."},
          {"id": "c", "text": "To disconnect your computer from the internet."},
          {"id": "d", "text": "To trigger an automatic salary deduction."}],
         ["b"],
         "Clear digital statuses manage expectations and reduce anxious interruptions.", 1),
    ]

    for idx, (qtext, opts, correct, expl, pts) in enumerate(c1_questions, start=1):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=a1.id,
            question_text=qtext,
            question_type="single_choice",
            options=opts,
            correct_option_ids=correct,
            explanation=expl,
            points=pts,
            order_index=idx
        )
        db.add(q)

    # Practical Assignment for Course 1
    p1 = PracticalAssignment(
        id=str(uuid.uuid4()),
        course_id=c1.id,
        title="Remote Team Collaboration Blueprint & Executive Briefing",
        instructions_markdown="""### Practical Assignment: Remote Team Collaboration Blueprint

**Objective**: Create a comprehensive 1–2 page asynchronous collaboration blueprint for a newly formed hybrid team at Nova Technologies.

#### Deliverable Requirements:
1. **Communication Matrix**: Define which channel to use for (a) urgent operational blockers, (b) routine project check-ins, (c) long-term architectural decisions, and (d) personal time-off requests.
2. **Cloud Folder Taxonomy**: Outline a 3-level folder structure in Google Drive / OneDrive for the project (e.g., `01_Planning`, `02_Assets`, `03_Final_Deliverables`) with defined sharing permissions (Viewer/Commenter/Editor).
3. **One-Page Async Project Brief (BLUF Format)**: Write a mock executive project brief announcing the launch of the project to stakeholders.
4. **Security Safeguards**: List 3 specific cyber hygiene rules required for all team members (e.g., MFA, document classification, device encryption).

#### How to Submit:
Draft your assignment in Google Docs, Notion, or Markdown. Provide the shareable public link or paste your formatted text in the submission portal below. Ensure permission is set to 'Anyone with link can view/comment'.""",
        rubric=[
            {"criterion": "Asynchronous Protocol & Channel Clarity", "weight_percentage": 30, "description": "Clear distinction between synchronous meetings, threads, and documentation."},
            {"criterion": "Folder Taxonomy & Permission Architecture", "weight_percentage": 30, "description": "Logical hierarchy with appropriate least-privilege security roles."},
            {"criterion": "Executive Briefing Quality (BLUF)", "weight_percentage": 20, "description": "Concise, professional tone with actionable conclusions front-and-center."},
            {"criterion": "Security & DPDP Privacy Alignment", "weight_percentage": 20, "description": "Practical safeguards protecting sensitive customer and company data."}
        ],
        submission_type="text_and_link",
        is_mandatory_for_certificate=True
    )
    db.add(p1)
    db.flush()

    # =========================================================================
    # COURSE 2: EXCEL FOR CAREER RETURNERS
    # =========================================================================
    c2 = Course(
        id=str(uuid.uuid4()),
        slug="excel-for-career-returners",
        title="Excel & Data Analysis for Career Returners",
        subtitle="Refresh modern spreadsheet capabilities: XLOOKUP, dynamic arrays, Power Query data cleaning, and interactive executive dashboards.",
        description=(
            "Designed to quickly eliminate anxiety around spreadsheet interviews and analytical roles. Move beyond outdated "
            "VLOOKUP formulas into modern Excel capabilities including XLOOKUP, dynamic arrays, automated Power Query transformation, "
            "and multi-dimensional Pivot Tables that impress returnship hiring managers."
        ),
        category="Data & Analytics",
        difficulty="Intermediate",
        estimated_duration_hours=16,
        thumbnail_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        status="published",
        learning_outcomes=[
            "Master modern lookup formulas: XLOOKUP, INDEX/MATCH, and error handling with [if_not_found].",
            "Perform multi-condition aggregations using SUMIFS, COUNTIFS, and nested logic.",
            "Clean and unpivot messy real-world datasets using Power Query without repetitive manual tasks.",
            "Design executive-ready Pivot Table dashboards with slicers, timeline filters, and KPI summary cards."
        ],
        prerequisites=["Familiarity with basic spreadsheet data entry."],
        target_audience="Professionals returning to business analyst, financial, operations, and data analytics returnships.",
        language_primary="en",
        language_available=["en", "ta"],
        passing_score_percentage=70,
        attempt_limit=3,
        version="v1.0"
    )
    db.add(c2)
    db.flush()

    # Modules for Course 2
    m2_1 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c2.id,
        title="Module 1: Modern Formula Foundations & Moving Beyond VLOOKUP",
        description="Master XLOOKUP, dynamic array calculations, and multi-condition aggregation formulas.",
        order_index=1,
        duration_minutes=120
    )
    db.add(m2_1)
    db.flush()

    l2_1_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m2_1.id,
        course_id=c2.id,
        title="Mastering XLOOKUP & Retiring VLOOKUP Fragility",
        slug="mastering-xlookup-formula",
        order_index=1,
        content_type="video_and_text",
        video_url="https://www.youtube.com/watch?v=0hX0I4uR1-w",
        estimated_minutes=35,
        is_mandatory=True,
        content_markdown="""# Mastering XLOOKUP: The Modern Data Analyst's Best Friend

For over two decades, `VLOOKUP` was the benchmark formula in spreadsheet interviews. However, `VLOOKUP` had severe limitations:
1. It could only look left-to-right (the lookup column had to be the first column).
2. Inserting a new column broke existing formula indices (`col_index_num`).
3. It defaulted to approximate match (`TRUE`), leading to silent calculation errors if forgotten.

### Introducing XLOOKUP

`XLOOKUP` fixes all of these issues with clean, robust syntax:

```excel
=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])
```

#### Core Arguments Explained:
- `lookup_value`: What are you searching for? (e.g., `A2` or employee ID `1042`).
- `lookup_array`: Where should Excel search? (e.g., `Employees!A:A`).
- `return_array`: What data should be returned? (e.g., `Employees!D:D` for Salary).
- `[if_not_found]`: What should display if no match exists? (e.g., `"Not Found"`). Replaces the need for nested `IFERROR()`!

### Practical Example

To look up an employee's salary when the ID is in column B and salary is in column A (looking to the left!):

```excel
=XLOOKUP(D2, B:B, A:A, "Record Missing")
```

This simple formula works in any direction, does not break when columns are added, and returns clean fallback messages.""",
        downloadable_resources=[
            {
                "title": "XLOOKUP & Modern Formulas Practice Dataset (.xlsx)",
                "url": "/storage/resources/excel_xlookup_practice.xlsx",
                "file_type": "xlsx",
                "size_kb": 450,
                "description": "Hands-on workbook with sales records, customer lookup scenarios, and solutions."
            }
        ],
        knowledge_check={
            "question": "What is the primary advantage of XLOOKUP over traditional VLOOKUP?",
            "options": [
                "It requires macros to be enabled.",
                "It can search in any direction (left or right) and doesn't break when columns are inserted.",
                "It only works on numbers, not text.",
                "It can only look up 10 rows at a time."
            ],
            "correct_index": 1,
            "explanation": "XLOOKUP separates the lookup array from the return array, allowing bi-directional lookups and structural stability."
        }
    )
    db.add(l2_1_1)

    l2_1_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m2_1.id,
        course_id=c2.id,
        title="Multi-Condition Aggregations: SUMIFS, COUNTIFS & FILTER",
        slug="multi-condition-aggregations",
        order_index=2,
        content_type="text",
        estimated_minutes=35,
        is_mandatory=True,
        content_markdown="""# Multi-Condition Aggregations: SUMIFS, COUNTIFS & FILTER

Business reporting frequently asks questions with multiple criteria:
- *"What was the total revenue in the South region for Enterprise accounts in Q2?"*
- *"How many candidates with > 3 years experience completed onboarding?"*

### The Syntax of SUMIFS

Remember that `SUMIFS` puts the sum range **first**:

```excel
=SUMIFS(sum_range, criteria_range1, criterion1, [criteria_range2, criterion2], ...)
```

#### Real-World Example:
```excel
=SUMIFS(Revenue, Region, "South", AccountType, "Enterprise", Quarter, "Q2")
```

### The Modern FILTER Dynamic Array Formula

In modern Excel (Microsoft 365 and Excel 2021+), you can extract entire subsets of rows dynamically:

```excel
=FILTER(A2:E100, (C2:C100="Remote") * (D2:D100>=40000), "No matching returnships")
```

- Multiplication (`*`) represents an **AND** condition.
- Addition (`+`) represents an **OR** condition.

When this formula is entered in a single cell, it automatically 'spills' all matching rows across adjacent cells!""",
        downloadable_resources=[
            {
                "title": "SUMIFS & COUNTIFS Master Reference Sheet",
                "url": "/storage/resources/excel_aggregation_reference.pdf",
                "file_type": "pdf",
                "size_kb": 240,
                "description": "Comprehensive reference with date criteria formulas and wildcard syntax."
            }
        ]
    )
    db.add(l2_1_2)

    m2_2 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c2.id,
        title="Module 2: Power Query Data Cleaning & Automated ETL",
        description="Clean messy data, remove duplicates, unpivot columns, and automate repetitive monthly reporting.",
        order_index=2,
        duration_minutes=120
    )
    db.add(m2_2)
    db.flush()

    l2_2_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m2_2.id,
        course_id=c2.id,
        title="Automating Repetitive Data Cleanup with Power Query",
        slug="power-query-automated-cleanup",
        order_index=1,
        content_type="text",
        estimated_minutes=40,
        is_mandatory=True,
        content_markdown="""# Automating Repetitive Data Cleanup with Power Query

Many returning professionals remember spending hours every Monday manually copying columns, fixing inconsistent dates, and deleting empty rows. **Power Query** (built directly into Excel under the *Data -> Get & Transform Data* tab) records your data cleaning steps once and automates them forever.

### The Power Query Workflow: Extract, Transform, Load (ETL)

1. **Get Data**: Connect to CSVs, folder of files, SQL databases, or web tables.
2. **Transform in the Query Editor**:
   - **Trim & Clean**: Strip hidden trailing spaces that cause lookup failures.
   - **Split Columns**: Separate full names into First and Last names by delimiter.
   - **Unpivot Columns**: Convert wide crosstabs into normalized tabular datasets ready for Pivot Tables.
   - **Replace Errors / Nulls**: Gracefully replace empty fields with standardized labels.
3. **Close & Load**: Stream the cleaned data directly into an Excel Table or Data Model.

### The Magic: 1-Click Refresh

Next month, when the new export arrives, you don't repeat the steps. Just click **Data -> Refresh All**, and all transformations execute in milliseconds!""",
        downloadable_resources=[
            {
                "title": "Dirty Dataset for Power Query Cleaning Practice (.csv)",
                "url": "/storage/resources/dirty_sales_data.csv",
                "file_type": "csv",
                "size_kb": 150,
                "description": "Sample messy sales data with inconsistent formatting and trailing spaces."
            }
        ]
    )
    db.add(l2_2_1)

    l2_2_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m2_2.id,
        course_id=c2.id,
        title="Interactive Dashboards: Pivot Tables, Slicers & KPI Cards",
        slug="interactive-dashboards-and-pivot-tables",
        order_index=2,
        content_type="text",
        estimated_minutes=35,
        is_mandatory=True,
        content_markdown="""# Interactive Executive Dashboards in Excel

A spreadsheet full of 10,000 raw rows does not communicate insight to leadership. Senior executives require **executive dashboards** highlighting KPIs, trends, and regional breakdowns.

### The Anatomy of an Executive Dashboard

1. **KPI Header Cards**:
   - 3 to 4 prominent metrics at the top (e.g., Total Revenue, Returnship Placements, Average Completion Rate).
2. **Interactive Slicers**:
   - Visual filter buttons connected to multiple Pivot Tables simultaneously (*Slicer -> Report Connections*).
3. **Muted, Accessible Color Palette**:
   - Avoid garish rainbow charts. Use 2 core harmonious tones (e.g., navy and charcoal with a subtle accent) with clear axis labels.
4. **Gridlines Removed**:
   - Go to *View -> Uncheck 'Gridlines'* to transform your spreadsheet into an executive presentation canvas!""",
        downloadable_resources=[
            {
                "title": "Executive Dashboard Template (.xlsx)",
                "url": "/storage/resources/executive_dashboard_template.xlsx",
                "file_type": "xlsx",
                "size_kb": 510,
                "description": "Finished interactive dashboard with slicers and pre-configured KPI cards."
            }
        ]
    )
    db.add(l2_2_2)

    # Assessment for Course 2
    a2 = Assessment(
        id=str(uuid.uuid4()),
        course_id=c2.id,
        title="Excel & Analytical Problem Solving Certification Exam",
        description="10 practical questions testing formula mastery, Power Query steps, Pivot Table configuration, and executive dashboard design.",
        assessment_type="quiz",
        passing_score_percentage=70,
        max_attempts=3,
        time_limit_minutes=25,
        randomize_questions=False,
        is_mandatory_for_certificate=True
    )
    db.add(a2)
    db.flush()

    c2_questions = [
        ("In the formula =XLOOKUP(A2, C:C, B:B, 'None'), what happens if A2 is not found in column C?",
         [{"id": "a", "text": "Excel returns the error #N/A."},
          {"id": "b", "text": "Excel returns the text 'None'."},
          {"id": "c", "text": "Excel crashes."},
          {"id": "d", "text": "Excel returns 0."}],
         ["b"],
         "The fourth argument of XLOOKUP defines the [if_not_found] fallback value.", 1),
        ("Where is the sum range positioned in the SUMIFS formula?",
         [{"id": "a", "text": "At the very end of all arguments."},
          {"id": "b", "text": "As the first argument."},
          {"id": "c", "text": "In a separate worksheet."},
          {"id": "d", "text": "SUMIFS does not take a sum range."}],
         ["b"],
         "Unlike SUMIF (which places it last), SUMIFS places sum_range as the very first argument.", 1),
        ("What is the primary benefit of transforming raw data with Power Query instead of manual edits?",
         [{"id": "a", "text": "It turns the text purple."},
          {"id": "b", "text": "All transformation steps are recorded as a repeatable script that can be refreshed with one click when new data arrives."},
          {"id": "c", "text": "It converts files into Word documents."},
          {"id": "d", "text": "It limits files to 10 rows maximum."}],
         ["b"],
         "Power Query automates ETL pipelines, eliminating manual repetitive spreadsheet tasks.", 1),
        ("How can you connect a single Slicer button to filter three different Pivot Tables simultaneously?",
         [{"id": "a", "text": "Copy and paste the slicer 3 times."},
          {"id": "b", "text": "Right-click the Slicer, choose 'Report Connections', and check the boxes for all three Pivot Tables."},
          {"id": "c", "text": "Merge the worksheet cells."},
          {"id": "d", "text": "It is not possible in Excel."}],
         ["b"],
         "Report Connections links a slicer to any Pivot Table sharing the same underlying data cache.", 1),
        ("What does the 'Unpivot Columns' feature in Power Query accomplish?",
         [{"id": "a", "text": "It deletes all numeric values."},
          {"id": "b", "text": "It transforms wide matrix tables (e.g. months across columns) into tall normalized attribute-value pairs suitable for Pivot analysis."},
          {"id": "c", "text": "It sorts data alphabetically."},
          {"id": "d", "text": "It exports the file as a PDF."}],
         ["b"],
         "Unpivoting is essential for normalizing crosstab data into clean database records.", 1),
        ("Which modern dynamic array formula filters a table based on logical criteria without writing VBA?",
         [{"id": "a", "text": "=FILTER()"},
          {"id": "b", "text": "=SEARCH()"},
          {"id": "c", "text": "=VLOOKUP()"},
          {"id": "d", "text": "=CLEAN()"}],
         ["a"],
         "The FILTER formula extracts rows matching specific boolean criteria and spills results dynamically.", 1),
        ("Why should you convert a data range into an official Excel Table (Ctrl + T) before creating a Pivot Table?",
         [{"id": "a", "text": "It reduces file size by 99%."},
          {"id": "b", "text": "When new rows are appended to the table, refreshing the Pivot Table automatically includes them without having to update the cell range."},
          {"id": "c", "text": "It prevents users from editing the sheet."},
          {"id": "d", "text": "It translates the sheet into French."}],
         ["b"],
         "Excel Tables expand dynamically as data is added, making them ideal sources for Pivot Tables.", 1),
        ("In the formula =FILTER(A2:D50, (B2:B50='Remote') * (C2:C50>50000)), what does the asterisk (*) operator represent?",
         [{"id": "a", "text": "Multiplication of salaries."},
          {"id": "b", "text": "A logical AND condition between two criteria."},
          {"id": "c", "text": "A wildcard character."},
          {"id": "d", "text": "An error code."}],
         ["b"],
         "In dynamic array formulas, asterisk (*) acts as logical AND, while plus (+) acts as logical OR.", 1),
        ("What is the easiest visual styling adjustment to give an Excel dashboard an executive app-like appearance?",
         [{"id": "a", "text": "Change all text to Comic Sans."},
          {"id": "b", "text": "Uncheck 'Gridlines' under the View tab and use clean card containers."},
          {"id": "c", "text": "Color every cell in bright neon yellow."},
          {"id": "d", "text": "Add 50 animated cliparts."}],
         ["b"],
         "Hiding standard spreadsheet gridlines immediately elevates visual hierarchy and professionalism.", 1),
        ("If XLOOKUP returns a #VALUE! error, what is the most common root cause?",
         [{"id": "a", "text": "The computer is too old."},
          {"id": "b", "text": "The lookup_array and return_array have different lengths or incompatible dimensions."},
          {"id": "c", "text": "The file has not been printed yet."},
          {"id": "d", "text": "The formula contains too many capital letters."}],
         ["b"],
         "XLOOKUP requires lookup_array and return_array to have corresponding dimensions; mismatched ranges trigger #VALUE!.", 1),
    ]

    for idx, (qtext, opts, correct, expl, pts) in enumerate(c2_questions, start=1):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=a2.id,
            question_text=qtext,
            question_type="single_choice",
            options=opts,
            correct_option_ids=correct,
            explanation=expl,
            points=pts,
            order_index=idx
        )
        db.add(q)

    # Practical Assignment for Course 2
    p2 = PracticalAssignment(
        id=str(uuid.uuid4()),
        course_id=c2.id,
        title="Executive Business Performance & Returnship Dashboard",
        instructions_markdown="""### Practical Assignment: Executive Business Performance Dashboard

**Objective**: Take a raw, multi-month operational dataset, clean it, build analytical summary formulas, and construct an interactive executive dashboard in Excel.

#### Step-by-Step Instructions:
1. **Data Cleaning**: Download the practice dataset from Lesson 2.1. Remove leading/trailing spaces, format date columns uniformly, and handle any null values.
2. **Formula Architecture**:
   - Use `XLOOKUP` to match regional manager names to sales territory codes.
   - Use `SUMIFS` and `COUNTIFS` to build a summary table analyzing revenue by product category and quarter.
3. **Interactive Pivot Dashboard**:
   - Construct a Pivot Table summarizing Revenue and Margin by Region.
   - Add two linked Slicers (e.g. Region and Year/Quarter).
   - Uncheck gridlines and add 3 Top-Level KPI Summary Cards (Total Revenue, Total Units, Avg Deal Size).
4. **Insight Synthesis**: Include a 3-bullet executive commentary explaining the top performing segment and one recommendation for next quarter.

#### How to Submit:
Upload your `.xlsx` workbook to Google Drive or OneDrive, set permissions to 'Anyone with link can view', and submit the URL alongside your executive summary below.""",
        rubric=[
            {"criterion": "Data Cleaning & Hygiene", "weight_percentage": 25, "description": "Proper text trimming, date formatting, and table conversion."},
            {"criterion": "Formula Accuracy (XLOOKUP & SUMIFS)", "weight_percentage": 25, "description": "Correct usage of modern lookup and aggregation formulas with error handling."},
            {"criterion": "Dashboard Visual Usability & Hierarchy", "weight_percentage": 25, "description": "Clean layout, linked interactive slicers, KPI cards, and hidden gridlines."},
            {"criterion": "Business Insight Formulation", "weight_percentage": 25, "description": "Actionable, well-reasoned executive takeaways derived from the data."}
        ],
        submission_type="text_and_link",
        is_mandatory_for_certificate=True
    )
    db.add(p2)
    db.flush()

    # =========================================================================
    # COURSE 3: CAREER COMEBACK READINESS
    # =========================================================================
    c3 = Course(
        id=str(uuid.uuid4()),
        slug="career-comeback-readiness",
        title="Career Comeback Readiness & Strategic Re-Entry",
        subtitle="De-stigmatize career hiatuses, frame your comeback narrative with authority, audit transferable skills, and negotiate returnship offers.",
        description=(
            "Designed by returnship mentors and career coaches specifically for women returning after life breaks. "
            "Transform your career break narrative from an anxious apology into a compelling demonstration of resilience and leadership. "
            "Master modern competency auditing, non-chronological skills-first resume design, behavioral interview strategies, "
            "and stipend parity negotiations."
        ),
        category="Career Readiness",
        difficulty="All Levels",
        estimated_duration_hours=14,
        thumbnail_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        status="published",
        learning_outcomes=[
            "Articulate your career break with confidence using the non-apologetic 3-part comeback formula.",
            "Map pre-break tenure and transferable skills to modern in-demand role requirements.",
            "Format a skills-first resume aligned with GFG's tamper-evident Career Continuity Passport.",
            "Navigate difficult interview inquiries, address gap biases, and negotiate fair returnship stipends."
        ],
        prerequisites=["None. Welcomes all career pause durations and backgrounds."],
        target_audience="Women relaunching careers after maternity, caregiving, health, or personal career breaks.",
        language_primary="en",
        language_available=["en", "ta"],
        passing_score_percentage=70,
        attempt_limit=3,
        version="v1.0"
    )
    db.add(c3)
    db.flush()

    # Modules for Course 3
    m3_1 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c3.id,
        title="Module 1: The Ownership Mindset & The Comeback Narrative",
        description="De-stigmatize your hiatus, overcome imposter syndrome, and master your elevator pitch.",
        order_index=1,
        duration_minutes=90
    )
    db.add(m3_1)
    db.flush()

    l3_1_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m3_1.id,
        course_id=c3.id,
        title="Reframing the Hiatus: Why Life Breaks Build Strategic Resilience",
        slug="reframing-the-career-hiatus",
        order_index=1,
        content_type="video_and_text",
        video_url="https://www.youtube.com/watch?v=t-fX3zWfQz8",
        estimated_minutes=25,
        is_mandatory=True,
        content_markdown="""# Reframing the Career Hiatus: From Apology to Authority

In traditional corporate environments, a gap on a resume was treated as a liability. At GFG, our core founding thesis is that **career breaks are periods of profound personal growth, crisis management, and perspective**.

### Deconstructing the 'Career Break Penalty'

Research across Indian and global corporate sectors reveals that women on career breaks often experience **anticipatory anxiety**—fearing that their pre-break tenure has evaporated in the eyes of recruiters. In reality:
- Core engineering, analytical, and leadership foundations do not disappear.
- Tools change rapidly (a new JS framework, a new Excel function), but fundamental problem-solving logic and domain expertise remain intact.
- Life events (managing caregiving, family relocation, medical recovery) develop intense prioritization, emotional intelligence, and calm under pressure—qualities rare in early-career professionals.

### The Power of Tone: Never Apologize

Observe the stark difference between these two candidate introductions:
- ❌ **Apologetic Tone**: *"I am sorry about the gap on my CV. I have been out of the industry for 3 years because I had a baby, and I hope you can take a chance on me even though I am rusty."*
- ✅ **Ownership Tone**: *"Prior to my career pause, I spent 5 years building scalable backend systems. Over the past 3 years, I intentionally prioritized family care while staying engaged with tech trends. I have recently refreshed my cloud and data skills through GFG coursework, and I am excited to bring my combined technical depth and seasoned focus to your returnship team."* """,
        downloadable_resources=[
            {
                "title": "Comeback Narrative Formula Worksheet (PDF)",
                "url": "/storage/resources/comeback_narrative_worksheet.pdf",
                "file_type": "pdf",
                "size_kb": 220,
                "description": "Step-by-step prompts to formulate your personalized elevator pitch."
            }
        ],
        knowledge_check={
            "question": "When introducing yourself in an interview, how should you address your career break?",
            "options": [
                "Apologize for missing time and offer to work for free.",
                "Frame your prior tenure with pride, state your intentional life break with clarity, and highlight recent proactive skill refresh.",
                "Pretend the break never happened and refuse to discuss it.",
                "Blame previous employers for your gap."
            ],
            "correct_index": 1,
            "explanation": "Ownership, dignity, and forward momentum showcase executive presence and self-confidence."
        }
    )
    db.add(l3_1_1)

    l3_1_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m3_1.id,
        course_id=c3.id,
        title="Skills-First Resume Architecture & The Career Passport",
        slug="skills-first-resume-architecture",
        order_index=2,
        content_type="text",
        estimated_minutes=30,
        is_mandatory=True,
        content_markdown="""# Skills-First Resume Architecture

Traditional reverse-chronological resumes emphasize dates above all else. For returning professionals, this places your multi-year break at the very top of the page.

### The Functional / Hybrid Hybrid Architecture

1. **Top Section: Professional Identity & Core Competencies**:
   - Executive headline (e.g. *Senior Software Engineer | Backend & Data Analytics Specialist*).
   - Core Competency Matrix: Group technical skills (Python, SQL, PostgreSQL) alongside applied business competencies (Cross-Functional Delivery, Agile Management).

2. **Second Section: Returnship Readiness & Recent Proactive Upskilling**:
   - Detail verified GFG coursework, certifications, and portfolio capstone projects.
   - Shows hiring managers that your knowledge of modern tooling is current and active.

3. **Third Section: Verified Professional Experience**:
   - List pre-break employers, positions, and quantified achievements.
   - Group the career pause transparently:
     - *Career Sabbatical — Family Care & Continuous Learning (2022–2025)*
     - Note: "Deliberate sabbatical focused on family care alongside completing GFG Verified Returnship Curriculum." """,
        downloadable_resources=[
            {
                "title": "Skills-First Returnship Resume Template (Word)",
                "url": "/storage/resources/skills_first_resume_template.docx",
                "file_type": "docx",
                "size_kb": 195,
                "description": "ATS-friendly, non-chronological resume template engineered for returnship applications."
            }
        ]
    )
    db.add(l3_1_2)

    m3_2 = CourseModule(
        id=str(uuid.uuid4()),
        course_id=c3.id,
        title="Module 2: Strategic Interviewing, Offer Evaluation & Stipend Parity",
        description="Master behavioral interviews, evaluate returnship pathways, and negotiate fair stipends.",
        order_index=2,
        duration_minutes=90
    )
    db.add(m3_2)
    db.flush()

    l3_2_1 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m3_2.id,
        course_id=c3.id,
        title="Mastering Returnship Behavioral & Technical Interviews",
        slug="mastering-returnship-interviews",
        order_index=1,
        content_type="text",
        estimated_minutes=30,
        is_mandatory=True,
        content_markdown="""# Mastering Returnship Behavioral & Technical Interviews

Returnship interviewers look for two qualities above all: **adaptability** and **clarity of purpose**.

### The SAR Method for Behavioral Questions

Use the **Situation, Action, Result** framework:

- **Situation**: Set the stage concisely in 1-2 sentences.
- **Action**: Focus on what *you* specifically did, the decisions you made, and how you communicated.
- **Result**: Quantify the impact (e.g., *"reduced query latency by 35%"*, *"delivered the release 3 days ahead of schedule"*).

### Addressing the Classic 'Rustiness' Concern

Interviewers may wonder if it will take you too long to get up to speed. Counter this proactively:
- *"I understand that tech stacks evolve. What has not changed is my engineering discipline and architectural judgment. In my recent GFG coursework, I adapted to modern cloud patterns within weeks, and my learning curve is proven and steep."* """,
        downloadable_resources=[
            {
                "title": "Top 15 Returnship Interview Questions & Model Answers",
                "url": "/storage/resources/returnship_interview_guide.pdf",
                "file_type": "pdf",
                "size_kb": 310,
                "description": "Detailed answers for career gap questions, technical drills, and behavioral scenarios."
            }
        ]
    )
    db.add(l3_2_1)

    l3_2_2 = Lesson(
        id=str(uuid.uuid4()),
        module_id=m3_2.id,
        course_id=c3.id,
        title="Evaluating Returnships & Demanding Stipend Parity",
        slug="evaluating-returnships-and-stipend-parity",
        order_index=2,
        content_type="text",
        estimated_minutes=25,
        is_mandatory=True,
        content_markdown="""# Evaluating Returnships & Demanding Stipend Parity

Not all returnship programs are created equal. A true returnship is a **dignified, paid transitional fellowship**, not unpaid labor or an extended unpaid probation.

### The GFG Returnship Standard (Charter Invariants)

When evaluating returnship offers, look for these 4 benchmarks:

1. **Stipend Parity**:
   - In India, professional returnships should provide a minimum baseline of ₹35,000 to ₹60,000/month stipend commensurate with pre-break experience.
   - Never accept an unpaid returnship for professional roles.

2. **Conversion Path Transparency**:
   - The employer should explicitly define the evaluation criteria and conversion timeline (typically 12 to 16 weeks).
   - High-quality programs boast conversion rates above 70%.

3. **Dedicated Mentorship**:
   - You should be assigned both a technical peer buddy and an executive sponsor who understand career re-entry dynamics.

4. **Caregiver Flexibility**:
   - Transparent hybrid or remote work agreements with core collaboration hours that respect family schedules.""",
        downloadable_resources=[
            {
                "title": "Returnship Offer Evaluation Scorecard",
                "url": "/storage/resources/returnship_offer_scorecard.pdf",
                "file_type": "pdf",
                "size_kb": 220,
                "description": "Evaluate and compare multiple returnship opportunities across compensation, culture, and conversion rate."
            }
        ]
    )
    db.add(l3_2_2)

    # Assessment for Course 3
    a3 = Assessment(
        id=str(uuid.uuid4()),
        course_id=c3.id,
        title="Career Comeback Readiness & Re-Entry Strategic Assessment",
        description="10 comprehensive questions evaluating your narrative framing, resume architecture, interview responses, and returnship offer evaluation.",
        assessment_type="quiz",
        passing_score_percentage=70,
        max_attempts=3,
        time_limit_minutes=25,
        randomize_questions=False,
        is_mandatory_for_certificate=True
    )
    db.add(a3)
    db.flush()

    c3_questions = [
        ("What is the primary psychological hazard of opening an interview by apologizing for your career break?",
         [{"id": "a", "text": "It takes too many words to say."},
          {"id": "b", "text": "It frames your hiatus as a deficiency, immediately lowering perceived authority and executive presence."},
          {"id": "c", "text": "It violates company HR policies."},
          {"id": "d", "text": "It makes the interview end early."}],
         ["b"],
         "Apologizing conveys insecurity; framing with ownership highlights resilience, maturity, and forward readiness.", 1),
        ("Why is a skills-first or hybrid resume architecture recommended for career returners over a pure chronological format?",
         [{"id": "a", "text": "It hides all company names."},
          {"id": "b", "text": "It places core competencies, technical skills, and recent upskilling at the top before detailing historical employment dates."},
          {"id": "c", "text": "It doesn't require printing."},
          {"id": "d", "text": "It uses fewer words."}],
         ["b"],
         "Skills-first resumes showcase current competency and verified capabilities first.", 1),
        ("What does the SAR method in behavioral interviews stand for?",
         [{"id": "a", "text": "Summary, Analysis, Recommendation"},
          {"id": "b", "text": "Situation, Action, Result"},
          {"id": "c", "text": "System, Architecture, Review"},
          {"id": "d", "text": "Syntax, Application, Response"}],
         ["b"],
         "Situation, Action, Result creates structured, evidence-based answers to behavioral questions.", 1),
        ("According to GFG platform standards, what is an essential characteristic of a legitimate, ethical returnship?",
         [{"id": "a", "text": "It requires candidates to work unpaid for 6 months."},
          {"id": "b", "text": "It provides a competitive paid stipend, structured mentorship, and a transparent conversion pathway to permanent tenure."},
          {"id": "c", "text": "It forbids working mothers from taking personal leave."},
          {"id": "d", "text": "It requires working 16 hours a day."}],
         ["b"],
         "Dignified returnships must provide fair compensation, clear conversion criteria, and mentorship support.", 1),
        ("How should you respond if an interviewer asks: 'Do you think you can handle modern workloads after being away for 4 years?'",
         [{"id": "a", "text": "I guess I will try, but I am nervous."},
          {"id": "b", "text": "Ground your answer in your pre-break track record, life management resilience, and verified recent coursework demonstrating rapid adaptability."},
          {"id": "c", "text": "That is an illegal question and I refuse to answer."},
          {"id": "d", "text": "Start crying."}],
         ["b"],
         "Grounding your response in concrete achievements and intentional preparation turns skepticism into confidence.", 1),
        ("What is the role of an executive sponsor in a high-quality returnship program?",
         [{"id": "a", "text": "To monitor your browser history."},
          {"id": "b", "text": "To provide high-level advocacy, remove organizational roadblocks, and champion your transition to permanent tenure."},
          {"id": "c", "text": "To assign you lunch coffee runs."},
          {"id": "d", "text": "To review your personal bank account."}],
         ["b"],
         "Executive sponsors provide essential senior visibility and career advocacy across the company.", 1),
        ("What should a returning professional highlight about their career hiatus during interviews?",
         [{"id": "a", "text": "Nothing at all; completely omit it."},
          {"id": "b", "text": "The transferable soft skills honed: crisis management, multi-stakeholder prioritization, and emotional resilience under pressure."},
          {"id": "c", "text": "Every personal medical or domestic argument."},
          {"id": "d", "text": "That they never want to work in an office again."}],
         ["b"],
         "Life breaks develop real resilience and perspective that translate into mature corporate leadership.", 1),
        ("If an employer offers an unpaid 'evaluation trial' instead of a paid returnship stipend, what is the recommended response?",
         [{"id": "a", "text": "Accept immediately and work overtime."},
          {"id": "b", "text": "Politely decline and advocate for standard stipend parity, referencing verified GFG returnship standards."},
          {"id": "c", "text": "Pay the employer money to work there."},
          {"id": "d", "text": "Delete your resume."}],
         ["b"],
         "Unpaid professional work exploits returners; advocating for fair stipend parity sets healthy professional boundaries.", 1),
        ("In the 3-part comeback formula, what are the three sequential elements?",
         [{"id": "a", "text": "Greeting, Apology, Resignation"},
          {"id": "b", "text": "Anchor (Pre-Break Tenure), Pivot (Purposeful Pause), Launch (Refreshed Readiness)"},
          {"id": "c", "text": "Salary Request, Vacation Request, Resignation"},
          {"id": "d", "text": "College GPA, High School, Elementary School"}],
         ["b"],
         "Anchor, Pivot, Launch delivers a confident, compelling narrative in under 60 seconds.", 1),
        ("Why does GFG issue tamper-evident verified certificates and Career Continuity Passports?",
         [{"id": "a", "text": "To sell candidate data to advertising companies."},
          {"id": "b", "text": "To provide cryptographic proof of competence and coursework completion, bypassing arbitrary ATS career gap algorithmic rejections."},
          {"id": "c", "text": "To print posters."},
          {"id": "d", "text": "To replace university degrees entirely."}],
         ["b"],
         "Authentic credentials establish verified competence so candidates are judged on capability, not career gaps.", 1),
    ]

    for idx, (qtext, opts, correct, expl, pts) in enumerate(c3_questions, start=1):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=a3.id,
            question_text=qtext,
            question_type="single_choice",
            options=opts,
            correct_option_ids=correct,
            explanation=expl,
            points=pts,
            order_index=idx
        )
        db.add(q)

    # Practical Assignment for Course 3
    p3 = PracticalAssignment(
        id=str(uuid.uuid4()),
        course_id=c3.id,
        title="Comprehensive Career Comeback Dossier & Pitch",
        instructions_markdown="""### Practical Assignment: Career Comeback Dossier

**Objective**: Synthesize your professional history, career hiatus, and future aspirations into an actionable, executive-ready Comeback Dossier.

#### Required Components:
1. **The 60-Second Comeback Elevator Pitch**:
   - Write out your scripted 3-part comeback narrative (Anchor, Pivot, Launch).
2. **Skills-First Resume Summary**:
   - Present your Core Competency Matrix grouping technical proficiencies and leadership capabilities.
3. **Written Responses to 3 Top Returnship Interview Inquiries**:
   - Q1: *"Tell me about your career break and what led you to return now?"*
   - Q2: *"How do you plan to handle modern toolchains and fast-paced agile sprints?"*
   - Q3: *"Describe a scenario where you demonstrated crisis management or resilience under pressure."*
4. **Target Returnship Criteria**:
   - Identify your non-negotiable workplace requirements (stipend floor, work mode, daily hour limits).

#### How to Submit:
Create your dossier in Google Docs or Word. Share the viewable URL or paste your comprehensive text in the submission portal below.""",
        rubric=[
            {"criterion": "Narrative Ownership & Authentic Framing", "weight_percentage": 30, "description": "Compelling, non-apologetic pitch articulating value and intentional pause."},
            {"criterion": "Competency Matrix & Skill Relevance", "weight_percentage": 30, "description": "Strategic alignment of pre-break mastery and recent upskilling to modern roles."},
            {"criterion": "Interview Response Depth (SAR Method)", "weight_percentage": 20, "description": "Structured, evidence-based answers to common returnship queries."},
            {"criterion": "Boundary & Compensation Clarity", "weight_percentage": 20, "description": "Clear professional boundaries and fair stipend expectations."}
        ],
        submission_type="text_and_link",
        is_mandatory_for_certificate=True
    )
    db.add(p3)
    db.flush()

    db.commit()
    print("All 3 GFG Learning Hub courses, modules, lessons, quizzes, and practical assignments seeded successfully!")


if __name__ == "__main__":
    from backend.app.database.database import SessionLocal
    db = SessionLocal()
    seed_learning_hub_data(db)
    db.close()
