"""
EU Taksonomi değerlendirme kalıcılığı.

`app/models/taxonomy_engine.py::calculate_full_taxonomy()` sonucunu
(TaxonomyResult şeması) kalıcı hale getirir — MaterialityAssessment/
CreditScore ile aynı desen (company_id + yıl bazlı, upsert).
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Float, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class TaxonomyAssessment(Base):
    __tablename__ = "taxonomy_assessments"
    __table_args__ = (UniqueConstraint("company_id", "assessment_year"),)

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    assessment_year: Mapped[int] = mapped_column(Integer, nullable=False)
    nace_code: Mapped[str] = mapped_column(String(20), nullable=False)

    eligibility_percent: Mapped[float] = mapped_column(Float, default=0.0)
    alignment_percent: Mapped[float] = mapped_column(Float, default=0.0)
    objectives: Mapped[dict | None] = mapped_column(JSON)
    turnover_percent: Mapped[float] = mapped_column(Float, default=0.0)
    capex_percent: Mapped[float] = mapped_column(Float, default=0.0)
    opex_percent: Mapped[float] = mapped_column(Float, default=0.0)
    recommendations: Mapped[list | None] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(30), default="non_compliant")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
