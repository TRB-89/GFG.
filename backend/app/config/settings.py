import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GFG Career Continuity Platform"
    PROJECT_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    
    # Supabase credentials (optional for offline local mode, required for Supabase cloud)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Database connection
    DATABASE_URL: str = "sqlite:///./gfg_local.db"
    
    # Security
    JWT_SECRET: str = "gfg_development_jwt_secret_key_super_secure_99"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000,http://localhost:3001"
    
    # AI (for Gemini or OpenAI)
    AI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # YouTube Data API v3
    YOUTUBE_API_KEY: str = ""

    # Resend Transactional Email
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "GFG Academy <onboarding@resend.dev>"
    
    @property
    def cors_origins(self) -> List[str]:
        return [url.strip() for url in self.FRONTEND_URL.split(",") if url.strip()]
        
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
