"""
Dijital Ürün Pasaportu (DPP) modelleri.

AB ESPR (Tüzük 2024/1781) dayanaklı. Bir ürünün versiyonlanmış pasaportu:
- draft → issued → (revoked | superseded)
Materyaller, olay geçmişi, uygunluk belgeleri ilişkili tablolarda.
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Date, Text, JSON, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone, date
from typing import Optional
import uuid

from ..database import Base


PASSPORT_STATUS = ("draft", "issued", "revoked", "superseded")

EVENT_TYPES = (
    "created", "updated", "issued", "transferred",
    "repaired", "recycled", "revoked", "material_added",
    "document_added", "return_requested", "return_redeemed",
    "score_computed", "ai_query",
)

DOCUMENT_TYPES = (
    "reach", "rohs", "oekotex", "gots", "ce",
    "energy_label", "epd", "iso14067_pcf", "other",
)


class ProductPassport(Base):
    """
    product_passports — Bir ürünün belirli anda yayınlanan pasaport versiyonu.

    - `data_json`: yayın anında snapshot alınan JSON-LD payload. Immutable.
    - `version`: aynı ürün için artan sürüm (1, 2, 3…).
    - Public URL: `/p/product/{id}` (auth yok, rate-limited).
    """
    __tablename__ = "product_passports"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)

    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", index=True)

    public_slug: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True)
    gs1_digital_link: Mapped[Optional[str]] = mapped_column(String(500))

    carbon_footprint_kgco2e: Mapped[Optional[float]] = mapped_column(Float)
    recycled_content_pct: Mapped[Optional[float]] = mapped_column(Float)
    repairability_score: Mapped[Optional[float]] = mapped_column(Float)

    # Yeşil Skor (Gemini önerisi) — 0-100, otomatik hesaplanır, breakdown JSON'da
    green_score: Mapped[Optional[float]] = mapped_column(Float)
    green_score_breakdown: Mapped[Optional[dict]] = mapped_column(JSON)
    recycling_instructions: Mapped[Optional[str]] = mapped_column(Text)

    data_json: Mapped[Optional[dict]] = mapped_column(JSON)
    signature: Mapped[Optional[str]] = mapped_column(Text)

    issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    revoke_reason: Mapped[Optional[str]] = mapped_column(Text)

    created_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    product = relationship("Product", back_populates="passports", lazy="selectin")
    materials = relationship(
        "PassportMaterial", back_populates="passport",
        cascade="all, delete-orphan", lazy="selectin",
    )
    documents = relationship(
        "PassportDocument", back_populates="passport",
        cascade="all, delete-orphan", lazy="selectin",
    )
    events = relationship(
        "PassportEvent", back_populates="passport",
        cascade="all, delete-orphan", lazy="selectin",
        order_by="PassportEvent.timestamp.desc()",
    )


class PassportMaterial(Base):
    """passport_materials — Malzeme bileşimi (BOM)."""
    __tablename__ = "passport_materials"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    passport_id: Mapped[str] = mapped_column(ForeignKey("product_passports.id"), nullable=False, index=True)

    material_name: Mapped[str] = mapped_column(String(255), nullable=False)
    percentage_by_weight: Mapped[Optional[float]] = mapped_column(Float)
    source_country: Mapped[Optional[str]] = mapped_column(String(2))
    recycled_content_pct: Mapped[Optional[float]] = mapped_column(Float)
    is_hazardous: Mapped[bool] = mapped_column(Boolean, default=False)
    hazardous_details: Mapped[Optional[dict]] = mapped_column(JSON)

    passport = relationship("ProductPassport", back_populates="materials")


class PassportDocument(Base):
    """passport_documents — Uygunluk belgeleri (REACH, RoHS, OEKO-TEX vs.)."""
    __tablename__ = "passport_documents"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    passport_id: Mapped[str] = mapped_column(ForeignKey("product_passports.id"), nullable=False, index=True)

    doc_type: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    issued_by: Mapped[Optional[str]] = mapped_column(String(255))
    issued_at: Mapped[Optional[date]] = mapped_column(Date)
    valid_until: Mapped[Optional[date]] = mapped_column(Date)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
    )

    passport = relationship("ProductPassport", back_populates="documents")


class PassportEvent(Base):
    """passport_events — Yaşam döngüsü olay kaydı (izlenebilirlik)."""
    __tablename__ = "passport_events"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    passport_id: Mapped[str] = mapped_column(ForeignKey("product_passports.id"), nullable=False, index=True)

    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    actor: Mapped[Optional[str]] = mapped_column(String(255))
    event_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSON)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
    )

    passport = relationship("ProductPassport", back_populates="events")
