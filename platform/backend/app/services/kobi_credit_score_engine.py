"""
KOBİ ESG Kredi Skoru Motoru
Metodoloji: Ziraat Bankası 33-soru modeline dayalı, PCAF uyumlu
Ağırlık: E(40%) + S(30%) + G(30%)
Derecelendirme: AAA → D (MSCI/S&P uyumlu)
Banka Risk Kategorisi: A (Prime) / B+ (İyi) / B- (İzlemede) / C (Riskli)
"""
from typing import Any

# ── Pillar ağırlıkları ─────────────────────────────────────────────────────────
PILLAR_WEIGHTS = {"E": 0.40, "S": 0.30, "G": 0.30}

# ── 33 Soru (11 Çevresel + 11 Sosyal + 11 Yönetişim) ─────────────────────────
ESG_QUESTIONS: list[dict] = [
    # ---- ÇEVRESEL (E) — 11 soru ------------------------------------------------
    {
        "id": "E01", "pillar": "E", "weight": 12,
        "en": "Do you measure GHG emissions (Scope 1+2)?",
        "tr": "Sera gazı emisyonlarını (Kapsam 1+2) ölçüyor musunuz?",
        "red_flag": False,
        "action": "Implement ISO 14064 / KGK TSRS 2 methodology for Scope 1+2 measurement",
    },
    {
        "id": "E02", "pillar": "E", "weight": 10,
        "en": "Do you have a GHG reduction target (SBTi or equivalent)?",
        "tr": "Sera gazı azaltım hedefiniz var mı (SBTi veya eşdeğeri)?",
        "red_flag": False,
        "action": "Set science-based targets aligned with 1.5°C pathway",
    },
    {
        "id": "E03", "pillar": "E", "weight": 10,
        "en": "Do you measure total energy consumption (GJ or MWh)?",
        "tr": "Toplam enerji tüketiminizi (GJ veya MWh) ölçüyor musunuz?",
        "red_flag": False,
        "action": "Install smart meters and create annual energy baseline report",
    },
    {
        "id": "E04", "pillar": "E", "weight": 8,
        "en": "Do you use or procure renewable energy (solar/wind/hydro)?",
        "tr": "Yenilenebilir enerji (güneş/rüzgar/hidro) kullanıyor veya satın alıyor musunuz?",
        "red_flag": False,
        "action": "Switch to green tariff or install on-site renewables (I-REC / YEKA)",
    },
    {
        "id": "E05", "pillar": "E", "weight": 8,
        "en": "Do you measure water withdrawal and consumption?",
        "tr": "Su çekimi ve tüketimini ölçüyor musunuz?",
        "red_flag": False,
        "action": "Implement ISO 14046 water footprint assessment",
    },
    {
        "id": "E06", "pillar": "E", "weight": 10,
        "en": "Do you have an environmental management system (ISO 14001 or equivalent)?",
        "tr": "Çevre yönetim sisteminiz var mı (ISO 14001 veya eşdeğeri)?",
        "red_flag": False,
        "action": "Obtain ISO 14001 certification or implement equivalent internal EMS",
    },
    {
        "id": "E07", "pillar": "E", "weight": 8,
        "en": "Do you track waste generation and recycling rates?",
        "tr": "Atık üretim ve geri dönüşüm oranlarını takip ediyor musunuz?",
        "red_flag": False,
        "action": "Implement waste tracking system aligned with ESRS E5",
    },
    {
        "id": "E08", "pillar": "E", "weight": 8,
        "en": "Are you exposed to significant climate physical risks (flood/drought/heat)?",
        "tr": "Önemli iklim fiziksel risklerine maruz kalıyor musunuz (sel/kuraklık/sıcaklık)?",
        "red_flag": True,
        "action": "Conduct TCFD-aligned physical risk assessment for key assets",
    },
    {
        "id": "E09", "pillar": "E", "weight": 8,
        "en": "Do you have a formal climate transition plan?",
        "tr": "Resmi bir iklim geçiş planınız var mı?",
        "red_flag": False,
        "action": "Develop transition plan per UK CTPR / TSRS 2 §B36 requirements",
    },
    {
        "id": "E10", "pillar": "E", "weight": 8,
        "en": "Do you assess biodiversity and land-use impact?",
        "tr": "Biyoçeşitlilik ve arazi kullanım etkisini değerlendiriyor musunuz?",
        "red_flag": False,
        "action": "Implement TNFD LEAP approach for nature-related disclosures",
    },
    {
        "id": "E11", "pillar": "E", "weight": 10,
        "en": "No environmental compliance violations in the last 3 years?",
        "tr": "Son 3 yılda çevresel mevzuat ihlali bulunmuyor mu?",
        "red_flag": True,
        "action": "Resolve all open enforcement actions and establish compliance calendar",
    },

    # ---- SOSYAL (S) — 11 soru -------------------------------------------------
    {
        "id": "S01", "pillar": "S", "weight": 12,
        "en": "Do you track employee H&S incidents (TRIR / LTIFR)?",
        "tr": "Çalışan sağlık ve güvenlik olaylarını (TRIR/LTIFR) takip ediyor musunuz?",
        "red_flag": False,
        "action": "Implement ISO 45001 OHS Management System and report TRIR annually",
    },
    {
        "id": "S02", "pillar": "S", "weight": 10,
        "en": "Do you have a formal Occupational H&S management system?",
        "tr": "Resmi bir iş sağlığı ve güvenliği yönetim sisteminiz (ISO 45001) var mı?",
        "red_flag": False,
        "action": "Certify or self-assess against ISO 45001:2018",
    },
    {
        "id": "S03", "pillar": "S", "weight": 8,
        "en": "Do you provide structured employee training and development programs?",
        "tr": "Yapılandırılmış çalışan eğitim ve gelişim programları sunuyor musunuz?",
        "red_flag": False,
        "action": "Track training hours per employee and set annual improvement targets",
    },
    {
        "id": "S04", "pillar": "S", "weight": 10,
        "en": "Do you have a written diversity, equity & inclusion (DEI) policy?",
        "tr": "Yazılı bir çeşitlilik, eşitlik ve kapsayıcılık (ÇEK) politikanız var mı?",
        "red_flag": False,
        "action": "Draft DEI policy and set gender representation targets for management",
    },
    {
        "id": "S05", "pillar": "S", "weight": 8,
        "en": "Do you conduct annual employee engagement or satisfaction surveys?",
        "tr": "Yıllık çalışan bağlılığı veya memnuniyet anketleri yapıyor musunuz?",
        "red_flag": False,
        "action": "Implement annual pulse survey and publish engagement score",
    },
    {
        "id": "S06", "pillar": "S", "weight": 10,
        "en": "Do you have a supplier code of conduct (ESG requirements)?",
        "tr": "Tedarikçi davranış kurallarınız var mı (ESG gereksinimleri içeriyor mu)?",
        "red_flag": False,
        "action": "Develop supplier CoC aligned with RBA/ISO 26000",
    },
    {
        "id": "S07", "pillar": "S", "weight": 8,
        "en": "Do you conduct ESG audits of key suppliers?",
        "tr": "Kilit tedarikçilerinizin ESG denetimlerini yapıyor musunuz?",
        "red_flag": False,
        "action": "Screen top-10 suppliers using SustainHub Supplier ESG Audit module",
    },
    {
        "id": "S08", "pillar": "S", "weight": 8,
        "en": "No significant labour disputes or strikes in the last 3 years?",
        "tr": "Son 3 yılda önemli iş uyuşmazlığı veya grev yaşanmadı mı?",
        "red_flag": True,
        "action": "Establish social dialogue mechanisms and grievance redress system",
    },
    {
        "id": "S09", "pillar": "S", "weight": 10,
        "en": "Do you have a formal community engagement or social impact program?",
        "tr": "Resmi bir toplum katılımı veya sosyal etki programınız var mı?",
        "red_flag": False,
        "action": "Establish community liaison committee and annual social impact report",
    },
    {
        "id": "S10", "pillar": "S", "weight": 8,
        "en": "Do you track and disclose % of women in senior management?",
        "tr": "Üst yönetimdeki kadın oranını takip ve açıklıyor musunuz?",
        "red_flag": False,
        "action": "Disclose gender pay gap and set gender balance targets",
    },
    {
        "id": "S11", "pillar": "S", "weight": 8,
        "en": "No human rights violations or child/forced labour findings?",
        "tr": "İnsan hakları ihlali veya çocuk/zorla çalıştırma bulgusu yok mu?",
        "red_flag": True,
        "action": "Conduct human rights due diligence aligned with UN Guiding Principles",
    },

    # ---- YÖNETİŞİM (G) — 11 soru ---------------------------------------------
    {
        "id": "G01", "pillar": "G", "weight": 12,
        "en": "Is there a board-level body or committee overseeing ESG/sustainability?",
        "tr": "ESG/sürdürülebilirliği denetleyen yönetim kurulu düzeyinde bir komite var mı?",
        "red_flag": False,
        "action": "Establish ESG Committee with board-level mandate and quarterly reporting",
    },
    {
        "id": "G02", "pillar": "G", "weight": 10,
        "en": "Do you have a formal anti-corruption and anti-bribery policy?",
        "tr": "Resmi bir yolsuzlukla mücadele ve rüşvet önleme politikanız var mı?",
        "red_flag": False,
        "action": "Implement ISO 37001 ABMS or equivalent anti-corruption controls",
    },
    {
        "id": "G03", "pillar": "G", "weight": 10,
        "en": "Do you have an operational whistleblower/speak-up channel?",
        "tr": "İşlevsel bir ihbar/şikayet kanalınız var mı?",
        "red_flag": False,
        "action": "Deploy confidential whistleblower hotline aligned with EU Directive 2019/1937",
    },
    {
        "id": "G04", "pillar": "G", "weight": 8,
        "en": "Are your financial statements independently audited?",
        "tr": "Mali tablolarınız bağımsız denetimden geçiyor mu?",
        "red_flag": False,
        "action": "Engage accredited independent auditor; consider limited assurance for ESG data",
    },
    {
        "id": "G05", "pillar": "G", "weight": 10,
        "en": "Do you publish an annual ESG / sustainability report (GRI / TSRS / ISSB)?",
        "tr": "Yıllık ESG / sürdürülebilirlik raporu yayınlıyor musunuz (GRI/TSRS/ISSB)?",
        "red_flag": False,
        "action": "Publish first ESG report using SustainHub Report Builder; target GRI Core",
    },
    {
        "id": "G06", "pillar": "G", "weight": 10,
        "en": "No regulatory or legal sanctions in the last 3 years?",
        "tr": "Son 3 yılda düzenleyici veya yasal yaptırım yok mu?",
        "red_flag": True,
        "action": "Remediate all open enforcement matters; implement compliance calendar",
    },
    {
        "id": "G07", "pillar": "G", "weight": 8,
        "en": "Do you have a data privacy and cybersecurity policy (KVKK/GDPR/ISO 27001)?",
        "tr": "Veri gizliliği ve siber güvenlik politikanız var mı (KVKK/GDPR/ISO 27001)?",
        "red_flag": False,
        "action": "Achieve KVKK compliance and develop ISO 27001 roadmap",
    },
    {
        "id": "G08", "pillar": "G", "weight": 8,
        "en": "Is executive compensation linked to ESG performance metrics?",
        "tr": "Yönetici ücretlendirmesi ESG performans hedeflerine bağlı mı?",
        "red_flag": False,
        "action": "Introduce ESG KPIs (GHG reduction, TRIR) into executive incentive plan",
    },
    {
        "id": "G09", "pillar": "G", "weight": 8,
        "en": "Do you have independent board representation (>30% independent)?",
        "tr": "Yönetim kurulunuzda bağımsız üye oranı >%30 mi?",
        "red_flag": False,
        "action": "Increase board independence to meet SPK/CMB best-practice standards",
    },
    {
        "id": "G10", "pillar": "G", "weight": 8,
        "en": "Do you have a formal enterprise risk management (ERM) framework?",
        "tr": "Resmi bir kurumsal risk yönetimi (KRY) çerçeveniz var mı?",
        "red_flag": False,
        "action": "Implement COSO ERM 2017 or ISO 31000:2018 risk management standard",
    },
    {
        "id": "G11", "pillar": "G", "weight": 8,
        "en": "Have you fully disclosed related-party transactions in the last 3 years?",
        "tr": "Son 3 yılda ilişkili taraf işlemlerini tam olarak açıkladınız mı?",
        "red_flag": True,
        "action": "Ensure RPT disclosures comply with TMS 24 / IAS 24 requirements",
    },
]

