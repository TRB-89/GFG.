from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now

class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    logo_url = Column(Text, nullable=True)
    industry = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    company_size = Column(String(50), nullable=True)
    authorized_representative = Column(String(255), nullable=True)
    business_contact_email = Column(String(255), nullable=True)
    business_contact_phone = Column(String(50), nullable=True)
    verification_status = Column(String(50), default="pending_review") # pending_review, under_audit, verified, rejected
    hiring_charter_accepted = Column(Boolean, default=False)
    verified = Column(Boolean, default=False) # Employer registration must not automatically grant verified status
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    owner = relationship("Profile", back_populates="companies")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
