"""
PCAF (Partnership for Carbon Accounting Financials) Engine
PCAF Standard v2 (2022) — Asset Class: Corporate Loans & Bonds
Scope 3 Category 15: Financed Emissions
"""
from dataclasses import dataclass
from typing import Literal

TaxonomyStatus = Literal["green", "transition", "brown"]
ESGGrade = Literal["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "D"]


# EU Taxonomy sector mapping by NACE code prefix
NACE_TAXONOMY: dict[str, TaxonomyStatus] = {
    "A01": "transition",   # Crop production
    "A03": "green",        # Aquaculture (sustainable)
    "C10": "transition",   # Food products
    "C13": "transition",   # Textile
    "C14": "transition",   # Apparel
    "C17": "transition",   # Paper
    "C20": "brown",        # Chemicals
    "C22": "transition",   # Rubber & plastics
    "C23": "brown",        # Non-metallic minerals (cement, glass)
    "C24": "brown",        # Basic metals (steel, aluminium)
    "C25": "transition",   # Fabricated metal
    "C26": "transition",   # Electronics
    "C28": "transition",   # Machinery
    "C29": "green",        # Motor vehicles (EVs)
    "C30": "transition",   # Other transport equipment
    "D35": "green",        # Electricity (renewables)
    "E36": "green",        # Water supply
    "F41": "green",        # Construction (green buildings)
    "F42": "transition",   # Civil engineering
    "G46": "transition",   # Wholesale trade
    "G47": "transition",   # Retail trade
    "H49": "transition",   # Land transport
    "H50": "transition",   # Water transport
    "H51": "brown",        # Air transport
    "H52": "transition",   # Warehousing
    "I55": "transition",   # Hotels
    "J62": "transition",   # IT services
    "K64": "transition",   # Banking
    "L68": "green",        # Real estate (green certified)
    "N77": "transition",   # Leasing
    "Q86": "transition",   # Healthcare
}

# Sector-level emission intensity (tCO2e per €1M revenue) — PCAF proxy data
SECTOR_INTENSITY: dict[str, float] = {
    "yenilenebilir_enerji": 12.0,
    "yesil_bina": 38.0,
    "elektrikli_tasit": 45.0,
    "cam_uretim": 420.0,
    "celik_uretim": 1_850.0,
    "kimya": 380.0,
    "tekstil": 155.0,
    "gida_icecek": 290.0,
    "perakende": 95.0,
    "lojistik": 340.0,
    "tarim": 580.0,
    "enerji_dagitim": 85.0,
    "insaat": 210.0,
    "turizm": 120.0,
    "finans": 45.0,
    "saglik": 75.0,
    "bilisim": 35.0,
}

# ESG grade thresholds (0–100 score)
ESG_GRADE_THRESHOLDS: list[tuple[int, str]] = [
    (90, "AAA"), (80, "AA"), (70, "A"), (60, "BBB"),
    (50, "BB"), (40, "B"), (30, "CCC"), (0, "D"),
]

# ── PCAF Veri Kalite Skoru (DQS) ─────────────────────────────────────────────
# PCAF Standard v2, Part B — Asset Class: Corporate Loans & Bonds
# DQS 1 (en iyi) → 5 (en kötü); banka portföy raporlarında ağırlıklı ortalama hesaplanır.
PCAF_DQS_LEVELS: list[dict] = [
    {
        "score": 1,
        "label": "Doğrulanmış Raporlanan Emisyonlar",
        "data_source": "Şirketin 3. tarafça denetlenmiş GHG raporu (Scope 1+2+3)",
        "accuracy": "En Yüksek",
        "color": "#10b981",
        "typical_use": "Büyük halka açık şirketler — TSRS/ISSB raporlaması var",
    },
    {
        "score": 2,
        "label": "Raporlanan Emisyonlar (Denetimsiz)",
        "data_source": "Şirketin kendi GHG raporu (bağımsız güvence yok)",
        "accuracy": "Yüksek",
        "color": "#3b82f6",
        "typical_use": "Orta ölçekli şirketler — sürdürülebilirlik raporu yayınlıyor",
    },
    {
        "score": 3,
        "label": "Aktivite Tabanlı Hesaplama",
        "data_source": "Aktivite verisi (enerji, yakıt, üretim) × emisyon faktörü",
        "accuracy": "Orta",
        "color": "#f59e0b",
        "typical_use": "Küçük şirketler — finansal+operasyonel verilerden tahmin",
    },
    {
        "score": 4,
        "label": "Ekonomik Aktivite Tahmini",
        "data_source": "Sektör emisyon yoğunluğu × ciro/EVIC",
        "accuracy": "Düşük-Orta",
        "color": "#f97316",
        "typical_use": "KOBİ portföyleri — fiziksel veri yok, finansal proxy",
    },
    {
        "score": 5,
        "label": "Varlık Sınıfı Proxy",
        "data_source": "Sektör/ülke ortalama emisyon yoğunluğu",
        "accuracy": "En Düşük",
        "color": "#ef4444",
        "typical_use": "Veri yokluğunda ülke-sektör ortalama kullanımı",
    },
]

# ── Akbank T.A.Ş. PCAF DQS Kıyaslaması (2024 rapor dönemi) ─────────────────
AKBANK_PCAF_BENCHMARK: dict = {
    "bank": "Akbank T.A.Ş.",
    "report_year": 2024,
    "asset_classes": [
        {
            "class": "Kurumsal Krediler",
            "dqs": 4.1,
            "portfolio_share_pct": 45,
            "note": "Büyük şirketlerde DQS 3; KOBİ ağırlıklı portföyde 4–5 arası",
            "improvement_path": "TSRS 2 raporlaması zorunlu hale geldikçe DQS 3'e geçiş bekleniyor (2026)",
        },
        {
            "class": "Proje Finansmanı",
            "dqs": 3.7,
            "portfolio_share_pct": 20,
            "note": "Yenilenebilir enerji projeleri DQS 2; altyapı DQS 4",
            "improvement_path": "Yeşil/sürdürülebilir proje finansmanı arttıkça DQS 3'ün altına düşülecek",
        },
        {
            "class": "Gayrimenkul Kredileri",
            "dqs": 4.8,
            "portfolio_share_pct": 15,
            "note": "EPC (enerji kimlik belgesi) verisi yetersiz; proxy kullanımı zorunlu",
            "improvement_path": "EPBD uyumlu EPC verisi entegrasyonu ile DQS 3'e geçiş",
        },
        {
            "class": "Küçük İşletme Kredileri",
            "dqs": 4.9,
            "portfolio_share_pct": 20,
            "note": "KOBİ'lerde veri boşluğu en büyük zorluk; KOBİ ESG Kredi Skoru ile iyileştirme",
            "improvement_path": "SustainHub KOBİ ESG Skoru ile DQS 3.5'e çekilebilir",
        },
    ],
    "portfolio_weighted_dqs": 4.1,
    "industry_target_2025": 3.5,
    "industry_target_2027": 2.8,
    "attribution_factor_note": (
        "Attribution Factor = Drawn Balance / EVIC — "
        "PCAF Standard v2 Part B §4.2. "
        "Facilitated emissions (Kapsam 3 Kat.15) %33 ağırlıkla dahil edilir."
    ),
}


@dataclass
class BorrowerInput:
    name: str
    sector_key: str            # key in SECTOR_INTENSITY
    nace_code: str             # e.g. "D35"
    outstanding_eur: float     # outstanding loan amount
    evic_eur: float            # enterprise value incl. cash
    revenue_eur: float         # annual revenue (for proxy calc)
    reported_emissions_tco2e: float | None = None  # if company self-reported
    data_quality: int = 3      # 1 (best) to 5 (worst) per PCAF


@dataclass
class BorrowerResult:
    name: str
    sector: str
    nace_code: str
    taxonomy_status: TaxonomyStatus
    outstanding_eur: float
    attribution_factor_pct: float
    company_emissions_tco2e: float   # total company emissions used
    financed_emissions_tco2e: float  # attributed to the bank
    data_quality: int
    esg_score: int
    esg_grade: str
    emission_intensity: float        # tCO2e / €M outstanding


@dataclass
class PortfolioResult:
    jurisdiction: str
    currency: str
    total_outstanding_eur: float
    total_financed_emissions_tco2e: float
    gar_ratio_pct: float
    green_eur: float
    transition_eur: float
    brown_eur: float
    borrowers: list[BorrowerResult]
    pcaf_data_quality_avg: float
    scope3_cat15_tco2e: float        # alias for total financed emissions


def _taxonomy_from_nace(nace_code: str) -> TaxonomyStatus:
    prefix = nace_code[:3]
    if prefix in NACE_TAXONOMY:
        return NACE_TAXONOMY[prefix]
    prefix2 = nace_code[:2]  # fallback to 2-char
    for key, val in NACE_TAXONOMY.items():
        if key.startswith(prefix2):
            return val
    return "transition"


def _esg_score_from_taxonomy_and_intensity(
    taxonomy: TaxonomyStatus,
    intensity: float,   # tCO2e/€M
    data_quality: int,
) -> int:
    base = {"green": 78, "transition": 55, "brown": 32}[taxonomy]
    # intensity penalty: -1 point per 50 tCO2e/€M above 100
    penalty = max(0, (intensity - 100) / 50)
    # data quality bonus/penalty: quality 1 = +5, quality 5 = -5
    dq_adj = (3 - data_quality) * 2.5
    score = int(base - penalty + dq_adj)
    return max(0, min(100, score))


def _esg_grade(score: int) -> str:
    for threshold, grade in ESG_GRADE_THRESHOLDS:
        if score >= threshold:
            return grade
    return "D"


def calculate_borrower(b: BorrowerInput) -> BorrowerResult:
    # PCAF attribution factor = outstanding / EVIC
    attribution = min(b.outstanding_eur / b.evic_eur, 1.0)

    # Company emissions: use reported if available, else proxy
    intensity = SECTOR_INTENSITY.get(b.sector_key, 200.0)
    company_emissions = (
        b.reported_emissions_tco2e
        if b.reported_emissions_tco2e is not None
        else (b.revenue_eur / 1_000_000) * intensity
    )

    financed = attribution * company_emissions
    taxonomy = _taxonomy_from_nace(b.nace_code)
    score = _esg_score_from_taxonomy_and_intensity(
        taxonomy, intensity, b.data_quality
    )

    return BorrowerResult(
        name=b.name,
        sector=b.sector_key,
        nace_code=b.nace_code,
        taxonomy_status=taxonomy,
        outstanding_eur=b.outstanding_eur,
        attribution_factor_pct=round(attribution * 100, 2),
        company_emissions_tco2e=round(company_emissions, 1),
        financed_emissions_tco2e=round(financed, 1),
        data_quality=b.data_quality,
        esg_score=score,
        esg_grade=_esg_grade(score),
        emission_intensity=round(financed / max(b.outstanding_eur / 1_000_000, 0.01), 1),
    )


def calculate_portfolio(
    borrowers: list[BorrowerInput],
    jurisdiction: str = "bddk",
    currency: str = "EUR",
) -> PortfolioResult:
    results = [calculate_borrower(b) for b in borrowers]

    total_outstanding = sum(r.outstanding_eur for r in results)
    total_financed = sum(r.financed_emissions_tco2e for r in results)

    green_eur = sum(r.outstanding_eur for r in results if r.taxonomy_status == "green")
    transition_eur = sum(r.outstanding_eur for r in results if r.taxonomy_status == "transition")
    brown_eur = sum(r.outstanding_eur for r in results if r.taxonomy_status == "brown")

    gar = (green_eur / total_outstanding * 100) if total_outstanding > 0 else 0.0
    dq_avg = sum(r.data_quality for r in results) / len(results) if results else 3.0

    return PortfolioResult(
        jurisdiction=jurisdiction,
        currency=currency,
        total_outstanding_eur=round(total_outstanding, 0),
        total_financed_emissions_tco2e=round(total_financed, 1),
        gar_ratio_pct=round(gar, 1),
        green_eur=round(green_eur, 0),
        transition_eur=round(transition_eur, 0),
        brown_eur=round(brown_eur, 0),
        borrowers=results,
        pcaf_data_quality_avg=round(dq_avg, 1),
        scope3_cat15_tco2e=round(total_financed, 1),
    )


# Turkish Bank demo portfolio (BDDK jurisdiction, amounts in EUR equivalent)
TURKISH_BANK_DEMO_BDDK: list[BorrowerInput] = [
    BorrowerInput(
        name="Akenerji A.Ş.",
        sector_key="yenilenebilir_enerji",
        nace_code="D35",
        outstanding_eur=85_000_000,
        evic_eur=340_000_000,
        revenue_eur=210_000_000,
        reported_emissions_tco2e=1_850.0,
        data_quality=2,
    ),
    BorrowerInput(
        name="Şişecam A.Ş.",
        sector_key="cam_uretim",
        nace_code="C23",
        outstanding_eur=120_000_000,
        evic_eur=1_800_000_000,
        revenue_eur=950_000_000,
        reported_emissions_tco2e=398_000.0,
        data_quality=2,
    ),
    BorrowerInput(
        name="Limak İnşaat",
        sector_key="insaat",
        nace_code="F41",
        outstanding_eur=65_000_000,
        evic_eur=390_000_000,
        revenue_eur=480_000_000,
        reported_emissions_tco2e=None,
        data_quality=4,
    ),
    BorrowerInput(
        name="Çalık Denim",
        sector_key="tekstil",
        nace_code="C13",
        outstanding_eur=28_000_000,
        evic_eur=112_000_000,
        revenue_eur=95_000_000,
        reported_emissions_tco2e=None,
        data_quality=4,
    ),
    BorrowerInput(
        name="Rönesans Enerji",
        sector_key="enerji_dagitim",
        nace_code="D35",
        outstanding_eur=42_000_000,
        evic_eur=168_000_000,
        revenue_eur=320_000_000,
        reported_emissions_tco2e=None,
        data_quality=3,
    ),
    BorrowerInput(
        name="Metro Lojistik",
        sector_key="lojistik",
        nace_code="H49",
        outstanding_eur=35_000_000,
        evic_eur=140_000_000,
        revenue_eur=180_000_000,
        reported_emissions_tco2e=None,
        data_quality=4,
    ),
    BorrowerInput(
        name="Yeşil Tarım Koop.",
        sector_key="tarim",
        nace_code="A01",
        outstanding_eur=18_000_000,
        evic_eur=72_000_000,
        revenue_eur=55_000_000,
        reported_emissions_tco2e=None,
        data_quality=5,
    ),
]

# KKTC sub-portfolio (consolidated under TSRS)
TURKISH_BANK_DEMO_TRNC: list[BorrowerInput] = [
    BorrowerInput(
        name="Kıbrıs Solar Ltd",
        sector_key="yenilenebilir_enerji",
        nace_code="D35",
        outstanding_eur=12_000_000,
        evic_eur=48_000_000,
        revenue_eur=22_000_000,
        reported_emissions_tco2e=280.0,
        data_quality=3,
    ),
    BorrowerInput(
        name="Lefkoşa AVM",
        sector_key="perakende",
        nace_code="G47",
        outstanding_eur=8_500_000,
        evic_eur=34_000_000,
        revenue_eur=18_000_000,
        reported_emissions_tco2e=None,
        data_quality=4,
    ),
    BorrowerInput(
        name="Girne Turizm A.Ş.",
        sector_key="turizm",
        nace_code="I55",
        outstanding_eur=15_000_000,
        evic_eur=60_000_000,
        revenue_eur=42_000_000,
        reported_emissions_tco2e=None,
        data_quality=5,
    ),
]
