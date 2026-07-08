from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    emission_id = Column(UUID(as_uuid=False), ForeignKey("emission_data.id"), nullable=False)
    auditor_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    
    status = Column(String, default="pending") # pending, in_progress, verified, rejected
    findings = Column(String, nullable=True) # JSON array of findings
    assurance_level = Column(String, default="limited") # limited, reasonable
    materiality_threshold = Column(Float, default=5.0) # %
    
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships (if needed, but usually we just query them)
