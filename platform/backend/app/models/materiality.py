"""
CSRD Çifte Önemlilik Değerlendirmesi (Double Materiality Assessment)
ANTIGRAVITY-PROMPT.md satır 243-245, 283-284, 554-557

ESRS 10 konu:
  İklim Değişikliği, Kirlilik, Su ve Deniz Kaynakları, Biyoçeşitlilik,
  Döngüsel Ekonomi, İş Gücü, Değer Zinciri İşçileri, Topluluklar,
  Tüketiciler, İş Etiği
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class MaterialityAssessment(Base):
    """
    materiality_assessments tablosu — CSRD Çifte Önemlilik

    İçeriden Dışarıya (Impact Materiality): Şirketin iklime/çevreye etkisi
    Dışarıdan İçeriye (Financial Materiality): İklimin şirket finansallarına etkisi

    Referans format: Migros 2025 (ESRS uyumlu)
    """
    __tablename__ = "materiality_assessments"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    assessment_year: Mapped[int] = mapped_column(Integer, nullable=False)
    framework: Mapped[str] = mapped_column(String(20), default="csrd")  # csrd, gri, custom

    # ESRS 10 konu değerlendirmesi (her biri 1-5 puan)
    topics: Mapped[dict | None] = mapped_column(JSON)
    # Örnek yapı:
    # {
    #   "climate_change":       {"impact": 5, "financial": 4, "material": true},
    #   "pollution":            {"impact": 3, "financial": 2, "material": false},
    #   "water_marine":         {"impact": 4, "financial": 3, "material": true},
    #   "biodiversity":         {"impact": 3, "financial": 2, "material": false},
    #   "circular_economy":     {"impact": 4, "financial": 3, "material": true},
    #   "own_workforce":        {"impact": 4, "financial": 3, "material": true},
    #   "value_chain_workers":  {"impact": 3, "financial": 2, "material": false},
    #   "communities":          {"impact": 3, "financial": 2, "material": false},
    #   "consumers":            {"impact": 3, "financial": 3, "material": true},
    #   "business_conduct":     {"impact": 4, "financial": 4, "material": true},
    # }

    # İçeriden dışarıya (Impact) toplam skor
    impact_score: Mapped[float | None] = mapped_column(Float)
    # Dışarıdan içeriye (Financial) toplam skor
    financial_score: Mapped[float | None] = mapped_column(Float)

    # Paydaş katılımı bilgisi
    stakeholder_count: Mapped[int | None] = mapped_column(Integer)
    stakeholder_groups: Mapped[dict | None] = mapped_column(JSON)
    # ["yatırımcılar", "çalışanlar", "müşteriler", "tedarikçiler", "sivil toplum", "düzenleyiciler"]

    # Değerlendirme sonucu
    material_topics: Mapped[list | None] = mapped_column(JSON)  # Önemli bulunan konular
    methodology_notes: Mapped[str | None] = mapped_column(Text)

    # Durum
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, completed, approved

    # Onay bilgisi
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
