from typing import List, Optional

# Standard Skill Dictionary mapping raw/variant terms to canonical GFG skills
SKILL_SYNONYMS = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "java script": "JavaScript",
    "es6": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python3": "Python",
    "python 3": "Python",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "pg": "PostgreSQL",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "pbi": "Power BI",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Cloud",
    "google cloud": "Cloud",
    "azure": "Cloud",
    "ml": "Machine Learning",
    "machinelearning": "Machine Learning",
    "machine learning": "Machine Learning",
    "ai": "Machine Learning",
    "artificial intelligence": "Machine Learning",
    "ui/ux": "UI/UX",
    "ui ux": "UI/UX",
    "ux": "UI/UX",
    "ui": "UI/UX",
    "figma": "Figma",
    "sql": "SQL",
    "mysql": "SQL",
    "oracle sql": "SQL",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "pandas": "Pandas",
    "tableau": "Tableau",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "git": "Git & GitHub",
    "github": "Git & GitHub",
    "git & github": "Git & GitHub",
    "agile": "Agile / Scrum",
    "scrum": "Agile / Scrum",
}

def normalize_skill_name(raw_name: str) -> str:
    """Normalize a raw skill string into its canonical GFG title."""
    clean = raw_name.strip().lower()
    return SKILL_SYNONYMS.get(clean, raw_name.strip())

def normalize_skills_list(skills: List[str]) -> List[str]:
    """Normalize a list of skills and remove duplicate entries."""
    seen = set()
    result = []
    for s in skills:
        canonical = normalize_skill_name(s)
        if canonical.lower() not in seen:
            seen.add(canonical.lower())
            result.append(canonical)
    return result
