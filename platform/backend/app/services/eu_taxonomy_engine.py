"""
EU Taxonomy (Regulation 2020/852) Engine
6 Çevresel Hedef + Teknik Tarama Kriterleri + DNSH + MSS
"""
from typing import Any

# ── 6 Environmental Objectives ────────────────────────────────────────────────
EU_TAXONOMY_OBJECTIVES = {
    "CCM": {
        "code": "CCM", "title": "İklim Değişikliğinin Azaltılması", "icon": "🌡️",
        "regulation": "Delegated Regulation 2021/2139",
        "description": "Sera gazı emisyonlarının azaltılmasına önemli katkı sağlayan ekonomik faaliyetler",
        "color": "#10b981",
    },
    "CCA": {
        "code": "CCA", "title": "İklim Değişikliğine Uyum", "icon": "🌊",
        "regulation": "Delegated Regulation 2021/2139",
        "description": "Mevcut ve gelecekteki iklim risklerine karşı adaptasyon çözümleri",
        "color": "#3b82f6",
    },
    "WTR": {
        "code": "WTR", "title": "Su ve Deniz Kaynaklarının Sürdürülebilir Kullanımı", "icon": "💧",
        "regulation": "Delegated Regulation 2023/2485",
        "description": "Su kaynaklarının korunması ve sürdürülebilir yönetimi",
        "color": "#06b6d4",
    },
    "CE":  {
        "code": "CE",  "title": "Döngüsel Ekonomiye Geçiş", "icon": "♻️",
        "regulation": "Delegated Regulation 2023/2485",
        "description": "Atık azaltma, yeniden kullanım, geri dönüşüm faaliyetleri",
        "color": "#8b5cf6",
    },
    "PPC": {
        "code": "PPC", "title": "Kirlilik Önleme ve Kontrolü", "icon": "🏭",
        "regulation": "Delegated Regulation 2023/2486",
        "description": "Hava, su ve toprak kirliliğinin önlenmesi ve azaltılması",
        "color": "#f59e0b",
    },
    "BIO": {
        "code": "BIO", "title": "Biyoçeşitlilik ve Ekosistemlerin Korunması", "icon": "🌿",
        "regulation": "Delegated Regulation 2023/2486",
        "description": "Biyoçeşitliliğin korunması ve ekosistem hizmetlerinin sürdürülmesi",
        "color": "#ec4899",
    },
}

