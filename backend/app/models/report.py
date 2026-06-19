from sqlalchemy import Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import datetime, timezone
from ..database import Base

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    emission_data_id: Mapped[str | None] = mapped_column(ForeignKey("emission_data.id"))
    language: Mapped[str] = mapped_column(String(5), default="tr")
    standard: Mapped[str] = mapped_column(String(20), default="tsrs")
    status: Mapped[str] = mapped_column(String(20), default="draft")

    content_json: Mapped[dict | None] = mapped_column(JSONB)
    content_text: Mapped[str | None] = mapped_column(Text)
    compliance_score: Mapped[int | None] = mapped_column(Integer)
    compliance_grade: Mapped[str | None] = mapped_column(String(2))
    compliance_detail: Mapped[dict | None] = mapped_column(JSONB)

    pdf_url: Mapped[str | None] = mapped_column(Text)
    word_url: Mapped[str | None] = mapped_column(Text)

    ai_model: Mapped[str | None] = mapped_column(String(50))
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    assurance_firm: Mapped[str | None] = mapped_column(String(50))

    version_number: Mapped[int] = mapped_column(Integer, default=1)
    version_of: Mapped[str | None] = mapped_column(ForeignKey("reports.id", ondelete="SET NULL"), nullable=True)

    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    company: Mapped["Company"] = relationship("Company", back_populates="reports")  # type: ignore
    emission_record: Mapped["EmissionRecord | None"] = relationship("EmissionRecord", back_populates="reports")  # type: ignore
