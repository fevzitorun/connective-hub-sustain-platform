"""
Marjinal Azaltım Maliyeti Eğrisi (MACC) Servisi.
AB çevre politikası ve SBTi uyumlu azaltım önlemlerini maliyet-etkinlik sırasına göre sıralar.
"""
from dataclasses import dataclass, field


@dataclass
class MACCMeasure:
    id: str
    name: str
    category: str           # enerji, atık, ulaşım, proses, tedarik
    abatement_tco2: float   # yıllık azaltım potansiyeli (tCO2e)
    cost_per_tco2: float    # €/tCO2e (negatif = tasarruf)
    capex_tl: float         # başlangıç yatırım (TL)
    payback_years: float
    scope: int              # 1, 2 veya 3
    applicable_sectors: list[str] = field(default_factory=list)


@dataclass
class MACCResult:
    company_id: str
    sector: str
    measures: list[MACCMeasure]
    total_abatement_potential: float   # tCO2e/year
    negative_cost_abatement: float     # tasarruf sağlayan önlemlerin tCO2e
    total_investment_tl: float
    average_cost_per_tco2: float
    sbti_gap_covered_pct: float        # % of SBTi 2030 gap covered


_MACC_MEASURES: list[dict] = [
    # ── Negatif maliyet (tasarruf sağlayan) ──────────────────────────
    {
        "id": "led_lighting",
        "name": "LED Aydınlatmaya Geçiş",
        "category": "enerji",
        "abatement_tco2": 45.0,
        "cost_per_tco2": -18.0,
        "capex_tl": 85_000,
        "payback_years": 2.5,
        "scope": 2,
        "applicable_sectors": ["imalat", "perakende", "gıda", "inşaat", "çimento", "diğer"],
    },
    {
        "id": "vrv_hvac",
        "name": "VRV/VRF İklimlendirme Sistemi",
        "category": "enerji",
        "abatement_tco2": 80.0,
        "cost_per_tco2": -12.0,
        "capex_tl": 220_000,
        "payback_years": 3.5,
        "scope": 2,
        "applicable_sectors": ["bankacılık", "perakende", "teknoloji", "diğer"],
    },
    {
        "id": "compressed_air_opt",
        "name": "Basınçlı Hava Optimizasyonu",
        "category": "enerji",
        "abatement_tco2": 120.0,
        "cost_per_tco2": -8.0,
        "capex_tl": 150_000,
        "payback_years": 2.0,
        "scope": 1,
        "applicable_sectors": ["imalat", "çimento", "rafineri"],
    },
    # ── Düşük maliyet önlemler ────────────────────────────────────────
    {
        "id": "rooftop_solar",
        "name": "Çatı GES (500 kWp)",
        "category": "enerji",
        "abatement_tco2": 380.0,
        "cost_per_tco2": 4.5,
        "capex_tl": 3_500_000,
        "payback_years": 6.5,
        "scope": 2,
        "applicable_sectors": ["imalat", "gıda", "perakende", "çimento", "diğer"],
    },
    {
        "id": "renewable_ppa",
        "name": "Yenilenebilir Enerji PPA Sözleşmesi",
        "category": "enerji",
        "abatement_tco2": 550.0,
        "cost_per_tco2": 6.0,
        "capex_tl": 0,
        "payback_years": 0.0,
        "scope": 2,
        "applicable_sectors": ["bankacılık", "teknoloji", "perakende", "imalat", "diğer"],
    },
    {
        "id": "fleet_ev",
        "name": "Araç Filosu EV Dönüşümü",
        "category": "ulaşım",
        "abatement_tco2": 95.0,
        "cost_per_tco2": 15.0,
        "capex_tl": 2_800_000,
        "payback_years": 8.0,
        "scope": 1,
        "applicable_sectors": ["perakende", "gıda", "imalat", "diğer"],
    },
    # ── Orta maliyet önlemler ─────────────────────────────────────────
    {
        "id": "heat_recovery",
        "name": "Atık Isı Geri Kazanımı",
        "category": "proses",
        "abatement_tco2": 280.0,
        "cost_per_tco2": 22.0,
        "capex_tl": 1_200_000,
        "payback_years": 5.5,
        "scope": 1,
        "applicable_sectors": ["çimento", "imalat", "rafineri", "gıda"],
    },
    {
        "id": "supplier_engagement",
        "name": "Tedarikçi Kapsam 3 Programı",
        "category": "tedarik",
        "abatement_tco2": 420.0,
        "cost_per_tco2": 18.0,
        "capex_tl": 300_000,
        "payback_years": 4.0,
        "scope": 3,
        "applicable_sectors": ["bankacılık", "perakende", "gıda", "imalat", "diğer"],
    },
    {
        "id": "waste_biogas",
        "name": "Biyogaz Sistemi (Organik Atık)",
        "category": "atık",
        "abatement_tco2": 65.0,
        "cost_per_tco2": 28.0,
        "capex_tl": 850_000,
        "payback_years": 9.0,
        "scope": 1,
        "applicable_sectors": ["gıda", "imalat"],
    },
    # ── Yüksek maliyet önlemler ───────────────────────────────────────
    {
        "id": "green_hydrogen",
        "name": "Yeşil Hidrojen Yakıt (Pilot)",
        "category": "proses",
        "abatement_tco2": 200.0,
        "cost_per_tco2": 95.0,
        "capex_tl": 8_000_000,
        "payback_years": 15.0,
        "scope": 1,
        "applicable_sectors": ["rafineri", "çimento", "imalat"],
    },
    {
        "id": "carbon_capture",
        "name": "Karbon Yakalama (CCS Pilot)",
        "category": "proses",
        "abatement_tco2": 500.0,
        "cost_per_tco2": 140.0,
        "capex_tl": 25_000_000,
        "payback_years": 20.0,
        "scope": 1,
        "applicable_sectors": ["çimento", "rafineri"],
    },
]


