"""EU Taksonomi hesaplama şemaları (Pydantic).

Ayrı dosyada tutulur: hem taxonomy_engine hem taxonomy router bunları import
eder; engine ve router'ın birbirini import etmesiyle oluşacak döngüyü önler.
Alanlar taxonomy_engine.calculate_full_taxonomy kullanımından türetildi.
"""
from pydantic import BaseModel, Field


class TaxonomyCalculationRequest(BaseModel):
    company_id: str
    year: int
    nace_code: str
    revenue_eur: float = 0.0
    capex_eur: float = 0.0
    opex_eur: float = 0.0
    activities: list[dict] = Field(default_factory=list)


class TaxonomyResult(BaseModel):
    company_id: str
    year: int
    eligibility_percent: float = 0.0
    alignment_percent: float = 0.0
    objectives: dict = Field(default_factory=dict)
    turnover_percent: float = 0.0
    capex_percent: float = 0.0
    opex_percent: float = 0.0
    recommendations: list[str] = Field(default_factory=list)
    status: str = "non_compliant"