# ── Derecelendirme eşikleri ────────────────────────────────────────────────────
RATING_THRESHOLDS: list[tuple[int, str, str]] = [
    (90, "AAA", "Lider — Best-in-Class ESG Performance"),
    (80, "AA",  "Güçlü — Strong ESG Management"),
    (70, "A",   "İyi — Good ESG Practices"),
    (60, "BBB", "Ortalama — Average with Improvement Areas"),
    (50, "BB",  "Zayıf — Below Average, Notable Gaps"),
    (40, "B",   "Riskli — Significant ESG Weaknesses"),
    (25, "CCC", "Yüksek Risk — Poor ESG Management"),
    (0,  "D",   "Kritik — Non-compliant / Major Violations"),
]

# ── Banka risk kategorisi (Ziraat Bankası A/B+/B-/C modeli) ───────────────────
BANK_CATEGORIES: list[dict] = [
    {
        "category": "A",
        "label": "Prime Borçlu",
        "min_score": 75,
        "pd_max_pct": 2.0,
        "color": "#10b981",
        "description": "Mükemmel ESG profili — tercihli faiz oranı ve uzun vadeli finansman hakkı kazanır.",
        "financing": "Yeşil Kredi / Sürdürülebilirliğe Bağlı Kredi (SLL) — SOFR+100bps",
    },
    {
        "category": "B+",
        "label": "İyi Borçlu",
        "min_score": 55,
        "pd_max_pct": 5.0,
        "color": "#3b82f6",
        "description": "Sağlıklı ESG profili — standart yeşil kredi. 12 ay içinde A kategorisine yükseltme hedeflenebilir.",
        "financing": "Standart Yeşil Kredi — SOFR+150bps",
    },
    {
        "category": "B-",
        "label": "İzlemede",
        "min_score": 35,
        "pd_max_pct": 10.0,
        "color": "#f59e0b",
        "description": "Orta ESG profili — iyileştirme planı zorunlu. 6 aylık gelişim takibi yapılır.",
        "financing": "Geçiş Kredisi + 6 Aylık ESG Milestone Takibi",
    },
    {
        "category": "C",
        "label": "Yüksek Riskli",
        "min_score": 0,
        "pd_max_pct": 99.0,
        "color": "#ef4444",
        "description": "Zayıf ESG profili — gelişmiş durum tespiti zorunlu. Finansman kısıtlanabilir.",
        "financing": "Gelişmiş Durum Tespiti (EDD) + Şartlı Finansman",
    },
]

