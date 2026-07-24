"""
Raporun `compliance_detail` JSON alanını yapılandırmak için kullanılan Pydantic modelleri.

Bu modeller, veritabanında saklanan analiz sonuçlarının tutarlı ve doğrulanabilir
olmasını sağlar.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from ..models.taxonomy_schema import TaxonomyResult


class MaterialityTopicDetail(BaseModel):
    impact: int
    financial: int
    material: bool


class MaterialityResult(BaseModel):
    company_id: str
    assessment_year: int
    framework: str
    topics: Dict[str, MaterialityTopicDetail]
    impact_score: float
    financial_score: float
    material_topics: List[str]
    methodology_notes: str


class TsrsChecksResult(BaseModel):
    total_score: int
    grade: str
    checks: Dict[str, bool]


class ReportComplianceDetail(BaseModel):
    """Raporun `compliance_detail` alanının tam yapısı."""
    tsrs_checks: Optional[TsrsChecksResult] = None
    eu_taxonomy: Optional[TaxonomyResult] = None
    materiality: Optional[MaterialityResult] = None