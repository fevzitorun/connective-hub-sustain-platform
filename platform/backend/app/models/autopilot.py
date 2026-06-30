from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class AutopilotRule(Base):
    __tablename__ = "autopilot_rules"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    rule_type: Mapped[str] = mapped_column(String(40), nullable=False)   # report | reminder | digest
    standard: Mapped[str] = mapped_column(String(40), nullable=False)    # tsrs | iso14064 | cbam | sfdr | all
    frequency: Mapped[str] = mapped_column(String(20), nullable=False)   # weekly | monthly | quarterly | annual
    day_of_month: Mapped[int | None] = mapped_column(Integer)            # 1-28 for monthly
    notify_days_before: Mapped[int | None] = mapped_column(Integer)      # deadline reminder days
    notify_email: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    run_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AutopilotRun(Base):
    __tablename__ = "autopilot_runs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id: Mapped[str] = mapped_column(ForeignKey("autopilot_rules.id"), nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(20), default="pending")   # pending | running | success | failed
    triggered_by: Mapped[str] = mapped_column(String(20), default="schedule")  # schedule | manual
    report_id: Mapped[str | None] = mapped_column(String(36))
    output_summary: Mapped[str | None] = mapped_column(Text)
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
