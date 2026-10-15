import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.config.settings import settings
from backend.app.models.base import Base
# Import all models so metadata knows all tables
import backend.app.models

# Handle SQLite vs PostgreSQL URL compatibility
db_url = settings.DATABASE_URL
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables defined in models if they do not exist, and migrate missing columns."""
    Base.metadata.create_all(bind=engine)

    # Safe lightweight SQLite migration for local development
    if db_url.startswith("sqlite"):
        with engine.connect() as conn:
            # Check and add profiles.approval_status
            try:
                conn.execute(Base.metadata.tables["profiles"].select().limit(1))
            except Exception:
                pass

            migrations = [
                ("profiles", "approval_status", "VARCHAR(50) DEFAULT 'active'"),
                ("candidate_profiles", "industry", "VARCHAR(255)"),
                ("candidate_profiles", "career_goals", "VARCHAR(255)"),
                ("candidate_profiles", "languages", "VARCHAR(255)"),
                ("candidate_profiles", "salary_expectation", "VARCHAR(100)"),
                ("candidate_profiles", "onboarding_completed", "BOOLEAN DEFAULT 0"),
                ("candidate_skills", "provenance", "VARCHAR(50) DEFAULT 'self_reported'"),
                ("candidate_skills", "confidence_score", "FLOAT DEFAULT 1.0"),
                ("candidate_skills", "source_detail", "VARCHAR(100) DEFAULT 'User Profile'"),
                ("learning_roadmaps", "status", "VARCHAR(50) DEFAULT 'active'"),
                ("learning_roadmaps", "updated_at", "DATETIME"),
                ("career_passports", "visibility_settings", "JSON"),
                ("career_passports", "sharing_token", "VARCHAR(64)"),
                ("career_passports", "sharing_expires_at", "DATETIME"),
                ("career_passports", "is_public_share_enabled", "BOOLEAN DEFAULT 0"),
                ("career_passports", "updated_at", "DATETIME"),
                ("jobs", "sector", "VARCHAR(100) DEFAULT 'software_it'"),
                ("jobs", "opportunity_type", "VARCHAR(50) DEFAULT 'returnship'"),
                ("jobs", "employer_verification_status", "VARCHAR(50) DEFAULT 'verified'"),
                ("jobs", "is_verified_employer", "BOOLEAN DEFAULT 1"),
                ("jobs", "data_source", "VARCHAR(50) DEFAULT 'verified_partner'"),
                ("jobs", "last_verified_at", "DATETIME"),
                ("jobs", "external_application_url", "VARCHAR(500)"),
                ("jobs", "learning_objectives", "TEXT"),
                ("jobs", "mentorship_available", "BOOLEAN DEFAULT 1"),
                ("jobs", "stipend_or_salary_type", "VARCHAR(50) DEFAULT 'paid'"),
                ("jobs", "stipend_amount_description", "VARCHAR(255)"),
                ("jobs", "eligibility_criteria", "TEXT"),
                ("jobs", "conversion_rate_percentage", "INTEGER"),
                ("jobs", "is_reported", "BOOLEAN DEFAULT 0"),
                ("jobs", "report_count", "INTEGER DEFAULT 0"),
                ("companies", "authorized_representative", "VARCHAR(255)"),
                ("companies", "business_contact_email", "VARCHAR(255)"),
                ("companies", "business_contact_phone", "VARCHAR(50)"),
                ("companies", "verification_status", "VARCHAR(50) DEFAULT 'pending_review'"),
                ("companies", "hiring_charter_accepted", "BOOLEAN DEFAULT 0"),
            ]
            for table, col, col_type in migrations:
                try:
                    conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
                    conn.commit()
                except Exception:
                    # Column already exists, safe to ignore
                    pass

            # Backfill sector values on existing jobs
            try:
                conn.exec_driver_sql("UPDATE jobs SET sector = 'data_analytics' WHERE (sector IS NULL OR sector = 'software_it') AND (LOWER(title) LIKE '%data%' OR LOWER(title) LIKE '%analyst%' OR LOWER(title) LIKE '%analytics%' OR LOWER(title) LIKE '%learning%')")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'marketing' WHERE LOWER(title) LIKE '%marketing%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'human_resources' WHERE LOWER(title) LIKE '%hr%' OR LOWER(title) LIKE '%people%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'administration' WHERE LOWER(title) LIKE '%project%' OR LOWER(title) LIKE '%coordinator%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'retail_support' WHERE LOWER(title) LIKE '%customer%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'banking_finance' WHERE LOWER(title) LIKE '%risk%' OR LOWER(title) LIKE '%merchant%' OR LOWER(title) LIKE '%finance%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'teaching_education' WHERE LOWER(title) LIKE '%edtech%' OR LOWER(title) LIKE '%curriculum%' OR LOWER(title) LIKE '%instruction%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'healthcare' WHERE LOWER(title) LIKE '%health%' OR LOWER(title) LIKE '%patient%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'gov_exams' WHERE LOWER(title) LIKE '%policy%' OR LOWER(title) LIKE '%governance%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'freelance_consulting' WHERE LOWER(title) LIKE '%consultant%' OR LOWER(title) LIKE '%consulting%'")
                conn.exec_driver_sql("UPDATE jobs SET sector = 'entrepreneurship' WHERE LOWER(title) LIKE '%startup%' OR LOWER(title) LIKE '%bootcamp%' OR LOWER(title) LIKE '%founder%'")
                conn.exec_driver_sql("UPDATE jobs SET is_verified_employer = 1 WHERE is_verified_employer IS NULL")
                conn.exec_driver_sql("UPDATE jobs SET employer_verification_status = 'verified' WHERE employer_verification_status IS NULL")
                conn.commit()
            except Exception:
                pass

# Ensure tables and migrations are initialized on import
try:
    init_db()
except Exception:
    pass
