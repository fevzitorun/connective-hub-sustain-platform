"""
CDP 2024 Climate Change Questionnaire Engine
Scoring: A / A- / B / B- / C / C- / D / D-
Modules: C0 Intro → C12 Engagement
"""
from dataclasses import dataclass, field
from typing import Any

# ── CDP Score bands ────────────────────────────────────────────────────────────
CDP_BANDS = [
    {"min": 90, "grade": "A",  "label": "Leadership",   "color": "#10b981"},
    {"min": 80, "grade": "A-", "label": "Leadership",   "color": "#34d399"},
    {"min": 70, "grade": "B",  "label": "Management",   "color": "#3b82f6"},
    {"min": 60, "grade": "B-", "label": "Management",   "color": "#60a5fa"},
    {"min": 50, "grade": "C",  "label": "Awareness",    "color": "#f59e0b"},
    {"min": 40, "grade": "C-", "label": "Awareness",    "color": "#fbbf24"},
    {"min": 30, "grade": "D",  "label": "Disclosure",   "color": "#ef4444"},
    {"min": 0,  "grade": "D-", "label": "Disclosure",   "color": "#f87171"},
]

# ── CDP 2024 Questionnaire Sections ───────────────────────────────────────────
CDP_SECTIONS = [
    {
        "code": "C1", "title": "Yönetişim", "weight": 10, "icon": "🏛️",
        "questions": [
            {"id": "C1.1", "q": "Yönetim kurulu iklim değişikliğini gözetmekte mi?", "max": 4},
            {"id": "C1.2", "q": "İklim konuları yönetim kurulu gündemine alınıyor mu?", "max": 3},
            {"id": "C1.3", "q": "İklim sorumluluğu üst yönetime atanmış mı?", "max": 3},
        ],
    },
    {
        "code": "C2", "title": "Risk ve Fırsatlar", "weight": 15, "icon": "⚠️",
        "questions": [
            {"id": "C2.1", "q": "İklim ile ilgili riskler belirlendi mi?", "max": 5},
            {"id": "C2.2", "q": "Riskler finansal etkiye göre değerlendirildi mi?", "max": 5},
            {"id": "C2.3", "q": "İklim ile ilgili fırsatlar belirlendi mi?", "max": 5},
        ],
    },
    {
        "code": "C3", "title": "İş Stratejisi", "weight": 15, "icon": "🎯",
        "questions": [
            {"id": "C3.1", "q": "İklim değişikliği iş stratejisini etkiliyor mu?", "max": 5},
            {"id": "C3.2", "q": "Farklı iklim senaryoları değerlendirildi mi (1.5°C, 2°C, 4°C)?", "max": 5},
            {"id": "C3.3", "q": "Karbon nötr / net sıfır stratejisi var mı?", "max": 5},
        ],
    },
    {
        "code": "C4", "title": "Hedefler ve Performans", "weight": 20, "icon": "📊",
        "questions": [
            {"id": "C4.1", "q": "Mutlak emisyon azaltma hedefi belirlenmiş mi?", "max": 6},
            {"id": "C4.2", "q": "Hedef SBTi ile uyumlu mu?", "max": 7},
            {"id": "C4.3", "q": "Hedeflere karşı ilerleme izleniyor mu?", "max": 7},
        ],
    },
    {
        "code": "C5-C6", "title": "Emisyon Verisi", "weight": 15, "icon": "🌿",
        "questions": [
            {"id": "C5.1", "q": "Kapsam 1 & 2 emisyonları hesaplanmış mı?", "max": 5},
            {"id": "C6.1", "q": "Kapsam 3 emisyonları (en az 5 kategori) hesaplanmış mı?", "max": 5},
            {"id": "C6.5", "q": "Metodoloji belgelenmiş mi (GHG Protocol uyumu)?", "max": 5},
        ],
    },
    {
        "code": "C8", "title": "Enerji", "weight": 10, "icon": "⚡",
        "questions": [
            {"id": "C8.1", "q": "Toplam enerji tüketimi raporlandı mı?", "max": 4},
            {"id": "C8.2", "q": "Yenilenebilir enerji hedefi var mı (RE100)?", "max": 3},
            {"id": "C8.3", "q": "Enerji verimliliği girişimleri uygulandı mı?", "max": 3},
        ],
    },
    {
        "code": "C10", "title": "Doğrulama", "weight": 10, "icon": "✅",
        "questions": [
            {"id": "C10.1", "q": "Emisyon verileri 3. tarafça doğrulandı mı?", "max": 5},
            {"id": "C10.2", "q": "Doğrulama standardı belirtildi mi (ISO 14064-3, ISAE 3410)?", "max": 5},
        ],
    },
    {
        "code": "C11", "title": "Karbon Fiyatlandırma", "weight": 5, "icon": "💰",
        "questions": [
            {"id": "C11.1", "q": "İç karbon fiyatı uygulanıyor mu?", "max": 3},
            {"id": "C11.2", "q": "Karbon ofset/kredi satın alınıyor mu?", "max": 2},
        ],
    },
]

