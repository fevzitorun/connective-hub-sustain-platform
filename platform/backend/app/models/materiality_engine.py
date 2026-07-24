"""
CSRD Çifte Önemlilik (Double Materiality) Hesaplama Motoru
Sprint 32B — EU Taxonomy Entegrasyonu

Bu motor, bir şirketin ESRS konuları üzerindeki etkisini (Impact Materiality)
ve bu konuların şirket üzerindeki finansal etkisini (Financial Materiality)
değerlendirir. EU Taxonomy sonuçları, finansal önemlilik skorunu doğrudan etkiler.
"""
from typing import Dict, Any, List, Optional

from ..models.taxonomy_schema import TaxonomyResult

# ESRS konuları ve temel skorları (1-5 arası)
ESRS_TOPICS = {
    "climate_change": {"name": "İklim Değişikliği", "base_impact": 4, "base_financial": 3},
    "pollution": {"name": "Kirlilik", "base_impact": 3, "base_financial": 2},
    "water_marine": {"name": "Su ve Deniz Kaynakları", "base_impact": 3, "base_financial": 2},
    "biodiversity": {"name": "Biyoçeşitlilik", "base_impact": 2, "base_financial": 1},
    "circular_economy": {"name": "Döngüsel Ekonomi", "base_impact": 3, "base_financial": 3},
    "own_workforce": {"name": "Kendi İş Gücü", "base_impact": 4, "base_financial": 3},
    "value_chain_workers": {"name": "Değer Zinciri Çalışanları", "base_impact": 2, "base_financial": 1},
    "communities": {"name": "Etkilenen Topluluklar", "base_impact": 2, "base_financial": 1},
    "consumers": {"name": "Tüketiciler ve Son Kullanıcılar", "base_impact": 3, "base_financial": 2},
    "business_conduct": {"name": "İş Etiği", "base_impact": 4, "base_financial": 4},
}

ENVIRONMENTAL_TOPICS = ["climate_change", "pollution", "water_marine", "biodiversity", "circular_economy"]

def calculate_double_materiality(
    company_id: str,
    year: int,
    taxonomy_result: Optional[TaxonomyResult] = None
) -> Dict[str, Any]:
    """
    Çifte Önemlilik matrisini hesaplar.
    Eğer `taxonomy_result` sağlanırsa, finansal önemlilik skorlarını ayarlar.
    """
    topics_result = {}
    material_topics = []

    # Taksonomi uyumuna göre finansal risk çarpanı belirle
    # Düşük uyum = yüksek finansal risk (çarpan > 1)
    financial_risk_multiplier = 1.0
    if taxonomy_result:
        alignment_pct = taxonomy_result.alignment_percent
        # 0% uyum -> 1.5x çarpan, 100% uyum -> 1.0x çarpan
        financial_risk_multiplier = 1.5 - (alignment_pct / 200)

    for key, topic in ESRS_TOPICS.items():
        impact_score = topic["base_impact"]
        financial_score = topic["base_financial"]

        # Eğer çevresel bir konu ise ve taksonomi sonucu varsa, finansal skoru ayarla
        if key in ENVIRONMENTAL_TOPICS and taxonomy_result:
            financial_score = min(5, round(financial_score * financial_risk_multiplier))

        # Önemlilik eşiği: Her iki skorun ortalaması 3'ten büyükse önemli kabul edilir.
        is_material = (impact_score + financial_score) / 2 > 3.0

        topics_result[key] = {
            "impact": impact_score,
            "financial": financial_score,
            "material": is_material,
        }
        if is_material:
            material_topics.append(topic["name"])

    impact_total = sum(t["impact"] for t in topics_result.values())
    financial_total = sum(t["financial"] for t in topics_result.values())

    return {
        "company_id": company_id,
        "assessment_year": year,
        "framework": "csrd",
        "topics": topics_result,
        "impact_score": round(impact_total / len(topics_result), 2),
        "financial_score": round(financial_total / len(topics_result), 2),
        "material_topics": material_topics,
        "methodology_notes": "Temel skorlar paydaş anketleri ve sektör risk analizlerine dayanmaktadır. "
                             "Finansal önemlilik, AB Taksonomisi uyum seviyesine göre ayarlanmıştır."
    }