# ── Sektör kıyaslaması (KOBİ ortalamaları) ────────────────────────────────────
SECTOR_BENCHMARKS: dict[str, dict] = {
    "manufacturing":  {"sector_avg": 52, "top_quartile": 71, "label": "İmalat"},
    "construction":   {"sector_avg": 44, "top_quartile": 63, "label": "İnşaat"},
    "retail_trade":   {"sector_avg": 48, "top_quartile": 67, "label": "Perakende"},
    "food_beverage":  {"sector_avg": 55, "top_quartile": 74, "label": "Gıda & İçecek"},
    "textile":        {"sector_avg": 50, "top_quartile": 68, "label": "Tekstil"},
    "logistics":      {"sector_avg": 46, "top_quartile": 64, "label": "Lojistik"},
    "agriculture":    {"sector_avg": 38, "top_quartile": 58, "label": "Tarım"},
    "technology":     {"sector_avg": 63, "top_quartile": 80, "label": "Teknoloji"},
    "healthcare":     {"sector_avg": 60, "top_quartile": 77, "label": "Sağlık"},
    "financial_svc":  {"sector_avg": 65, "top_quartile": 82, "label": "Finansal Hizmetler"},
}


def _get_rating(score: float) -> tuple[str, str]:
    for threshold, grade, label in RATING_THRESHOLDS:
        if score >= threshold:
            return grade, label
    return "D", "Kritik — Non-compliant / Major Violations"


