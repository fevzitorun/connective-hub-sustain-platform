from sqlalchemy import String, Boolean, Integer, Numeric, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime
from ..database import Base

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    tax_id: Mapped[str | None] = mapped_column(String(11), unique=True)
    sector: Mapped[str | None] = mapped_column(String(100))
    sasb_volume: Mapped[str | None] = mapped_column(String(50))
    employee_count: Mapped[int | None] = mapped_column(Integer)
    annual_revenue_tl: Mapped[float | None] = mapped_column(Numeric(20, 2))
    address: Mapped[str | None] = mapped_column(Text)
    lat: Mapped[float | None] = mapped_column(Numeric(10, 8))
    lng: Mapped[float | None] = mapped_column(Numeric(11, 8))
    plan_type: Mapped[str] = mapped_column(String(20), default="free")
    is_regulated: Mapped[bool] = mapped_column(Boolean, default=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_exporter: Mapped[bool] = mapped_column(Boolean, default=False)
    net_zero_target_year: Mapped[int | None] = mapped_column(Integer)
    brand_color: Mapped[str | None] = mapped_column(String(7))
    logo_url: Mapped[str | None] = mapped_column(Text)
    # White-Label: kapsamlı tema ayarları (primary_color, secondary_color, font, favicon_url vb.)
    theme_settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Stripe abonelik alanları
    stripe_customer_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    users: Mapped[list["User"]] = relationship("User", back_populates="company")  # type: ignore
    emission_records: Mapped[list["EmissionRecord"]] = relationship("EmissionRecord", back_populates="company")  # type: ignore
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="company")  # type: ignore
