import sqlite3
import os

def run_migration():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "gfg_local.db")
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    def add_col_if_missing(table, col, col_type):
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [row[1] for row in cursor.fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
            conn.commit()
        else:
            print(f"{table}.{col} already exists")

    add_col_if_missing("candidate_profiles", "field_of_study", "TEXT")
    add_col_if_missing("candidate_profiles", "previous_profession", "TEXT")
    add_col_if_missing("candidate_profiles", "target_role", "TEXT")
    add_col_if_missing("candidate_profiles", "career_switch_willingness", "TEXT DEFAULT 'same_domain'")
    add_col_if_missing("candidate_profiles", "support_preferences", "JSON")

    add_col_if_missing("candidate_projects", "year_completed", "INTEGER")
    add_col_if_missing("candidate_projects", "skills_demonstrated", "JSON")

    # Create career_comeback_assessments table if missing
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_comeback_assessments (
        id VARCHAR(36) PRIMARY KEY,
        candidate_id VARCHAR(36) NOT NULL,
        target_role VARCHAR(255),
        assessment_payload JSON,
        readiness_percentage INTEGER DEFAULT 80,
        confidence_score FLOAT DEFAULT 0.85,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    run_migration()