def _get_bank_category(score: float) -> dict:
    for cat in BANK_CATEGORIES:
        if score >= cat["min_score"]:
            return cat
    return BANK_CATEGORIES[-1]


def calculate_kobi_credit_score(
    company_name: str,
    sector: str,
    answers: dict[str, int],  # question_id → 0 or 1 (partial: 0/1 only)
) -> dict[str, Any]:
    """
    answers: {question_id: 0 or 1}
    Missing questions treated as 0 (unanswered = not compliant).
    Returns full assessment with rating, bank category, gaps, action plan.
    """
    pillar_scores: dict[str, float] = {"E": 0, "S": 0, "G": 0}
    pillar_max: dict[str, float]    = {"E": 0, "S": 0, "G": 0}
    red_flags: list[dict] = []
    gaps: list[dict] = []

    for q in ESG_QUESTIONS:
        pid = q["pillar"]
        w   = q["weight"]
        pillar_max[pid] += w
        val = answers.get(q["id"], 0)
        pillar_scores[pid] += val * w

        if val == 0:
            gaps.append({
                "id": q["id"],
                "pillar": pid,
                "question_tr": q["tr"],
                "action": q["action"],
                "weight": w,
            })
        if q["red_flag"] and val == 0:
            red_flags.append({
                "id": q["id"],
                "pillar": pid,
                "question_tr": q["tr"],
                "severity": "HIGH" if w >= 10 else "MEDIUM",
            })

    # Pillar percentages (0–100)
    pillar_pct = {
        p: round(pillar_scores[p] / pillar_max[p] * 100, 1) if pillar_max[p] else 0
        for p in ("E", "S", "G")
    }

    # Weighted total score
    total_score = round(
        pillar_pct["E"] * PILLAR_WEIGHTS["E"]
        + pillar_pct["S"] * PILLAR_WEIGHTS["S"]
        + pillar_pct["G"] * PILLAR_WEIGHTS["G"],
        1,
    )

    rating, rating_label = _get_rating(total_score)
    bank_cat = _get_bank_category(total_score)

    bench = SECTOR_BENCHMARKS.get(sector, {"sector_avg": 50, "top_quartile": 70, "label": sector})
    percentile = round(
        min(99, max(1, (total_score / bench["top_quartile"]) * 75)), 0
    )

    # Top-5 priority gaps (by weight desc)
    top_gaps = sorted(gaps, key=lambda x: -x["weight"])[:5]

    return {
        "company_name": company_name,
        "sector": sector,
        "sector_label": bench["label"],
        "total_score": total_score,
        "rating": rating,
        "rating_label": rating_label,
        "bank_category": bank_cat["category"],
        "bank_category_label": bank_cat["label"],
        "bank_category_description": bank_cat["description"],
        "bank_financing_note": bank_cat["financing"],
        "bank_category_color": bank_cat["color"],
        "pd_max_pct": bank_cat["pd_max_pct"],
        "pillar_scores": pillar_pct,
        "pillar_weights": PILLAR_WEIGHTS,
        "red_flags": red_flags,
        "red_flag_count": len(red_flags),
        "gap_count": len(gaps),
        "top_priority_gaps": top_gaps,
        "sector_avg": bench["sector_avg"],
        "sector_top_quartile": bench["top_quartile"],
        "percentile": percentile,
        "questions_answered": sum(1 for v in answers.values() if v > 0),
        "total_questions": len(ESG_QUESTIONS),
    }


# ── Demo verisi — Örnek KOBİ ─────────────────────────────────────────────────
DEMO_ANSWERS: dict[str, int] = {
    "E01": 1, "E02": 0, "E03": 1, "E04": 0, "E05": 1,
    "E06": 0, "E07": 1, "E08": 0, "E09": 0, "E10": 0, "E11": 1,
    "S01": 1, "S02": 1, "S03": 1, "S04": 0, "S05": 0,
    "S06": 1, "S07": 0, "S08": 1, "S09": 0, "S10": 0, "S11": 1,
    "G01": 0, "G02": 1, "G03": 0, "G04": 1, "G05": 0,
    "G06": 1, "G07": 1, "G08": 0, "G09": 0, "G10": 1, "G11": 1,
}

DEMO_RESULT = calculate_kobi_credit_score(
    company_name="Örnek Tekstil A.Ş.",
    sector="textile",
    answers=DEMO_ANSWERS,
)
