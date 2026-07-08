"""
Sustain-Score: Finansal Derecelendirme Motoru
Bankalar için ESG Kredi Notu hesaplar.
"""
from dataclasses import dataclass
from typing import Dict, Any, List

@dataclass
class SustainGradeResult:
    score: int
    grade: str
    breakdown: Dict[str, Any]
    reasons: List[str]

def calculate_sustain_grade(
    carbon_intensity: float,
    sector_avg_carbon: float,
    physical_risk_score: int, # 0-100 (yüksek = az riskli / iyi)
    sbti_gap_pct: float,
    tsrs_completeness: int, # 0-100
) -> SustainGradeResult:
    reasons = []
    
    # 1. Emisyon Performansı (%40)
    if sector_avg_carbon <= 0:
        emission_score = 50
    else:
        ratio = carbon_intensity / sector_avg_carbon
        if ratio <= 0.5:
            emission_score = 100
        elif ratio <= 1.0:
            emission_score = int(100 - ((ratio - 0.5) / 0.5) * 50)
        elif ratio <= 1.5:
            emission_score = int(50 - ((ratio - 1.0) / 0.5) * 50)
        else:
            emission_score = 0
            
    if emission_score < 50:
        reasons.append("Karbon yoğunluğunuz sektör ortalamasının üzerinde olduğu için Emisyon Performansından puan düşürülmüştür.")

    # 2. Fiziksel Risk (%20)
    risk_score = physical_risk_score
    if risk_score < 50:
        reasons.append("Tesisleriniz yüksek fiziksel risk (deprem/sel/su stresi) bölgesinde yer aldığı için Fiziksel Risk puanınız düşürülmüştür.")

    # 3. Hedef Uyumluluğu (%20)
    # Gap % ne kadar azsa skor o kadar yüksek. (Gap %0 -> 100, Gap %100 -> 0)
    gap_score = max(0, int(100 - sbti_gap_pct))
    if gap_score < 70:
        reasons.append("SBTi 2030 hedeflerinize uzak olduğunuz (Gap yüksek) için Hedef Uyumluluğu puanınız düşürülmüştür.")

    # 4. TSRS Mevzuat Uyumu (%20)
    tsrs_score = tsrs_completeness
    if tsrs_score < 80:
        reasons.append("TSRS raporunuzda eksiklikler veya denetim izi (Audit Trail) yetersizliği olduğu için Mevzuat Uyumu puanınız düşürülmüştür.")

    total_score = int(
        (emission_score * 0.40) +
        (risk_score * 0.20) +
        (gap_score * 0.20) +
        (tsrs_score * 0.20)
    )
    
    # Notlandırma
    if total_score >= 90:
        grade = "AAA"
    elif total_score >= 80:
        grade = "AA"
    elif total_score >= 70:
        grade = "A"
    elif total_score >= 60:
        grade = "BBB"
    elif total_score >= 50:
        grade = "BB"
    elif total_score >= 40:
        grade = "B"
    elif total_score >= 30:
        grade = "CCC"
    elif total_score >= 20:
        grade = "CC"
    else:
        grade = "D"
        
    return SustainGradeResult(
        score=total_score,
        grade=grade,
        breakdown={
            "emisyon_performansi": {"weight": 40, "score": emission_score},
            "fiziksel_risk": {"weight": 20, "score": risk_score},
            "hedef_uyumlulugu": {"weight": 20, "score": gap_score},
            "tsrs_uyumu": {"weight": 20, "score": tsrs_score},
        },
        reasons=reasons
    )
