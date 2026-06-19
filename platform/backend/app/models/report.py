from sqlalchemy import Integer, String, ForeignKey, DateTime, Text, JSON, Boolean
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

    # Status: draft | generating | completed | failed | pending | approved | rejected | published
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

    # Versiyonlama
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    version_of: Mapped[str | None] = mapped_column(ForeignKey("reports.id"), nullable=True)

    # Onay süreci
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    company: Mapped["Company"] = relationship("Company", back_populates="reports")  # type: ignore
    emission_record: Mapped["EmissionRecord | None"] = relationship("EmissionRecord", back_populates="reports")  # type: ignore
    versions: Mapped[list["Report"]] = relationship("Report", foreign_keys=[version_of], back_populates="parent_report")
    parent_report: Mapped["Report | None"] = relationship("Report", foreign_keys=[version_of], back_populates="versions", remote_side=[id])
    share_links: Mapped[list["ShareLink"]] = relationship("ShareLink", back_populates="report")  # type: ignore


class ReportDraft(Base):
    __tablename__ = "report_drafts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    # Hangi emission kaydı için
    emission_data_id: Mapped[str | None] = mapped_column(ForeignKey("emission_data.id"))
    # Tamamlanmış rapora link (oluşturulduktan sonra)
    report_id: Mapped[str | None] = mapped_column(ForeignKey("reports.id"))
    # Kullanıcının taslak içeriği (form state)
    content: Mapped[dict | None] = mapped_column(JSONB)
    notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ShareLink(Base):
    __tablename__ = "share_links"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"), nullable=False)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    max_views: Mapped[int | None] = mapped_column(Integer)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    report: Mapped["Report"] = relationship("Report", back_populates="share_links")
