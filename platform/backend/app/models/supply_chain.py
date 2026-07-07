"""
EUDR Tedarik Zinciri Modeli (EU Deforestation Regulation)
ANTIGRAVITY-PROMPT.md satır 286-289

- Kakao, kahve, soya, palmiye yağı, kauçuk, odun, sığır için tedarik zinciri kanıtı
- GPS koordinatları + ormansızlaşmadan arındırılmış beyan
- Risk değerlendirme + tedarikçi haritası
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class SupplyChainEntry(Base):
    """
    supply_chain tablosu — EUDR tedarik zinciri yönetimi

    AB Ormansızlaşma Düzenlemesi (Aralık 2026):
    Kakao, kahve, soya, palmiye yağı, kauçuk, odun, sığır ürünleri
    """
    __tablename__ = "supply_chain"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    supplier_id: Mapped[str | None] = mapped_column(ForeignKey("suppliers.id"), nullable=True)

    # Ürün bilgileri
    commodity: Mapped[str] = mapped_column(String(50), nullable=False)
    # cocoa, coffee, soy, palm_oil, rubber, wood, cattle
    product_name: Mapped[str | None] = mapped_column(String(255))
    hs_code: Mapped[str | None] = mapped_column(String(20))  # Harmonize Sistem kodu
    quantity_tonnes: Mapped[float | None] = mapped_column(Float)
    import_year: Mapped[int | None] = mapped_column(Integer)

    # Menşe bilgileri — GPS koordinatları zorunlu
    origin_country: Mapped[str] = mapped_column(String(5), nullable=False)  # ISO ülke kodu
    origin_region: Mapped[str | None] = mapped_column(String(255))
    gps_latitude: Mapped[float | None] = mapped_column(Float)
    gps_longitude: Mapped[float | None] = mapped_column(Float)
    geo_polygon: Mapped[dict | None] = mapped_column(JSON)  # GeoJSON alan sınırları

    # Ormansızlaşma durumu
    deforestation_free: Mapped[bool | None] = mapped_column(Boolean)
    deforestation_cutoff_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # AB referans tarihi: 31 Aralık 2020

    # Risk değerlendirmesi
    risk_level: Mapped[str | None] = mapped_column(String(20))  # low, standard, high
    risk_score: Mapped[float | None] = mapped_column(Float)  # 0-100
    risk_factors: Mapped[dict | None] = mapped_column(JSON)
    # {
    #   "country_risk": "high",
    #   "commodity_risk": "medium",
    #   "satellite_verification": true,
    #   "certification": "FSC",
    #   "last_audit_date": "2025-06-15"
    # }

    # Sertifikalar ve kanıtlar
    certifications: Mapped[list | None] = mapped_column(JSON)
    # ["FSC", "RSPO", "Rainforest Alliance", "UTZ"]
    due_diligence_docs: Mapped[dict | None] = mapped_column(JSON)
    # Yüklenen belge URL'leri

    # Beyan durumu
    status: Mapped[str] = mapped_column(String(20), default="draft")
    # draft, verified, submitted, non_compliant
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    # EUDR beyan referansı
    eudr_reference_number: Mapped[str | None] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class SupplyChainAlert(Base):
    """
    Tedarik zinciri uyarıları — ormansızlaşma, uyumsuzluk, sertifika süresi dolması
    """
    __tablename__ = "supply_chain_alerts"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    supply_chain_id: Mapped[str] = mapped_column(ForeignKey("supply_chain.id"), nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # deforestation_detected, certification_expired, high_risk_origin, missing_gps
    severity: Mapped[str] = mapped_column(String(20), default="warning")  # info, warning, critical
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
