"""
GRI Universal Standards 2021 — Disclosure Tracker & Completeness Scoring
GRI 2 (General Disclosures), GRI 3 (Material Topics),
GRI 302 (Energy), GRI 303 (Water), GRI 305 (Emissions),
GRI 306 (Waste), GRI 401 (Employment), GRI 403 (OHS)
"""
from typing import Any

# ── GRI Standard Definitions ──────────────────────────────────────────────────
GRI_STANDARDS: list[dict] = [
    {
        "code": "GRI 2", "title": "Genel İfşaatlar", "year": 2021, "icon": "🏛️",
        "color": "#10b981", "category": "universal", "weight": 20,
        "disclosures": [
            {"id": "2-1", "title": "Kurumsal detaylar", "required": True, "esrs": "ESRS 2 BP-1"},
            {"id": "2-2", "title": "Sürdürülebilirlik raporlamasına dahil edilen kurumlar", "required": True, "esrs": "ESRS 2 BP-2"},
            {"id": "2-3", "title": "Raporlama dönemi, sıklığı ve iletişim noktası", "required": True, "esrs": None},
            {"id": "2-4", "title": "Yeniden ifadelerin sebebi", "required": False, "esrs": None},
            {"id": "2-5", "title": "Harici güvence", "required": False, "esrs": "ESRS 2 BP-4"},
            {"id": "2-6", "title": "Faaliyetler, değer zinciri, diğer iş ilişkileri", "required": True, "esrs": "ESRS 2 SBM-1"},
            {"id": "2-7", "title": "Çalışanlar", "required": True, "esrs": "ESRS S1-6"},
            {"id": "2-9", "title": "Yönetim yapısı ve kompozisyonu", "required": True, "esrs": "ESRS G1-1"},
            {"id": "2-14", "title": "Yönetim kurulunun etki sürecindeki rolü", "required": True, "esrs": "ESRS 2 GOV-1"},
            {"id": "2-22", "title": "Sürdürülebilir kalkınma taahhüdü beyanı", "required": True, "esrs": None},
            {"id": "2-28", "title": "Üyelik dernekleri", "required": False, "esrs": None},
            {"id": "2-29", "title": "Paydaş katılımına yaklaşım", "required": True, "esrs": "ESRS 2 SBM-2"},
        ],
    },
    {
        "code": "GRI 3", "title": "Materyal Konular", "year": 2021, "icon": "🎯",
        "color": "#3b82f6", "category": "universal", "weight": 15,
        "disclosures": [
            {"id": "3-1", "title": "Önemlilik değerlendirmesi süreci", "required": True, "esrs": "ESRS 2 IRO-1"},
            {"id": "3-2", "title": "Materyal konuların listesi", "required": True, "esrs": "ESRS 2 IRO-2"},
            {"id": "3-3", "title": "Her materyal konu için yönetim", "required": True, "esrs": None},
        ],
    },
    {
        "code": "GRI 302", "title": "Enerji", "year": 2016, "icon": "⚡",
        "color": "#f59e0b", "category": "environment", "weight": 12,
        "disclosures": [
            {"id": "302-1", "title": "Kurum içinde tüketilen enerji", "required": True, "esrs": "ESRS E1-5"},
            {"id": "302-2", "title": "Kurum dışında tüketilen enerji", "required": False, "esrs": "ESRS E1-5"},
            {"id": "302-3", "title": "Enerji yoğunluğu", "required": True, "esrs": "ESRS E1-5"},
            {"id": "302-4", "title": "Enerji tüketiminde azalma", "required": True, "esrs": "ESRS E1-5"},
            {"id": "302-5", "title": "Ürün ve hizmetlerde enerji azaltma gereksinimleri", "required": False, "esrs": None},
        ],
    },
    {
        "code": "GRI 303", "title": "Su ve Atık Sular", "year": 2018, "icon": "💧",
        "color": "#06b6d4", "category": "environment", "weight": 8,
        "disclosures": [
            {"id": "303-1", "title": "Paylaşılan kaynaklar olarak suyla etkileşim", "required": True, "esrs": "ESRS E3-1"},
            {"id": "303-2", "title": "Tahliyeyle ilgili etkilerin yönetimi", "required": False, "esrs": None},
            {"id": "303-3", "title": "Su çekimi", "required": True, "esrs": "ESRS E3-4"},
            {"id": "303-4", "title": "Su tahliyesi", "required": True, "esrs": "ESRS E3-4"},
            {"id": "303-5", "title": "Su tüketimi", "required": True, "esrs": "ESRS E3-4"},
        ],
    },
    {
        "code": "GRI 305", "title": "Emisyonlar", "year": 2016, "icon": "🌿",
        "color": "#10b981", "category": "environment", "weight": 20,
        "disclosures": [
            {"id": "305-1", "title": "Kapsam 1 — Direkt GHG emisyonları", "required": True, "esrs": "ESRS E1-6"},
            {"id": "305-2", "title": "Kapsam 2 — Dolaylı GHG emisyonları (enerji)", "required": True, "esrs": "ESRS E1-6"},
            {"id": "305-3", "title": "Kapsam 3 — Diğer dolaylı GHG emisyonları", "required": True, "esrs": "ESRS E1-6"},
            {"id": "305-4", "title": "GHG emisyon yoğunluğu", "required": True, "esrs": "ESRS E1-6"},
            {"id": "305-5", "title": "GHG emisyonlarında azaltma", "required": True, "esrs": "ESRS E1-7"},
            {"id": "305-6", "title": "Ozon tabakasını incelten madde emisyonları", "required": False, "esrs": None},
            {"id": "305-7", "title": "Azot oksitler, kükürt oksitler ve diğer hava emisyonları", "required": False, "esrs": "ESRS E2-6"},
        ],
    },
    {
        "code": "GRI 306", "title": "Atıklar", "year": 2020, "icon": "♻️",
        "color": "#8b5cf6", "category": "environment", "weight": 8,
        "disclosures": [
            {"id": "306-1", "title": "Atık üretimi ve atıkla ilgili önemli etkiler", "required": True, "esrs": "ESRS E5-4"},
            {"id": "306-2", "title": "Atıkla ilgili önemli etkilerin yönetimi", "required": True, "esrs": "ESRS E5-4"},
            {"id": "306-3", "title": "Oluşturulan atık", "required": True, "esrs": "ESRS E5-4"},
            {"id": "306-4", "title": "Sahadaki atık sapması", "required": False, "esrs": None},
            {"id": "306-5", "title": "Depolamaya yönlendirilen atık", "required": False, "esrs": None},
        ],
    },
    {
        "code": "GRI 401", "title": "İstihdam", "year": 2016, "icon": "👥",
        "color": "#ec4899", "category": "social", "weight": 10,
        "disclosures": [
            {"id": "401-1", "title": "Yeni çalışan alımı ve çalışan devir oranı", "required": True, "esrs": "ESRS S1-1"},
            {"id": "401-2", "title": "Tam zamanlı çalışanlara sağlanan yardımlar (yarı zamanlılara sağlanmayan)", "required": True, "esrs": "ESRS S1-10"},
            {"id": "401-3", "title": "Ebeveyn izni", "required": False, "esrs": "ESRS S1-15"},
        ],
    },
    {
        "code": "GRI 403", "title": "İş Sağlığı ve Güvenliği", "year": 2018, "icon": "🦺",
        "color": "#ef4444", "category": "social", "weight": 7,
        "disclosures": [
            {"id": "403-1", "title": "İş sağlığı ve güvenliği yönetim sistemi", "required": True, "esrs": "ESRS S1-1"},
            {"id": "403-2", "title": "Tehlike tanımlama, risk değerlendirmesi ve kaza soruşturması", "required": True, "esrs": None},
            {"id": "403-5", "title": "Çalışanlar için iş sağlığı ve güvenliği eğitimi", "required": True, "esrs": "ESRS S1-13"},
            {"id": "403-9", "title": "İşle ilgili yaralanmalar", "required": True, "esrs": "ESRS S1-14"},
            {"id": "403-10", "title": "İşle ilgili rahatsızlıklar", "required": False, "esrs": "ESRS S1-14"},
        ],
    },
]

