"""
Banka Kredi Puanlama Modeli (ESG Credit Scoring)
ANTIGRAVITY-PROMPT.md satır 190-207

- GET /credit-score/{company_id}
- 0-100 puan, Düşük/Orta/Yüksek risk kategorisi
- emission_intensity, tsrs_compliance, sector_risk, geographic_risk, governance_score
- Sadece admin/auditor/bank rolü erişebilir — BDDK GAR modülüyle entegre
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class CreditScore(Base):
    """
    credit_scores tablosu — ESG bazlı kredi puanlama

    BDDK GAR modülüyle entegre — banka müşterilerinin ESG risk seviyesini belirler.
    Sadece admin, auditor ve bank rollerinin erişimine açık.
    """
    __tablename__ = "credit_scores"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    assessment_year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Toplam skor (0-100)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    # Düşük (70-100), Orta (40-69), Yüksek (0-39)
    risk_category: Mapped[str] = mapped_column(String(20), nullable=False)

    # Alt faktör puanları (her biri 0-100)
    factors: Mapped[dict | None] = mapped_column(JSON)
    # {
    #   "emission_intensity": 85,
    #   "tsrs_compliance": 78,
    #   "sector_risk": 65,
    #   "geographic_risk": 70,
    #   "governance_score": 80
    # }

    # Trend (önceki döneme göre)
    trend: Mapped[str | None] = mapped_column(String(20))  # improving, stable, declining
    previous_score: Mapped[int | None] = mapped_column(Integer)
    score_change: Mapped[int | None] = mapped_column(Integer)  # +/- değişim

    # GAR entegrasyonu
    gar_eligible: Mapped[str | None] = mapped_column(String(20))  # green, transition, neutral, harmful
    gar_contribution: Mapped[float | None] = mapped_column(Float)  # GAR oranına katkı

    # Detay ve notlar
    methodology_version: Mapped[str] = mapped_column(String(10), default="1.0")
    notes: Mapped[str | None] = mapped_column(String(500))

    # Kim hesapladı
    calculated_by: Mapped[str | None] = mapped_column(String(20), default="system")  # system, manual

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
