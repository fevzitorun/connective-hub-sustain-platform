"""
CBAM Beyanname Modeli (Sınırda Karbon Düzenleme Mekanizması)
ANTIGRAVITY-PROMPT.md satır 274-278

- 70.000+ Türk ihracatçı AB'ye çimento, demir, alüminyum, gübre, elektrik ihraç ediyor
- Yıllık CBAM beyannamesi zorunlu, sertifika satın alma
- "50 ton de minimis" muafiyet kontrolü
- Gömülü emisyon hesaplama
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class CBAMDeclaration(Base):
    """
    cbam_declarations tablosu — AB CBAM beyannameleri

    Ocak 2026 tam rejim — her ihracatçı yıllık beyanname vermeli.
    Ürün kategorileri: çimento, demir-çelik, alüminyum, gübre, elektrik, hidrojen
    """
    __tablename__ = "cbam_declarations"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    declaration_year: Mapped[int] = mapped_column(Integer, nullable=False)
    quarter: Mapped[int | None] = mapped_column(Integer)  # 1-4 (çeyreklik raporlar)

    # Ürün bilgileri
    product_category: Mapped[str] = mapped_column(String(50), nullable=False)
    # cement, iron_steel, aluminium, fertilizers, electricity, hydrogen
    product_cn_code: Mapped[str | None] = mapped_column(String(20))  # Combined Nomenclature kodu
    product_description: Mapped[str | None] = mapped_column(Text)

    # İhracat miktarları
    export_quantity_tonnes: Mapped[float] = mapped_column(Float, nullable=False)
    export_destination: Mapped[str] = mapped_column(String(5), default="EU")  # EU, UK

    # Gömülü emisyonlar (embedded emissions)
    direct_emissions_tco2e: Mapped[float | None] = mapped_column(Float)  # Doğrudan (Scope 1)
    indirect_emissions_tco2e: Mapped[float | None] = mapped_column(Float)  # Dolaylı (Scope 2)
    total_embedded_emissions: Mapped[float | None] = mapped_column(Float)  # Toplam gömülü

    # Emisyon yoğunluğu
    emission_intensity: Mapped[float | None] = mapped_column(Float)  # tCO2e/ton ürün

    # De minimis muafiyeti (50 ton)
    is_de_minimis: Mapped[bool] = mapped_column(Boolean, default=False)

    # Karbon fiyatlandırma
    carbon_price_paid_local: Mapped[float | None] = mapped_column(Float)  # Yerel karbon vergisi/ETS
    cbam_certificates_required: Mapped[int | None] = mapped_column(Integer)
    cbam_certificate_cost_eur: Mapped[float | None] = mapped_column(Float)

    # Hesaplama parametreleri
    calculation_method: Mapped[str] = mapped_column(String(20), default="actual")
    # actual, default_value, eu_reference
    emission_factor_source: Mapped[str | None] = mapped_column(String(100))
    calculation_details: Mapped[dict | None] = mapped_column(JSON)

    # Beyan durumu
    status: Mapped[str] = mapped_column(String(20), default="draft")
    # draft, submitted, accepted, rejected, amended

    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reference_number: Mapped[str | None] = mapped_column(String(50))  # AB beyan referans no

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class CBAMProduct(Base):
    """
    CBAM ürün kataloğu — varsayılan emisyon faktörleri ve CN kodları
    """
    __tablename__ = "cbam_products"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    cn_code: Mapped[str] = mapped_column(String(20), nullable=False)
    description_tr: Mapped[str] = mapped_column(String(255))
    description_en: Mapped[str] = mapped_column(String(255))

    # AB varsayılan emisyon faktörleri
    default_emission_factor: Mapped[float | None] = mapped_column(Float)  # tCO2e/ton
    eu_benchmark: Mapped[float | None] = mapped_column(Float)  # AB benchmark değeri

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
