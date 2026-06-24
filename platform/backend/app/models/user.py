from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # Roles: admin | editor | viewer | auditor | data_entry | advisor
    role: Mapped[str] = mapped_column(String(30), default="editor")
    company_id: Mapped[str | None] = mapped_column(ForeignKey("companies.id"))
    managed_company_ids: Mapped[str | None] = mapped_column(String(2000), nullable=True) # Comma-separated or JSON string for multiple clients
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company: Mapped["Company"] = relationship("Company", back_populates="users")  # type: ignore
