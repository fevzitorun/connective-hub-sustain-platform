"""
CDP (Carbon Disclosure Project) Veri Modelleri

Bu modeller, CDP'nin İklim Değişikliği, Su Güvenliği ve Ormanlar
soru setlerinin yapılandırılmış formatını temsil eder.
"""
from pydantic import BaseModel, Field
from typing import Literal, List, Optional, Dict, Any

class CDPQuestionOption(BaseModel):
    """Bir sorudaki çoktan seçmeli veya tablo sütunu seçeneği."""
    value: str
    label: str

class CDPQuestion(BaseModel):
    """
    Tek bir CDP sorusunu temsil eder.
    Örn: C1.1a "Yönetim kurulunda iklimle ilgili konular için yetkinlik var mı?"
    """
    id: str = Field(..., description="Soru numarası, örn: 'C1.1a'")
    title: str = Field(..., description="Sorunun tam metni.")
    guidance: Optional[str] = Field(None, description="Soruyu yanıtlama rehberi.")
    response_type: Literal["text", "numeric", "multiple_choice", "table", "boolean"]
    options: Optional[List[CDPQuestionOption]] = Field(None, description="Çoktan seçmeli yanıtlar için seçenekler.")
    table_columns: Optional[List[Dict[str, Any]]] = Field(None, description="Tablo tipi yanıtlar için sütun tanımları.")
    module: str = Field(..., description="İlgili CDP modülü, örn: 'C1 - Governance'")
    category: Literal["Climate Change", "Water Security", "Forests"]

class CDPModule(BaseModel):
    """CDP soru setindeki bir modülü (bölümü) temsil eder."""
    id: str = Field(..., description="Modül kodu, örn: 'C1'")
    title: str = Field(..., description="Modül başlığı, örn: 'Governance'")
    questions: List[CDPQuestion]

class CDPQuestionnaire(BaseModel):
    """Tam bir CDP Soru Seti (örn: İklim Değişikliği 2024)."""
    year: int
    category: Literal["Climate Change", "Water Security", "Forests"]
    modules: List[CDPModule]