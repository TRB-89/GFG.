from typing import Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: str
    owner_user_id: str
    verified: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