# ── NACE-based Technical Screening Criteria ───────────────────────────────────
NACE_CRITERIA: dict[str, dict] = {
    # Manufacturing
    "C13": {  # Textiles
        "label": "Tekstil Üretimi", "nace": "C13", "sector": "manufacturing",
        "CCM": {
            "threshold": "Ton ürün başına <1.0 tCO₂e — Sektör ortalaması 2.1 tCO₂e",
            "current_avg": 2.1, "unit": "tCO₂e/ton ürün",
            "screening": "Enerji yoğunluğu azaltma planı + yenilenebilir enerji geçiş hedefi",
        },
        "CE": {
            "threshold": "Atık geri dönüşüm oranı ≥70% — Su tüketimi azaltma planı",
            "current_avg": 35, "unit": "%",
            "screening": "Geri dönüştürülmüş içerik belgesi + atık yönetim planı",
        },
        "WTR": {
            "threshold": "Ton ürün başına su tüketimi <100 m³",
            "current_avg": 150, "unit": "m³/ton",
            "screening": "Su ayak izi değerlendirmesi + kapalı döngü sistemler",
        },
        "PPC": {
            "threshold": "Kimyasal kullanımı ZDHC MRSL Seviye 3 uyumu",
            "current_avg": None, "unit": "ZDHC uyum seviyesi",
            "screening": "ZDHC Gateway sertifikası veya eşdeğer",
        },
    },
    "C24": {  # Steel
        "label": "Çelik Üretimi", "nace": "C24", "sector": "manufacturing",
        "CCM": {
            "threshold": "Ton çelik başına <1.4 tCO₂e (DRI-EAF yolu) veya <2.0 (BOF)",
            "current_avg": 1.85, "unit": "tCO₂e/ton çelik",
            "screening": "Hidrojen veya yeşil elektrik kullanımı belgesi",
        },
        "CE": {
            "threshold": "Hurda çelik kullanım oranı ≥55%",
            "current_avg": 40, "unit": "%",
            "screening": "Hurda çelik tedarik zinciri belgesi",
        },
    },
    "C29": {  # Automotive
        "label": "Otomotiv Üretimi", "nace": "C29", "sector": "manufacturing",
        "CCM": {
            "threshold": "Üretim tesisi Kapsam 1+2 emisyonları <50 tCO₂e/araç",
            "current_avg": 0.9, "unit": "tCO₂e/araç",
            "screening": "EV ve hibrid araç üretim payı belgesi",
        },
        "CE": {
            "threshold": "Geri dönüştürülebilir malzeme oranı ≥85% (AB direktifi 2000/53/EC)",
            "current_avg": 80, "unit": "%",
            "screening": "Ömür sonu araç yönetim planı",
        },
    },
    "A01": {  # Crop
        "label": "Tarım / Tahıl", "nace": "A01", "sector": "agriculture",
        "CCM": {
            "threshold": "Toprak karbon tutma + sera gazı yönetim planı",
            "current_avg": None, "unit": "tCO₂e/ha",
            "screening": "DNDC modeli veya ölçüm-raporlama-doğrulama sistemi",
        },
        "BIO": {
            "threshold": "Entegre zararlı yönetimi + biyoçeşitlilik izleme planı",
            "current_avg": None, "unit": "biodiversity score",
            "screening": "Pestisit kullanım kaydı + habitat koruma belgesi",
        },
    },
    "D35": {  # Electricity
        "label": "Elektrik Üretimi", "nace": "D35", "sector": "energy",
        "CCM": {
            "threshold": "Elektrik üretimi <100 gCO₂e/kWh (doğrudan emisyon)",
            "current_avg": 415, "unit": "gCO₂e/kWh",
            "screening": "LCOE ve yaşam döngüsü emisyon belgesi",
        },
    },
    "F41": {  # Construction
        "label": "Bina İnşaatı", "nace": "F41", "sector": "construction",
        "CCM": {
            "threshold": "Birincil enerji talebi <10% ulusal neredeyse sıfır enerji binaları eşiği",
            "current_avg": None, "unit": "kWh/m²/yıl",
            "screening": "Enerji performans belgesi (EPB) A+ veya üstü",
        },
        "CE": {
            "threshold": "İnşaat atığının ağırlıkça ≥90'ı yeniden kullanılmalı veya geri dönüştürülmeli",
            "current_avg": 50, "unit": "%",
            "screening": "Atık yönetim planı + C2C sertifikası",
        },
    },
}

# ── DNSH Checks ───────────────────────────────────────────────────────────────
DNSH_CHECKS = [
    {"obj": "CCM", "q": "Faaliyet sera gazı emisyonlarını önemli ölçüde artırıyor mu?"},
    {"obj": "CCA", "q": "Faaliyet iklim risklerine karşı adaptasyonu engelliyor mu?"},
    {"obj": "WTR", "q": "Faaliyet su kaynaklarını önemli ölçüde kirleterek zarar veriyor mu?"},
    {"obj": "CE",  "q": "Faaliyet atık üretimini artırıyor veya geri dönüşümü engelliyor mu?"},
    {"obj": "PPC", "q": "Faaliyet hava, su veya toprak kirliliğine yol açıyor mu?"},
    {"obj": "BIO", "q": "Faaliyet biyoçeşitlilik veya ekosistemler üzerinde olumsuz etki yaratıyor mu?"},
]