# ── CDP Auto-fill logic ────────────────────────────────────────────────────────
def autofill_from_platform(
    *,
    has_scope1: bool = True,
    has_scope2: bool = True,
    has_scope3: bool = False,
    has_sbti: bool = False,
    has_verification: bool = False,
    has_re_target: bool = False,
    has_carbon_price: bool = False,
    maturity_score: float = 50.0,
    sector: str = "manufacturing",
) -> dict[str, Any]:
    """Auto-fill CDP answers from SustainHub platform data."""

    def ms(frac: float) -> int:
        """Maturity-scaled score 0–10."""
        return round(min(frac * maturity_score / 100, frac) * 10)

    answers: dict[str, int] = {
        # Governance
        "C1.1": 3 if maturity_score >= 60 else 2,
        "C1.2": 3 if maturity_score >= 70 else 1,
        "C1.3": 3 if maturity_score >= 50 else 1,
        # Risk
        "C2.1": 5 if maturity_score >= 60 else 3,
        "C2.2": 4 if maturity_score >= 65 else 2,
        "C2.3": 4 if maturity_score >= 55 else 2,
        # Strategy
        "C3.1": 4 if maturity_score >= 60 else 2,
        "C3.2": 4 if maturity_score >= 70 else 1,
        "C3.3": 4 if maturity_score >= 75 else 1,
        # Targets
        "C4.1": 5 if maturity_score >= 60 else 2,
        "C4.2": 7 if has_sbti else (3 if maturity_score >= 65 else 0),
        "C4.3": 6 if maturity_score >= 55 else 3,
        # Emissions
        "C5.1": 5 if (has_scope1 and has_scope2) else (3 if has_scope1 else 0),
        "C6.1": 5 if has_scope3 else 0,
        "C6.5": 5 if maturity_score >= 50 else 2,
        # Energy
        "C8.1": 4 if maturity_score >= 50 else 2,
        "C8.2": 3 if has_re_target else 0,
        "C8.3": 3 if maturity_score >= 55 else 1,
        # Verification
        "C10.1": 5 if has_verification else 0,
        "C10.2": 5 if has_verification else 0,
        # Carbon pricing
        "C11.1": 3 if has_carbon_price else 0,
        "C11.2": 2 if has_carbon_price else 0,
    }
    return answers


def calculate_cdp_score(answers: dict[str, int]) -> dict[str, Any]:
    """Calculate total CDP score from question answers."""
    max_per_section: dict[str, int] = {}
    got_per_section: dict[str, int] = {}

    for sec in CDP_SECTIONS:
        max_s = sum(q["max"] for q in sec["questions"])
        got_s = sum(answers.get(q["id"], 0) for q in sec["questions"])
        max_per_section[sec["code"]] = max_s
        got_per_section[sec["code"]] = got_s

    total_max = sum(max_per_section.values())
    total_got = sum(got_per_section.values())
    pct = round(total_got / total_max * 100) if total_max > 0 else 0

    grade = "D-"
    grade_label = "Disclosure"
    grade_color = "#f87171"
    for band in CDP_BANDS:
        if pct >= band["min"]:
            grade = band["grade"]
            grade_label = band["label"]
            grade_color = band["color"]
            break

    sections_out = []
    for sec in CDP_SECTIONS:
        mx = max_per_section[sec["code"]]
        got = got_per_section[sec["code"]]
        sections_out.append({
            "code": sec["code"],
            "title": sec["title"],
            "icon": sec["icon"],
            "weight": sec["weight"],
            "score": got, "max": mx,
            "pct": round(got / mx * 100) if mx else 0,
        })

    gaps = [s for s in sections_out if s["pct"] < 60]
    gaps.sort(key=lambda x: x["pct"])

    return {
        "total_score": total_got,
        "total_max": total_max,
        "pct": pct,
        "grade": grade,
        "grade_label": grade_label,
        "grade_color": grade_color,
        "sections": sections_out,
        "top_gaps": gaps[:3],
        "actions": _recommended_actions(answers, pct),
    }


def _recommended_actions(answers: dict[str, int], pct: float) -> list[str]:
    actions = []
    if answers.get("C4.2", 0) < 5:
        actions.append("SBTi'ye bağlı bilimsel hedef belirleyin (CDP B→A için kritik)")
    if answers.get("C10.1", 0) == 0:
        actions.append("Emisyon verilerini ISO 14064-3 veya ISAE 3410 ile doğrulatın")
    if answers.get("C6.1", 0) == 0:
        actions.append("Kapsam 3 emisyonlarını (en az 5 kategori) hesaplayın ve açıklayın")
    if answers.get("C3.2", 0) < 3:
        actions.append("1.5°C ve 4°C iklim senaryosu analizleri yapın (TCFD uyumu)")
    if answers.get("C11.1", 0) == 0:
        actions.append("İç karbon fiyatı uygulayın (kurumsal iklim kültürü için önemli)")
    if pct < 50:
        actions.append("CDP yanıt sürecini resmileştirin ve yıllık takvime dahil edin")
    return actions[:5]


# ── Full assessment ────────────────────────────────────────────────────────────
def full_cdp_assessment(
    company_name: str,
    maturity_score: float = 58.0,
    has_scope3: bool = False,
    has_sbti: bool = False,
    has_verification: bool = False,
    has_re_target: bool = False,
    sector: str = "tekstil",
) -> dict[str, Any]:
    answers = autofill_from_platform(
        maturity_score=maturity_score,
        has_scope3=has_scope3,
        has_sbti=has_sbti,
        has_verification=has_verification,
        has_re_target=has_re_target,
        sector=sector,
    )
    result = calculate_cdp_score(answers)
    return {
        "company_name": company_name,
        "sector": sector,
        "maturity_score": maturity_score,
        **result,
        "answers": answers,
        "questionnaire": CDP_SECTIONS,
        "next_deadline": "2025-07-31",
        "submission_platform": "https://www.cdp.net",
    }


DEMO_RESULT = full_cdp_assessment(
    "Yıldız Tekstil A.Ş.",
    maturity_score=58,
    has_scope3=True,
    has_sbti=False,
    has_verification=False,
    has_re_target=True,
    sector="tekstil",
)
