"""
EU Taxonomy Engine
Sprint 32B — Uygunluk, Uyum, DNSH, Asgari Güvenceler

Hesaplama Akışı:
1. calculate_eligibility: NACE koduna göre faaliyetin ciro, CapEx, OpEx'inin ne kadarının
   Taksonomi kapsamında olduğunu belirler.
2. calculate_alignment: Uygun faaliyetlerin "Önemli Katkı" (SC) ve "Önemli Zarar Vermeme" (DNSH)
   kriterlerini karşılayıp karşılamadığını kontrol eder.
3. check_minimum_safeguards: OECD ve UNGP standartlarına uyumu kontrol eder.
4. calculate_full_taxonomy: Tüm adımları birleştirir ve nihai sonucu üretir.
"""
import json
from pathlib import Path
from typing import Any

from ..models.taxonomy_schema import TaxonomyCalculationRequest, TaxonomyResult

# NACE veritabanını yükle
NACE_DB_PATH = Path(__file__).parent.parent / "data" / "nace_taxonomy.json"
with open(NACE_DB_PATH, "r") as f:
    NACE_DB = json.load(f)


def calculate_eligibility(nace_code: str, revenue: float, capex: float, opex: float) -> dict:
    """Faaliyetin Taksonomi'ye uygunluk yüzdesini hesaplar."""
    nace_info = NACE_DB.get(nace_code)
    if not nace_info:
        return {"eligible_turnover_pct": 0, "eligible_capex_pct": 0, "eligible_opex_pct": 0}

    # Basitleştirilmiş varsayım: NACE kodu uygunsa, tüm finansallar %100 uygundur.
    # Gerçekte, şirketlerin faaliyetlerini daha detaylı ayırması gerekir.
    return {"eligible_turnover_pct": 100, "eligible_capex_pct": 100, "eligible_opex_pct": 100}


def calculate_alignment(activities: list[dict], objectives: list[str]) -> dict:
    """Faaliyetlerin SC ve DNSH kriterlerine göre uyumunu hesaplar."""
    # Placeholder: Bu fonksiyon, her bir faaliyet ve hedef için teknik kriterleri
    # (örn. emisyon < 100gCO2/kWh) kontrol etmelidir.
    # Şimdilik, basitleştirilmiş bir skor döndürüyoruz.
    if "climate_change_mitigation" in objectives:
        return {"alignment_pct": 75.0, "aligned_objectives": {"climate_change_mitigation": 75.0}}
    return {"alignment_pct": 20.0, "aligned_objectives": {}}


def check_dnsh(activity: dict, objective: str) -> bool:
    """Bir faaliyetin belirli bir hedefe önemli zarar verip vermediğini kontrol eder."""
    # Placeholder: Her hedef için DNSH kriterleri burada kontrol edilmelidir.
    # Örn: İklim azaltma faaliyeti, biyoçeşitliliğe zarar vermemeli.
    return True  # Şimdilik tüm kontrollerin geçtiğini varsayalım.


def check_minimum_safeguards(company_id: str) -> bool:
    """Şirketin OECD ve UNGP asgari sosyal güvencelerini karşılayıp karşılamadığını kontrol eder."""
    # Placeholder: Bu fonksiyon, şirketin insan hakları, çalışma standartları vb.
    # konulardaki politikalarını ve performansını kontrol etmelidir.
    return True # Şimdilik geçtiğini varsayalım.


def calculate_full_taxonomy(request: TaxonomyCalculationRequest) -> TaxonomyResult:
    """Tüm Taksonomi hesaplamasını yapar ve sonucu döndürür."""
    
    eligibility = calculate_eligibility(request.nace_code, request.revenue_eur, request.capex_eur, request.opex_eur)
    
    nace_info = NACE_DB.get(request.nace_code, {})
    alignment = calculate_alignment(request.activities, nace_info.get("eligible_objectives", []))
    
    dnsh_passed = all(check_dnsh({}, obj) for obj in nace_info.get("eligible_objectives", []))
    safeguards_passed = check_minimum_safeguards(request.company_id)

    final_alignment = alignment["alignment_pct"] if dnsh_passed and safeguards_passed else 0

    return TaxonomyResult(
        company_id=request.company_id,
        year=request.year,
        eligibility_percent=eligibility["eligible_turnover_pct"],
        alignment_percent=final_alignment,
        objectives=alignment.get("aligned_objectives", {}),
        turnover_percent=final_alignment, # Basitleştirme
        capex_percent=final_alignment, # Basitleştirme
        opex_percent=final_alignment, # Basitleştirme
        recommendations=["Improve data collection for DNSH criteria.", "Develop a transition plan for non-aligned activities."],
        status="partially_compliant" if 0 < final_alignment < 90 else "non_compliant"
    )