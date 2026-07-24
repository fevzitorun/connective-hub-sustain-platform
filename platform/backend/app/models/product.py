"""
Ürün modeli — DPP (Dijital Ürün Pasaportu) modülünün kök varlığı.
AB ESPR (Tüzük 2024/1781) uyumlu ürün kaydı.
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Date, Float, Boolean, JSON, Text
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

# AB enerji sınıflandırması (A–G, 2021 sonrası tek ölçek)
ENERGY_CLASSES = ("A", "B", "C", "D", "E", "F", "G")


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
    name_de: Mapped[Optional[str]] = mapped_column(String(255))
    name_fr: Mapped[Optional[str]] = mapped_column(String(255))

    description_tr: Mapped[Optional[str]] = mapped_column(Text)
    description_en: Mapped[Optional[str]] = mapped_column(Text)

    category: Mapped[str] = mapped_column(String(30), nullable=False)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100))

    # Fiziksel + ticari
    batch_number: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(100))
    weight_kg: Mapped[Optional[float]] = mapped_column(Float)
    dimensions: Mapped[Optional[dict]] = mapped_column(JSON)  # {"length_cm":…,"width_cm":…,"height_cm":…}

    # Uygunluk + ürün özellikleri
    ce_marked: Mapped[bool] = mapped_column(Boolean, default=False)
    energy_class: Mapped[Optional[str]] = mapped_column(String(1))  # A–G
    warranty_months: Mapped[Optional[int]] = mapped_column(Integer)

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
