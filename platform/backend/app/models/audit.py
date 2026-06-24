"""AuditLog modeli — TSRS 1 Madde 9 denetim izi."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    company_id: Mapped[str | None] = mapped_column(String, nullable=True)
    user_email: Mapped[str | None] = mapped_column(String, nullable=True)
    user_role: Mapped[str] = mapped_column(String, default="system")
    action: Mapped[str] = mapped_column(String)           # ör. "Güncelleme", "Silme"
    table_name: Mapped[str | None] = mapped_column(String, nullable=True)
    old_value: Mapped[str | None] = mapped_column(String, nullable=True)
    new_value: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_type: Mapped[str] = mapped_column(String)      # ör. "report", "emission", "user"
    entity_id: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_desc: Mapped[str] = mapped_column(String)      # insan okunabilir açıklama
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="ok")  # ok | warn | error
    extra: Mapped[dict] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