CATEGORY_META = {
    "universal":    {"label": "Evrensel", "color": "#10b981"},
    "environment":  {"label": "Çevre",   "color": "#3b82f6"},
    "social":       {"label": "Sosyal",  "color": "#ec4899"},
    "governance":   {"label": "Yönetim", "color": "#8b5cf6"},
}


# ── Completeness scorer ────────────────────────────────────────────────────────
def score_gri_completeness(
    completed_ids: list[str],
    maturity_score: float = 50.0,
) -> dict[str, Any]:
    """
    Score GRI disclosure completeness.
    completed_ids: list of disclosure IDs marked as completed (e.g. ['2-1', '305-1', ...])
    """
    completed_set = set(completed_ids)

    standards_out = []
    total_required = 0
    total_completed_required = 0
    total_disclosures = 0
    total_completed = 0

    for std in GRI_STANDARDS:
        req_count = sum(1 for d in std["disclosures"] if d["required"])
        comp_req = sum(1 for d in std["disclosures"] if d["required"] and d["id"] in completed_set)
        comp_all = sum(1 for d in std["disclosures"] if d["id"] in completed_set)
        total = len(std["disclosures"])

        req_pct = round(comp_req / req_count * 100) if req_count > 0 else 0
        all_pct = round(comp_all / total * 100) if total > 0 else 0

        total_required += req_count
        total_completed_required += comp_req
        total_disclosures += total
        total_completed += comp_all

        standards_out.append({
            **{k: std[k] for k in ("code", "title", "year", "icon", "color", "category", "weight")},
            "required_count": req_count,
            "completed_required": comp_req,
            "completed_all": comp_all,
            "total_disclosures": total,
            "required_pct": req_pct,
            "all_pct": all_pct,
            "disclosures": [
                {**d, "completed": d["id"] in completed_set}
                for d in std["disclosures"]
            ],
        })

    overall_required_pct = round(total_completed_required / total_required * 100) if total_required else 0
    overall_pct = round(total_completed / total_disclosures * 100) if total_disclosures else 0

    grade = "Başlangıç"
    grade_color = "#ef4444"
    if overall_required_pct >= 90:
        grade, grade_color = "Tam Uyum (A)", "#10b981"
    elif overall_required_pct >= 70:
        grade, grade_color = "İleri (B)", "#3b82f6"
    elif overall_required_pct >= 50:
        grade, grade_color = "Gelişmekte (C)", "#f59e0b"
    elif overall_required_pct >= 25:
        grade, grade_color = "Temel (D)", "#f97316"

    return {
        "total_required": total_required,
        "completed_required": total_completed_required,
        "total_disclosures": total_disclosures,
        "completed_all": total_completed,
        "overall_required_pct": overall_required_pct,
        "overall_pct": overall_pct,
        "grade": grade,
        "grade_color": grade_color,
        "standards": standards_out,
        "gaps": _top_gaps(standards_out),
        "esrs_crosswalk": _esrs_crosswalk(completed_set),
    }