# ── Alignment score calculator ─────────────────────────────────────────────────
def calculate_taxonomy_alignment(
    nace_code: str,
    emissions_intensity: float | None = None,
    renewable_pct: float = 0,
    recycling_rate: float = 0,
    water_intensity: float | None = None,
    has_biodiversity_plan: bool = False,
    has_pollution_controls: bool = False,
    climate_adaptation_plan: bool = False,
    dnsh_answers: dict[str, bool] | None = None,
) -> dict[str, Any]:
    """
    Calculate EU Taxonomy alignment for a given NACE code.
    Returns per-objective scores and overall alignment %.
    """
    criteria = NACE_CRITERIA.get(nace_code, {})
    if not criteria:
        # generic assessment for unlisted NACE
        return _generic_alignment(
            renewable_pct, recycling_rate, has_biodiversity_plan,
            has_pollution_controls, climate_adaptation_plan, dnsh_answers or {}
        )

    scores: dict[str, dict] = {}

    # CCM alignment
    if "CCM" in criteria and emissions_intensity is not None:
        thr_val = criteria["CCM"].get("current_avg")
        if thr_val and thr_val > 0:
            ratio = emissions_intensity / thr_val
            ccm_score = max(0, min(100, round((1 - ratio) * 100 + 50)))
        else:
            ccm_score = 40 + round(renewable_pct * 0.5)
        scores["CCM"] = {
            "score": ccm_score, "aligned": ccm_score >= 60,
            "threshold": criteria["CCM"]["threshold"],
            "unit": criteria["CCM"]["unit"],
            "your_value": emissions_intensity,
            "sector_avg": criteria["CCM"].get("current_avg"),
        }

    if "CCM" not in scores:
        ccm_score = 30 + round(renewable_pct * 0.6)
        scores["CCM"] = {"score": ccm_score, "aligned": ccm_score >= 60, "threshold": "Emisyon yoğunluğu verisi gerekli", "unit": "—", "your_value": None, "sector_avg": None}

    # CCA
    cca_score = 40 if climate_adaptation_plan else 15
    scores["CCA"] = {"score": cca_score, "aligned": cca_score >= 60, "threshold": "İklim fiziksel risk değerlendirmesi + adaptasyon planı", "unit": "plan", "your_value": climate_adaptation_plan, "sector_avg": None}

    # WTR
    if "WTR" in criteria and water_intensity is not None:
        wtr_thr = criteria["WTR"].get("current_avg")
        wtr_score = max(0, min(100, round(100 - water_intensity / wtr_thr * 50))) if wtr_thr else 40
    else:
        wtr_score = 50
    scores["WTR"] = {"score": wtr_score, "aligned": wtr_score >= 60, "threshold": criteria.get("WTR", {}).get("threshold", "Su yönetim planı gerekli"), "unit": criteria.get("WTR", {}).get("unit", "—"), "your_value": water_intensity, "sector_avg": criteria.get("WTR", {}).get("current_avg")}

    # CE
    if "CE" in criteria:
        ce_avg = criteria["CE"].get("current_avg", 50)
        ce_score = round(recycling_rate / ce_avg * 60) if ce_avg else 40
        ce_score = min(100, ce_score)
    else:
        ce_score = min(100, round(recycling_rate * 1.2))
    scores["CE"] = {"score": ce_score, "aligned": ce_score >= 60, "threshold": criteria.get("CE", {}).get("threshold", "Geri dönüşüm oranı ≥70%"), "unit": "%", "your_value": recycling_rate, "sector_avg": criteria.get("CE", {}).get("current_avg")}

    # PPC
    ppc_score = 70 if has_pollution_controls else 20
    scores["PPC"] = {"score": ppc_score, "aligned": ppc_score >= 60, "threshold": "Kirlilik önleme kontrolleri ve izleme sistemi", "unit": "kontrol", "your_value": has_pollution_controls, "sector_avg": None}

    # BIO
    bio_score = 65 if has_biodiversity_plan else 20
    scores["BIO"] = {"score": bio_score, "aligned": bio_score >= 60, "threshold": "Biyoçeşitlilik etki değerlendirmesi ve izleme planı", "unit": "plan", "your_value": has_biodiversity_plan, "sector_avg": None}

    # DNSH check
    if dnsh_answers is None:
        dnsh_answers = {}
    dnsh_pass = all(not dnsh_answers.get(c["obj"], False) for c in DNSH_CHECKS)

    aligned_count = sum(1 for s in scores.values() if s["aligned"])
    overall_pct = round(sum(s["score"] for s in scores.values()) / (len(scores) * 100) * 100)

    sector_info = criteria.get("label", nace_code)

    return {
        "nace_code": nace_code,
        "sector_label": sector_info,
        "overall_alignment_pct": overall_pct,
        "aligned_objectives": aligned_count,
        "total_objectives": len(scores),
        "dnsh_pass": dnsh_pass,
        "taxonomy_eligible": True,
        "taxonomy_aligned": dnsh_pass and aligned_count >= 4,
        "objectives": scores,
        "dnsh_checks": DNSH_CHECKS,
        "mss_note": "Minimum sosyal güvenceler: ILO temel standartları, OECD çok uluslu şirket rehberi",
        "gaps": _alignment_gaps(scores),
        "recommendations": _alignment_recommendations(scores, dnsh_pass),
    }