def calculate_macc(
    company_id: str,
    sector: str,
    total_emissions: float = 0.0,
    sbti_gap_2030: float = 0.0,
    budget_limit_tl: float | None = None,
) -> MACCResult:
    """Sektöre uygun MACC hesapla, maliyet-etkinlik sırasına göre sırala."""
    sector_key = sector.lower()

    applicable = [
        m for m in _MACC_MEASURES
        if not m["applicable_sectors"] or sector_key in m["applicable_sectors"]
    ]

    # cost_per_tco2'ye göre (düşükten yükseğe — negatifler önce)
    applicable.sort(key=lambda m: m["cost_per_tco2"])
    measures = [MACCMeasure(**m) for m in applicable]

    if budget_limit_tl is not None:
        filtered: list[MACCMeasure] = []
        cumulative = 0.0
        for m in measures:
            if cumulative + m.capex_tl <= budget_limit_tl:
                filtered.append(m)
                cumulative += m.capex_tl
        measures = filtered

    total_abatement = sum(m.abatement_tco2 for m in measures)
    negative_cost = sum(m.abatement_tco2 for m in measures if m.cost_per_tco2 < 0)
    total_investment = sum(m.capex_tl for m in measures)

    avg_cost = (
        sum(m.cost_per_tco2 * m.abatement_tco2 for m in measures) / total_abatement
        if total_abatement > 0 else 0.0
    )
    sbti_covered = (
        min(100.0, total_abatement / sbti_gap_2030 * 100) if sbti_gap_2030 > 0 else 0.0
    )

    return MACCResult(
        company_id=company_id,
        sector=sector,
        measures=measures,
        total_abatement_potential=round(total_abatement, 1),
        negative_cost_abatement=round(negative_cost, 1),
        total_investment_tl=round(total_investment, 0),
        average_cost_per_tco2=round(avg_cost, 1),
        sbti_gap_covered_pct=round(sbti_covered, 1),
    )