def _top_gaps(standards: list[dict]) -> list[dict]:
    gaps = []
    for s in standards:
        missing = [d for d in s["disclosures"] if d["required"] and not d["completed"]]
        if missing:
            gaps.append({
                "standard_code": s["code"],
                "standard_title": s["title"],
                "icon": s["icon"],
                "color": s["color"],
                "missing_count": len(missing),
                "required_pct": s["required_pct"],
                "top_missing": [d["id"] + " " + d["title"] for d in missing[:3]],
            })
    return sorted(gaps, key=lambda x: x["required_pct"])[:5]


def _esrs_crosswalk(completed: set) -> list[dict]:
    seen: set[str] = set()
    crosswalk = []
    for std in GRI_STANDARDS:
        for d in std["disclosures"]:
            if d.get("esrs") and d["id"] in completed and d["esrs"] not in seen:
                seen.add(d["esrs"])
                crosswalk.append({"gri": d["id"], "gri_title": d["title"], "esrs": d["esrs"]})
    return crosswalk


# ── Demo auto-complete based on maturity_score ────────────────────────────────
def demo_completed_ids(maturity_score: float = 58.0) -> list[str]:
    """Generate realistic completed disclosure IDs based on maturity."""
    completed = []
    for std in GRI_STANDARDS:
        for d in std["disclosures"]:
            # Required + high maturity → complete; optional → less likely
            threshold = 40 if d["required"] else 70
            # Each disclosure has a pseudo-random factor based on its ID hash
            factor = (hash(d["id"]) % 30)
            if (maturity_score + factor) >= threshold:
                completed.append(d["id"])
    return completed


DEMO_RESULT = score_gri_completeness(
    completed_ids=demo_completed_ids(58.0),
    maturity_score=58.0,
)
