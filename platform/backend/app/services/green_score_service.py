"""
Yeşil Skor (Green Score) — Gemini önerisi (SustainHub DPP).

0-100 arası deterministik puan + gerekçe (breakdown). AI değil — formül.
Faz 2'de Claude ile "yumuşak" override eklenebilir; şu an tutarlılık
ve müşteriye açıklanabilirlik için sabit ağırlıklarla.

Varsayılan ağırlıklar (generic):
- Malzeme sürdürülebilirliği   30 puan  (geri dönüştürülmüş içerik %)
- Karbon yoğunluğu             25 puan  (sektör benchmark'ına göre)
- Tehlikeli madde              20 puan  (yok = tam puan)
- Uygunluk belgeleri           15 puan  (REACH/RoHS/OEKO/GOTS vs.)
- Onarılabilirlik              10 puan  (0-10 skor)

Sektöre özel ağırlıklar `dpp_templates.SECTOR_TEMPLATES[cat]["green_weights"]`
altında; textile'da malzeme+tehlike ağır, battery'de karbon+tehlike, electronics'te
onarılabilirlik+belge daha ağır.
"""
from typing import Optional
from dataclasses import dataclass
from .dpp_templates import get_template


# Sektör bazlı ortalama karbon yoğunluğu (kgCO2e/ürün) — MVP baseline
# Kaynak: JRC SASB volumes (yaklaşık ortalamalar, sonra veri gelince güncellenir)
SECTOR_CARBON_BENCHMARK = {
    "textile": 15.0,
    "battery": 90.0,
    "electronics": 40.0,
    "furniture": 25.0,
    "iron_steel": 1800.0,
    "tyre": 30.0,
    "detergent": 3.5,
    "paint": 5.0,
    "construction": 250.0,
    "chemical": 12.0,
    "other": 20.0,
}


@dataclass
class GreenScoreResult:
    total: float                # 0-100
    grade: str                  # A+, A, B, C, D
    breakdown: dict             # her kalem için puan + gerekçe
    weights_used: dict          # sektör-özel ağırlıklar
    formula_version: str = "1.1"


def _grade(score: float) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 65: return "B"
    if score >= 45: return "C"
    return "D"


def _material_score(materials: list, max_pts: float) -> tuple[float, str]:
    if not materials:
        return 0.0, "Malzeme bilgisi yok"
    total_weight = sum((m.get("percentage_by_weight") or 0) for m in materials)
    if total_weight == 0:
        return 0.0, "Malzeme yüzdesi belirtilmemiş"
    recycled_weighted = sum(
        (m.get("percentage_by_weight") or 0) * (m.get("recycled_content_pct") or 0)
        for m in materials
    ) / total_weight
    pts = round(recycled_weighted / 100 * max_pts, 1)
    return pts, f"Ağırlıklı geri dönüştürülmüş içerik: %{recycled_weighted:.1f}"


def _carbon_score(kgco2e: Optional[float], category: str, max_pts: float) -> tuple[float, str]:
    if kgco2e is None:
        return 0.0, "Karbon ayak izi verilmemiş"
    benchmark = SECTOR_CARBON_BENCHMARK.get(category, 20.0)
    ratio = kgco2e / benchmark
    if ratio <= 0.5:
        frac, note = 1.00, f"Sektör ortalamasının %{(1-ratio)*100:.0f} altında (mükemmel)"
    elif ratio <= 0.75:
        frac, note = 0.80, "Sektör ortalamasının belirgin altında"
    elif ratio <= 1.0:
        frac, note = 0.60, "Sektör ortalamasına yakın"
    elif ratio <= 1.5:
        frac, note = 0.30, "Sektör ortalamasının üstünde"
    else:
        frac, note = 0.10, "Sektör ortalamasının belirgin üstünde"
    return round(max_pts * frac, 1), f"{kgco2e:.1f} kgCO₂e · benchmark {benchmark:.1f} → {note}"


def _hazard_score(materials: list, max_pts: float) -> tuple[float, str]:
    if not materials:
        return round(max_pts / 2, 1), "Bilgi yok, kısmi puan"
    hazardous = [m for m in materials if m.get("is_hazardous")]
    if not hazardous:
        return max_pts, "Tehlikeli madde beyanı yok"
    ratio = len(hazardous) / len(materials)
    pts = round(max(0.0, max_pts * (1 - ratio)), 1)
    return pts, f"{len(hazardous)}/{len(materials)} malzeme tehlike bayraklı"


def _documents_score(documents: list, max_pts: float) -> tuple[float, str]:
    if not documents:
        return 0.0, "Uygunluk belgesi yok"
    unique_types = {d.get("doc_type") for d in documents if d.get("doc_type")}
    per_doc = max_pts / 5  # 5 belge tipinde tavana ulaşır
    pts = round(min(max_pts, len(unique_types) * per_doc), 1)
    return pts, f"{len(unique_types)} farklı belge tipi ({', '.join(sorted(unique_types))})"


def _repairability_score(score: Optional[float], max_pts: float) -> tuple[float, str]:
    if score is None:
        return 0.0, "Onarılabilirlik puanı yok"
    normalized = min(10.0, max(0.0, score)) / 10.0
    return round(max_pts * normalized, 1), f"Onarılabilirlik: {score}/10"


def compute_green_score(
    materials: list,
    carbon_kgco2e: Optional[float],
    category: str,
    documents: list,
    repairability: Optional[float],
) -> GreenScoreResult:
    """
    Sektör-özel ağırlıklandırma ile 0-100 skor.

    Ağırlıklar `dpp_templates.get_template(category)["green_weights"]`
    üzerinden okunur; toplam 100 olmalı (validasyon yok, spec).
    """
    weights = get_template(category).get("green_weights", {
        "material": 30, "carbon": 25, "hazard": 20,
        "documents": 15, "repairability": 10,
    })

    mat_pts, mat_note = _material_score(materials, weights["material"])
    carb_pts, carb_note = _carbon_score(carbon_kgco2e, category, weights["carbon"])
    haz_pts, haz_note = _hazard_score(materials, weights["hazard"])
    doc_pts, doc_note = _documents_score(documents, weights["documents"])
    rep_pts, rep_note = _repairability_score(repairability, weights["repairability"])

    total = round(mat_pts + carb_pts + haz_pts + doc_pts + rep_pts, 1)
    return GreenScoreResult(
        total=total,
        grade=_grade(total),
        weights_used=weights,
        breakdown={
            "material": {"points": mat_pts, "max": weights["material"], "note": mat_note},
            "carbon": {"points": carb_pts, "max": weights["carbon"], "note": carb_note},
            "hazard": {"points": haz_pts, "max": weights["hazard"], "note": haz_note},
            "documents": {"points": doc_pts, "max": weights["documents"], "note": doc_note},
            "repairability": {"points": rep_pts, "max": weights["repairability"], "note": rep_note},
        },
    )
