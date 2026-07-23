"""
Ürün modeli — DPP (Dijital Ürün Pasaportu) modülünün kök varlığı.
AB ESPR (Tüzük 2024/1781) uyumlu ürün kaydı.
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone, date
from typing import Optional
import uuid

from ..database import Base


PRODUCT_CATEGORIES = (
    "textile", "battery", "electronics", "furniture",
    "iron_steel", "tyre", "detergent", "paint",
    "construction", "chemical", "other",
)


class Product(Base):
    """
    products — DPP kapsamındaki ürün ana kaydı.
    Bir ürünün birden çok pasaport versiyonu olabilir (product_passports).
    """
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)

    sku: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    gtin: Mapped[Optional[str]] = mapped_column(String(14), index=True)

    name_tr: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[Optional[str]] = mapped_column(String(255))

    category: Mapped[str] = mapped_column(String(30), nullable=False)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100))

    manufacturing_site: Mapped[Optional[str]] = mapped_column(String(255))
    manufacturing_country: Mapped[Optional[str]] = mapped_column(String(2))
    manufactured_at: Mapped[Optional[date]] = mapped_column(Date)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    passports = relationship(
        "ProductPassport", back_populates="product",
        cascade="all, delete-orphan", lazy="selectin",
    )
