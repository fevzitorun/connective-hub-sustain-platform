"""
Belediye Sürdürülebilirlik Endeksi Motoru

Metodoloji: Akan & Şendurur (2016) — 30 büyükşehir belediyesinin faaliyet
raporları içerik analiziyle puanlandı. 3 boyut (Ekonomik / Sosyal / Çevresel),
her boyutta SDG-eşleşmeli 10 kriter, her kriter 0-4 ölçekte puanlanır.

Puanlama ölçeği (0-4, UNEP/SustainAbility 1996 temelli):
  0 = Hiç açıklama yok
  1 = Minimum seviye, az detay
  2 = Dürüst, eksik + taahhütleri kapsayan detaylı açıklama
  3 = Ana faaliyet + kurumsal süreçleri kapsayan açıklama
  4 = Ana faaliyet + süreç + sorumlulukları kapsayan tam açıklama

Not: municipality_library.md Bölüm 2. Harf notu (A-D) kobi_credit_score_engine.py
deseniyle tutarlı — sahte veri yok, skorlar dışarıdan (belediye değerlendirmesi)
verilir.
"""
from typing import Any

DIMENSIONS = ("economic", "social", "environmental")
DIMENSION_LABELS = {
    "economic": "Ekonomik",
    "social": "Sosyal",
    "environmental": "Çevresel",
}
MAX_PER_CRITERION = 4

# ── SDG-eşleşmeli kriterler (municipality_library.md Bölüm 2) ──────────────────
INDEX_CRITERIA: list[dict] = [
    # ---- EKONOMİK (10) --------------------------------------------------------
    {"id": "ECO01", "dimension": "economic", "sdg": 16, "tr": "Barış, Adalet ve Güçlü Kurumlar"},
    {"id": "ECO02", "dimension": "economic", "sdg": 9,  "tr": "Yatırım Büyüklüğü"},
    {"id": "ECO03", "dimension": "economic", "sdg": 8,  "tr": "Çalışan Sosyal Yardımı"},
    {"id": "ECO04", "dimension": "economic", "sdg": 17, "tr": "Hedefler İçin Ortaklıklar"},
    {"id": "ECO05", "dimension": "economic", "sdg": 8,  "tr": "İnsana Yakışır İş"},
    {"id": "ECO06", "dimension": "economic", "sdg": 16, "tr": "Mali Bilgiler"},
    {"id": "ECO07", "dimension": "economic", "sdg": 16, "tr": "Performans Bilgileri"},
    {"id": "ECO08", "dimension": "economic", "sdg": 9,  "tr": "Sanayi, Yenilikçilik ve Altyapı"},
    {"id": "ECO09", "dimension": "economic", "sdg": 11, "tr": "Sosyal Sermaye"},
    {"id": "ECO10", "dimension": "economic", "sdg": 12, "tr": "Ürün-Hizmet Analizi"},

    # ---- SOSYAL (10) ----------------------------------------------------------
    {"id": "SOC01", "dimension": "social", "sdg": 2,  "tr": "Açlığa Son"},
    {"id": "SOC02", "dimension": "social", "sdg": 16, "tr": "Barış, Adalet ve Güçlü Kurumlar"},
    {"id": "SOC03", "dimension": "social", "sdg": 8,  "tr": "Çalışan Sosyal Hakları"},
    {"id": "SOC04", "dimension": "social", "sdg": 10, "tr": "Eşitsizliklerin Azaltılması"},
    {"id": "SOC05", "dimension": "social", "sdg": 8,  "tr": "İnsana Yakışır İş"},
    {"id": "SOC06", "dimension": "social", "sdg": 4,  "tr": "Nitelikli Eğitim"},
    {"id": "SOC07", "dimension": "social", "sdg": 16, "tr": "Rüşvetle Mücadele"},
    {"id": "SOC08", "dimension": "social", "sdg": 3,  "tr": "Sağlıklı Bireyler"},
    {"id": "SOC09", "dimension": "social", "sdg": 5,  "tr": "Toplumsal Cinsiyet Eşitliği"},
    {"id": "SOC10", "dimension": "social", "sdg": 1,  "tr": "Yoksulluğa Son"},

    # ---- ÇEVRESEL (10) --------------------------------------------------------
    {"id": "ENV01", "dimension": "environmental", "sdg": 12, "tr": "Atık Yönetimi"},
    {"id": "ENV02", "dimension": "environmental", "sdg": 7,  "tr": "Erişilebilir ve Temiz Enerji"},
    {"id": "ENV03", "dimension": "environmental", "sdg": 13, "tr": "İklim Eylemi"},
    {"id": "ENV04", "dimension": "environmental", "sdg": 15, "tr": "Karasal Yaşam"},
    {"id": "ENV05", "dimension": "environmental", "sdg": 3,  "tr": "Sağlıklı Bireyler"},
    {"id": "ENV06", "dimension": "environmental", "sdg": 12, "tr": "Sorumlu Tüketim ve Üretim"},
    {"id": "ENV07", "dimension": "environmental", "sdg": 14, "tr": "Sudaki Yaşam"},
    {"id": "ENV08", "dimension": "environmental", "sdg": 11, "tr": "Sürdürülebilir Şehir ve Yaşam Alanları"},
    {"id": "ENV09", "dimension": "environmental", "sdg": 6,  "tr": "Temiz Su ve Sıhhi Koşullar"},
    {"id": "ENV10", "dimension": "environmental", "sdg": 7,  "tr": "Yenilenebilir Enerji"},
]

