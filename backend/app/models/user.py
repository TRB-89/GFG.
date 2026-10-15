from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    auth_user_id = Column(String(36), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True) # for local auth fallback
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    profile_photo_url = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="candidate") # 'candidate', 'employer', 'admin'
    approval_status = Column(String(50), default="active") # 'active', 'pending_approval', 'rejected'
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    companies = relationship("Company", back_populates="owner", cascade="all, delete-orphan")
