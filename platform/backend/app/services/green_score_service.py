"""
Yeşil Skor (Green Score) — Gemini önerisi (SustainHub DPP).

0-100 arası deterministik puan + gerekçe (breakdown). AI değil — formül.
Faz 2'de Claude ile "yumuşak" override eklenebilir; şu an tutarlılık
ve müşteriye açıklanabilirlik için sabit ağırlıklarla.

Ağırlıklar:
- Malzeme sürdürülebilirliği   30 puan  (geri dönüştürülmüş içerik %)
- Karbon yoğunluğu             25 puan  (sektör benchmark'ına göre)
- Tehlikeli madde              20 puan  (yok = tam puan)
- Uygunluk belgeleri           15 puan  (REACH/RoHS/OEKO/GOTS vs.)
- Onarılabilirlik              10 puan  (0-10 skor)
"""
from typing import Optional
from dataclasses import dataclass


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
    formula_version: str = "1.0"


def _grade(score: float) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 65: return "B"
    if score >= 45: return "C"
    return "D"


def _material_score(materials: list) -> tuple[float, str]:
    """30 puan üzerinden — ağırlıklı geri dönüştürülmüş içerik."""
    if not materials:
        return 0.0, "Malzeme bilgisi yok"
    total_weight = sum((m.get("percentage_by_weight") or 0) for m in materials)
    if total_weight == 0:
        return 0.0, "Malzeme yüzdesi belirtilmemiş"
    recycled_weighted = sum(
        (m.get("percentage_by_weight") or 0) * (m.get("recycled_content_pct") or 0)
        for m in materials
    ) / total_weight  # 0-100
    pts = round(recycled_weighted * 0.30, 1)  # 30 puana skala
    return pts, f"Ağırlıklı geri dönüştürülmüş içerik: %{recycled_weighted:.1f}"


def _carbon_score(kgco2e: Optional[float], category: str) -> tuple[float, str]:
    """25 puan — sektör benchmark'ına göre. Düşükse iyi."""
    if kgco2e is None:
        return 0.0, "Karbon ayak izi verilmemiş"
    benchmark = SECTOR_CARBON_BENCHMARK.get(category, 20.0)
    ratio = kgco2e / benchmark  # <1 iyi, >1 kötü
    if ratio <= 0.5:
        pts, note = 25.0, f"Sektör ortalamasının %{(1-ratio)*100:.0f} altında (mükemmel)"
    elif ratio <= 0.75:
        pts, note = 20.0, "Sektör ortalamasının belirgin altında"
    elif ratio <= 1.0:
        pts, note = 15.0, "Sektör ortalamasına yakın"
    elif ratio <= 1.5:
        pts, note = 8.0, "Sektör ortalamasının üstünde"
    else:
        pts, note = 2.0, "Sektör ortalamasının belirgin üstünde"
    return pts, f"{kgco2e:.1f} kgCO₂e · benchmark {benchmark:.1f} → {note}"


def _hazard_score(materials: list) -> tuple[float, str]:
    """20 puan — tehlikeli madde yoksa tam puan."""
    if not materials:
        return 10.0, "Bilgi yok, kısmi puan"
    hazardous = [m for m in materials if m.get("is_hazardous")]
    if not hazardous:
        return 20.0, "Tehlikeli madde beyanı yok"
    ratio = len(hazardous) / len(materials)
    pts = round(max(0.0, 20.0 * (1 - ratio)), 1)
    return pts, f"{len(hazardous)}/{len(materials)} malzeme tehlike bayraklı"


def _documents_score(documents: list) -> tuple[float, str]:
    """15 puan — uygunluk belgesi sayısı ve çeşitliliği."""
    if not documents:
        return 0.0, "Uygunluk belgesi yok"
    unique_types = {d.get("doc_type") for d in documents if d.get("doc_type")}
    # Her belge tipi 3 puan, tavan 15
    pts = min(15.0, len(unique_types) * 3.0)
    return pts, f"{len(unique_types)} farklı belge tipi ({', '.join(sorted(unique_types))})"


def _repairability_score(score: Optional[float]) -> tuple[float, str]:
    """10 puan — 0-10 arası onarılabilirlik puanı doğrudan skala."""
    if score is None:
        return 0.0, "Onarılabilirlik puanı yok"
    pts = round(min(10.0, max(0.0, score)) * 1.0, 1)
    return pts, f"Onarılabilirlik: {score}/10"


def compute_green_score(
    materials: list,
    carbon_kgco2e: Optional[float],
    category: str,
    documents: list,
    repairability: Optional[float],
) -> GreenScoreResult:
    """
    Ana fonksiyon. Route katmanı bu fonksiyonu çağırıp
    sonucu ProductPassport.green_score + breakdown alanlarına yazar.
    """
    mat_pts, mat_note = _material_score(materials)
    carb_pts, carb_note = _carbon_score(carbon_kgco2e, category)
    haz_pts, haz_note = _hazard_score(materials)
    doc_pts, doc_note = _documents_score(documents)
    rep_pts, rep_note = _repairability_score(repairability)

    total = round(mat_pts + carb_pts + haz_pts + doc_pts + rep_pts, 1)
    return GreenScoreResult(
        total=total,
        grade=_grade(total),
        breakdown={
            "material": {"points": mat_pts, "max": 30, "note": mat_note},
            "carbon": {"points": carb_pts, "max": 25, "note": carb_note},
            "hazard": {"points": haz_pts, "max": 20, "note": haz_note},
            "documents": {"points": doc_pts, "max": 15, "note": doc_note},
            "repairability": {"points": rep_pts, "max": 10, "note": rep_note},
        },
    )
