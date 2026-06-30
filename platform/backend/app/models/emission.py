from sqlalchemy import Integer, Numeric, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from ..database import Base

class EmissionRecord(Base):
    __tablename__ = "emission_data"
    __table_args__ = (UniqueConstraint("company_id", "year"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    reporting_boundary: Mapped[str] = mapped_column(String(30), default="operational_control")
    calculation_standard: Mapped[str] = mapped_column(String(30), default="ghg_protocol")

    # Kapsam 1
    natural_gas_m3: Mapped[float | None] = mapped_column(Numeric(15, 2))
    diesel_liters: Mapped[float | None] = mapped_column(Numeric(15, 2))
    lpg_kg: Mapped[float | None] = mapped_column(Numeric(15, 2))
    coal_tons: Mapped[float | None] = mapped_column(Numeric(15, 2))
    company_vehicles_km: Mapped[float | None] = mapped_column(Numeric(15, 2))
    fugitive_emissions_kg: Mapped[float | None] = mapped_column(Numeric(15, 2))
    scope1_co2e: Mapped[float | None] = mapped_column(Numeric(15, 3))

    # Kapsam 2
    electricity_kwh: Mapped[float | None] = mapped_column(Numeric(18, 2))
    electricity_source: Mapped[str] = mapped_column(String(30), default="grid")
    steam_gj: Mapped[float | None] = mapped_column(Numeric(15, 2))
    scope2_location_co2e: Mapped[float | None] = mapped_column(Numeric(15, 3))
    scope2_market_co2e: Mapped[float | None] = mapped_column(Numeric(15, 3))

    # Kapsam 3
    business_travel_flight_km: Mapped[float | None] = mapped_column(Numeric(15, 2))
    employee_commute_km: Mapped[float | None] = mapped_column(Numeric(15, 2))
    purchased_goods_spend_tl: Mapped[float | None] = mapped_column(Numeric(18, 2))
    waste_tons: Mapped[float | None] = mapped_column(Numeric(15, 3))
    water_m3: Mapped[float | None] = mapped_column(Numeric(15, 2))
    scope3_co2e: Mapped[float | None] = mapped_column(Numeric(15, 3))
    scope3_breakdown: Mapped[dict | None] = mapped_column(JSONB)
    
    # Sektörel Aktivite Metrikleri
    activity_metric: Mapped[dict | None] = mapped_column(JSONB)

    # Bankacılık
    loan_portfolio_tl: Mapped[float | None] = mapped_column(Numeric(20, 2))
    green_finance_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4))
    financed_emissions_co2e: Mapped[float | None] = mapped_column(Numeric(15, 3))

    # Çimento
    clinker_tons: Mapped[float | None] = mapped_column(Numeric(15, 2))
    cement_production_tons: Mapped[float | None] = mapped_column(Numeric(15, 2))
    alternative_fuel_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4))

    # Enerji
    electricity_generated_mwh: Mapped[float | None] = mapped_column(Numeric(15, 2))
    renewable_ratio: Mapped[float | None] = mapped_column(Numeric(5, 4))

    # Fiziksel risk (uydu)
    earthquake_zone: Mapped[str | None] = mapped_column(String(50))
    flood_risk: Mapped[str | None] = mapped_column(String(20))
    drought_risk: Mapped[str | None] = mapped_column(String(20))
    ndvi_score: Mapped[float | None] = mapped_column(Numeric(6, 4))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company: Mapped["Company"] = relationship("Company", back_populates="emission_records")  # type: ignore
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="emission_record")  # type: ignore
