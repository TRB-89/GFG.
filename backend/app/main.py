import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.app.config.settings import settings
from backend.app.database.database import init_db
from backend.database.seed_data import seed_database
from backend.app.schemas.common import error_response

# Configure Structured Logging per Section 31
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("GFG_API")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing GFG Database tables...")
    init_db()
    logger.info("Verifying seed data...")
    seed_database()
    logger.info("GFG API ready.")
    yield

app = FastAPI(
    title="GFG Career Continuity & Return-to-Work Platform API",
    description="""
    Production-grade backend infrastructure and REST APIs for GFG.
    Designed for career-continuity and return-to-work pathways for women professionals.
    
    Features:
    - Candidate onboarding, career break tracking, skills and portfolio management
    - Career Continuity Passport generation
    - Employer company and returnship opportunity publishing
    - Duplicate application prevention & application tracking flow
    - Rule-based Compatibility Scoring engine (Module 2 V1)
    - Full Swagger/OpenAPI documentation
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration per Section 30
origins = settings.cors_origins
if not origins or "http://localhost:3000" not in origins:
    origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage folder for uploaded files
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

# Include all modular routers
from backend.app.routers import (
    auth,
    candidates,
    career_breaks,
    skills,
    interests,
    companies,
    jobs,
    applications,
    dashboard,
    recommendations,
    uploads,
    admin,
    ai,
)

app.include_router(auth.router)
app.include_router(candidates.router)
app.include_router(career_breaks.router)
app.include_router(skills.router)
app.include_router(interests.router)
app.include_router(companies.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)
app.include_router(uploads.router)
app.include_router(admin.router)
app.include_router(ai.router)

# Global Exception Handlers per Section 21 & 22
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)
    details = None
    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "ERROR")
        message = exc.detail.get("message", "An error occurred.")
        details = exc.detail.get("details", None)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(code, message, details)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            "VALIDATION_ERROR",
            "Submitted input parameters failed validation constraints.",
            details=[{"field": ".".join(str(l) for l in err["loc"]), "msg": err["msg"]} for err in errors]
        )
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            "INTERNAL_SERVER_ERROR",
            "An internal error occurred. Please contact platform administrators."
        )
    )

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "GFG Backend Platform",
        "version": "2.0.0",
        "database": "connected"
    }
