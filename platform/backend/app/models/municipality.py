"""
Belediye (Municipality) Sürdürülebilirlik Modülü — SQLAlchemy modelleri

Referans metodoloji: platform/backend/app/data/municipality_library.md
  - GPC (Global Protocol for Community-Scale GHG Inventories) — kent ölçeği envanter
  - Akan & Şendurur (2016) 0-4 puanlama → 3 boyut (Ekonomik/Sosyal/Çevresel)

Kaynak belgeler: Kocaeli İklim Eylem Planı, İzmir B.B. Sürdürülebilirlik Raporu
2024, Karşıyaka Durum Analizi 2022 (belediye/ klasörü, gitignore'da).

NOT: Bunlar yalnızca SQLAlchemy modelleridir. API router'ı app/routes/municipality.py'de.
"""
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class Municipality(Base):
    """
    municipalities tablosu — belediye profili + GPC sera gazı envanteri.

    reporting_level:
      - basic:      Sabit Enerji + Ulaşım + Atık (zorunlu minimum)
      - basic_plus: BASIC + IPPU + AFOLU
    type: büyükşehir | il | ilçe
    """
    __tablename__ = "municipalities"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default="ilçe")  # büyükşehir, il, ilçe
    population: Mapped[int | None] = mapped_column(Integer)
    region: Mapped[str | None] = mapped_column(String(100))  # ör. "Marmara", "Kocaeli"
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    reporting_level: Mapped[str] = mapped_column(String(20), default="basic")  # basic, basic_plus

    # ── GPC envanteri (ton CO₂e) — Kocaeli planı sektör formatı ──────────────
    stationary_energy_tco2e: Mapped[float | None] = mapped_column(Float)   # Sabit Enerji
    transportation_tco2e: Mapped[float | None] = mapped_column(Float)      # Ulaşım
    waste_tco2e: Mapped[float | None] = mapped_column(Float)               # Atık
    ippu_tco2e: Mapped[float | None] = mapped_column(Float)                # BASIC+ (opsiyonel)
    afolu_tco2e: Mapped[float | None] = mapped_column(Float)               # BASIC+ (opsiyonel)

    # Ek il/ilçe veri kalemleri (sıfır atık, atıksu, yeşil alan, su tüketimi, vb.)
    city_data: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class MunicipalityIndexScore(Base):
    """
    municipality_index_scores tablosu — Belediye Sürdürülebilirlik Endeksi skoru.

    Boyut skorları 0-4 ölçeğinde (municipality_library.md Bölüm 2), toplam skor
    3 boyutun ortalaması. grade A-D — kobi_credit_score_engine.py deseniyle
    tutarlı harf notlandırması.
    """
    __tablename__ = "municipality_index_scores"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    municipality_id: Mapped[str] = mapped_column(
        ForeignKey("municipalities.id"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # 0-4 ölçek — boyut ortalamaları
    economic_score: Mapped[float | None] = mapped_column(Float)
    social_score: Mapped[float | None] = mapped_column(Float)
    environmental_score: Mapped[float | None] = mapped_column(Float)
    total_score: Mapped[float | None] = mapped_column(Float)

    grade: Mapped[str | None] = mapped_column(String(3))  # A, B, C, D

    # Kriter kırılımı + öncelikli boşluklar (JSON)
    criteria_breakdown: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
