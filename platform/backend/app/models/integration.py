"""
Entegrasyon Bağlantı Modeli
ANTIGRAVITY-PROMPT.md satır 71, 331-332

- SAP, Logo, TEDAŞ, BDDK bağlantıları
- /integrations/ available, connect, /webhooks/emissions
"""
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from ..database import Base


class IntegrationConnection(Base):
    """
    integration_connections tablosu — ERP/veri kaynağı entegrasyonları

    Desteklenen entegrasyonlar:
    - SAP S/4HANA (emisyon verisi)
    - Logo Tiger/Netsis (muhasebe verisinden enerji)
    - TEDAŞ (elektrik tüketim API)
    - BDDK (GAR raporlama)
    - Webhook (genel veri alımı)
    """
    __tablename__ = "integration_connections"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)

    # Entegrasyon türü
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    # sap, logo, tedas, bddk, webhook, excel_auto, custom_api
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Bağlantı bilgileri (şifrelenmiş)
    config: Mapped[dict | None] = mapped_column(JSON)
    # {
    #   "api_url": "https://...",
    #   "api_key": "encrypted:...",
    #   "client_id": "...",
    #   "sync_interval_hours": 24,
    #   "data_mapping": {...}
    # }

    # Durum
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # pending, connected, syncing, error, disconnected

    # Son senkronizasyon
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_sync_status: Mapped[str | None] = mapped_column(String(20))  # success, partial, failed
    last_sync_records: Mapped[int | None] = mapped_column(Integer)
    last_error: Mapped[str | None] = mapped_column(Text)

    # Webhook bilgileri (webhook türü için)
    webhook_url: Mapped[str | None] = mapped_column(Text)
    webhook_secret: Mapped[str | None] = mapped_column(String(255))

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class IntegrationLog(Base):
    """
    Entegrasyon senkronizasyon logları
    """
    __tablename__ = "integration_logs"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    connection_id: Mapped[str] = mapped_column(ForeignKey("integration_connections.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # sync, webhook_received, test
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # success, failed
    records_processed: Mapped[int] = mapped_column(Integer, default=0)
    records_failed: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[dict | None] = mapped_column(JSON)
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