def _generic_alignment(renewable_pct, recycling_rate, bio, ppc, cca, dnsh) -> dict[str, Any]:
    scores = {
        "CCM": {"score": 30 + round(renewable_pct * 0.6), "aligned": renewable_pct >= 50, "threshold": "Yenilenebilir enerji ≥%50", "unit": "%", "your_value": renewable_pct, "sector_avg": None},
        "CCA": {"score": 40 if cca else 15, "aligned": cca, "threshold": "İklim adaptasyon planı", "unit": "plan", "your_value": cca, "sector_avg": None},
        "WTR": {"score": 50, "aligned": False, "threshold": "Su yönetim planı gerekli", "unit": "—", "your_value": None, "sector_avg": None},
        "CE":  {"score": min(100, round(recycling_rate * 1.2)), "aligned": recycling_rate >= 70, "threshold": "Geri dönüşüm ≥%70", "unit": "%", "your_value": recycling_rate, "sector_avg": None},
        "PPC": {"score": 70 if ppc else 20, "aligned": ppc, "threshold": "Kirlilik kontrol sistemi", "unit": "kontrol", "your_value": ppc, "sector_avg": None},
        "BIO": {"score": 65 if bio else 20, "aligned": bio, "threshold": "Biyoçeşitlilik planı", "unit": "plan", "your_value": bio, "sector_avg": None},
    }
    dnsh_pass = all(not dnsh.get(c["obj"], False) for c in DNSH_CHECKS)
    aligned = sum(1 for s in scores.values() if s["aligned"])
    return {
        "nace_code": "—", "sector_label": "Genel", "overall_alignment_pct": round(sum(s["score"] for s in scores.values()) / 600 * 100),
        "aligned_objectives": aligned, "total_objectives": 6, "dnsh_pass": dnsh_pass,
        "taxonomy_eligible": True, "taxonomy_aligned": dnsh_pass and aligned >= 4,
        "objectives": scores, "dnsh_checks": DNSH_CHECKS,
        "mss_note": "Minimum sosyal güvenceler: ILO temel standartları",
        "gaps": _alignment_gaps(scores), "recommendations": _alignment_recommendations(scores, dnsh_pass),
    }


def _alignment_gaps(scores: dict) -> list[dict]:
    gaps = [{"code": code, "title": EU_TAXONOMY_OBJECTIVES[code]["title"], "icon": EU_TAXONOMY_OBJECTIVES[code]["icon"], "score": s["score"], "threshold": s["threshold"]}
            for code, s in scores.items() if not s["aligned"]]
    return sorted(gaps, key=lambda x: x["score"])


def _alignment_recommendations(scores: dict, dnsh_pass: bool) -> list[str]:
    recs = []
    if not dnsh_pass:
        recs.append("DNSH kontrollerini geçin — tüm olumsuz etkileri belgeleyin ve azaltma planı oluşturun")
    if not scores.get("CCM", {}).get("aligned"):
        recs.append("Yenilenebilir enerji oranını artırın ve emisyon yoğunluğunu sektör eşiğinin altına indirin")
    if not scores.get("CCA", {}).get("aligned"):
        recs.append("İklim fiziksel risk değerlendirmesi (TCFD) ve adaptasyon planı hazırlayın")
    if not scores.get("CE", {}).get("aligned"):
        recs.append("Geri dönüşüm oranını %70'in üzerine çıkarın — döngüsel ekonomi stratejisi oluşturun")
    if not scores.get("BIO", {}).get("aligned"):
        recs.append("TNFD çerçevesinde biyoçeşitlilik risk değerlendirmesi ve koruma planı hazırlayın")
    return recs[:5]


DEMO_RESULT = calculate_taxonomy_alignment(
    nace_code="C13",
    emissions_intensity=1.6,
    renewable_pct=25.0,
    recycling_rate=45.0,
    water_intensity=120.0,
    has_biodiversity_plan=False,
    has_pollution_controls=True,
    climate_adaptation_plan=False,
)