# ── Harf notu eşikleri (0-4 ölçek) ─────────────────────────────────────────────
GRADE_THRESHOLDS: list[tuple[float, str, str]] = [
    (3.0, "A", "Lider — Ana faaliyet, süreç ve sorumlulukları kapsayan tam açıklama"),
    (2.0, "B", "İyi — Süreç ve taahhütleri kapsayan detaylı raporlama"),
    (1.0, "C", "Gelişmekte — Minimum seviye, sınırlı açıklama"),
    (0.0, "D", "Yetersiz — Açıklama yok veya çok sınırlı"),
]


def _get_grade(total_score: float) -> tuple[str, str]:
    for threshold, grade, label in GRADE_THRESHOLDS:
        if total_score >= threshold:
            return grade, label
    return "D", "Yetersiz — Açıklama yok veya çok sınırlı"


def calculate_municipality_index(
    municipality_name: str,
    scores: dict[str, int],  # criterion_id → 0..4
    year: int | None = None,
) -> dict[str, Any]:
    """
    scores: {criterion_id: 0-4}. Eksik kriter 0 sayılır (açıklama yok).

    Dönüş: boyut skorları (0-4), toplam skor (0-4), harf notu (A-D), kriter
    kırılımı ve öncelikli gelişim alanları.
    """
    dim_totals: dict[str, float] = {d: 0.0 for d in DIMENSIONS}
    dim_counts: dict[str, int] = {d: 0 for d in DIMENSIONS}
    breakdown: list[dict] = []
    gaps: list[dict] = []

    for crit in INDEX_CRITERIA:
        raw = scores.get(crit["id"], 0)
        # 0-4 aralığına kıstla
        val = max(0, min(MAX_PER_CRITERION, int(raw)))
        dim = crit["dimension"]
        dim_totals[dim] += val
        dim_counts[dim] += 1

        breakdown.append({
            "id": crit["id"],
            "dimension": dim,
            "dimension_label": DIMENSION_LABELS[dim],
            "criterion_tr": crit["tr"],
            "sdg": crit["sdg"],
            "score": val,
        })
        if val <= 1:
            gaps.append({
                "id": crit["id"],
                "dimension_label": DIMENSION_LABELS[dim],
                "criterion_tr": crit["tr"],
                "sdg": crit["sdg"],
                "score": val,
            })

    # Boyut ortalamaları (0-4)
    dim_scores = {
        d: round(dim_totals[d] / dim_counts[d], 2) if dim_counts[d] else 0.0
        for d in DIMENSIONS
    }
    total_score = round(sum(dim_scores.values()) / len(DIMENSIONS), 2)
    grade, grade_label = _get_grade(total_score)

    # En düşük skorlu kriterler önce (öncelikli gelişim)
    top_gaps = sorted(gaps, key=lambda x: x["score"])[:8]

    return {
        "municipality_name": municipality_name,
        "year": year,
        "economic_score": dim_scores["economic"],
        "social_score": dim_scores["social"],
        "environmental_score": dim_scores["environmental"],
        "total_score": total_score,
        "max_score": float(MAX_PER_CRITERION),
        "grade": grade,
        "grade_label": grade_label,
        "criteria_breakdown": breakdown,
        "priority_gaps": top_gaps,
        "criteria_count": len(INDEX_CRITERIA),
        "criteria_scored": sum(1 for c in INDEX_CRITERIA if scores.get(c["id"], 0) > 0),
        "methodology": "Akan & Şendurur (2016) — 30 büyükşehir belediyesi, 0-4 ölçek | SDG-eşleşmeli",
    }
