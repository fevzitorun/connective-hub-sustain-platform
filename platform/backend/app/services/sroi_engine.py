"""
SROI (Social Return on Investment) Engine.
Harcanan her 1€'nun topluma yarattığı değeri hesaplar.
UK Social Value Act + EU Taxonomy Social Pillar metodolojisi.
"""
from dataclasses import dataclass, field
from typing import List, Dict

# Proxy değerler (€) — UK Government Social Value Bank + EU referans değerleri
PROXY_VALUES: Dict[str, Dict] = {
    "employee_training": {
        "label": "Çalışan Eğitimi",
        "unit": "kişi/yıl",
        "proxy_eur": 3200,
        "description": "Bir çalışanın mesleki gelişiminin ekonomik değeri",
        "sdg": "SDG 4",
    },
    "local_hiring": {
        "label": "Yerel İstihdam",
        "unit": "yeni işe alım",
        "proxy_eur": 8500,
        "description": "Yerel ekonomiye işsizlik azaltma + vergi etkisi",
        "sdg": "SDG 8",
    },
    "gender_diversity": {
        "label": "Cinsiyet Çeşitliliği (Kadın Yönetici)",
        "unit": "yönetici pozisyonu",
        "proxy_eur": 12000,
        "description": "Karar alma kalitesi ve kurumsal yönetim iyileşmesi",
        "sdg": "SDG 5",
    },
    "community_investment": {
        "label": "Toplum Yatırımı",
        "unit": "proje",
        "proxy_eur": 45000,
        "description": "Yerel toplum projesi başına sosyal fayda",
        "sdg": "SDG 11",
    },
    "renewable_energy_kwh": {
        "label": "Yenilenebilir Enerji",
        "unit": "MWh/yıl",
        "proxy_eur": 85,
        "description": "Karbon önleme + enerji güvenliği değeri",
        "sdg": "SDG 7",
    },
    "waste_recycled_ton": {
        "label": "Geri Dönüşüm",
        "unit": "ton/yıl",
        "proxy_eur": 320,
        "description": "Depolama maliyeti önleme + kaynak verimliliği",
        "sdg": "SDG 12",
    },
    "supplier_diversity": {
        "label": "KOBİ/Kadın Tedarikçi",
        "unit": "tedarikçi",
        "proxy_eur": 6500,
        "description": "Tedarik zinciri çeşitliliğinin ekonomik kalkınma etkisi",
        "sdg": "SDG 8",
    },
    "carbon_prevented_tco2e": {
        "label": "Önlenen Karbon",
        "unit": "ton CO₂e",
        "proxy_eur": 75,
        "description": "AB ETS fiyatı üzerinden hesaplanan iklim değeri",
        "sdg": "SDG 13",
    },
}


@dataclass
class SROILineItem:
    category: str
    label: str
    quantity: float
    unit: str
    proxy_eur: float
    total_value_eur: float
    sdg: str


@dataclass
class SROIResult:
    total_investment_eur: float
    total_social_value_eur: float
    sroi_ratio: float          # e.g. 3.5 → "her 1€ için 3.5€ değer"
    sroi_label: str            # "Mükemmel / İyi / Orta / Düşük"
    line_items: List[SROILineItem]
    breakdown_pct: Dict[str, float]
    summary: str
    un_sdgs: List[str]


def calculate_sroi(investment_eur: float, inputs: Dict[str, float]) -> SROIResult:
    """
    investment_eur: Toplam sosyal yatırım harcaması (€)
    inputs: { category_key: quantity } dict
    """
    if investment_eur <= 0:
        investment_eur = 1.0

    line_items: List[SROILineItem] = []
    total_value = 0.0
    sdgs_hit = set()

    for key, qty in inputs.items():
        if key not in PROXY_VALUES or qty <= 0:
            continue
        meta = PROXY_VALUES[key]
        value = qty * meta["proxy_eur"]
        total_value += value
        sdgs_hit.add(meta["sdg"])
        line_items.append(SROILineItem(
            category=key,
            label=meta["label"],
            quantity=qty,
            unit=meta["unit"],
            proxy_eur=meta["proxy_eur"],
            total_value_eur=round(value, 0),
            sdg=meta["sdg"],
        ))

    # Deadweight & displacement ayarı: gerçek SROI metodolojisinde %20-30 indirim
    # Muhafazakar tahmin için %25 deadweight uyguluyoruz
    adjusted_value = total_value * 0.75

    sroi_ratio = round(adjusted_value / investment_eur, 2)

    if sroi_ratio >= 5:
        sroi_label = "Olağanüstü Etki"
    elif sroi_ratio >= 3:
        sroi_label = "Yüksek Etki"
    elif sroi_ratio >= 2:
        sroi_label = "İyi Etki"
    elif sroi_ratio >= 1:
        sroi_label = "Pozitif Etki"
    else:
        sroi_label = "Sınırlı Etki"

    # Kategori dağılımı (%)
    breakdown: Dict[str, float] = {}
    for item in line_items:
        pct = round((item.total_value_eur / total_value) * 100, 1) if total_value > 0 else 0
        breakdown[item.label] = pct

    line_items.sort(key=lambda x: x.total_value_eur, reverse=True)

    summary = (
        f"Toplam {investment_eur:,.0f}€ sosyal yatırımınız, "
        f"%25 muhafazakar deadweight ayarı sonrasında "
        f"{adjusted_value:,.0f}€ toplumsal değer üretti. "
        f"SROI oranı: {sroi_ratio:.1f}x — {sroi_label}."
    )

    return SROIResult(
        total_investment_eur=investment_eur,
        total_social_value_eur=round(adjusted_value, 0),
        sroi_ratio=sroi_ratio,
        sroi_label=sroi_label,
        line_items=line_items,
        breakdown_pct=breakdown,
        summary=summary,
        un_sdgs=sorted(list(sdgs_hit)),
    )


def get_proxy_catalog() -> Dict:
    return {
        k: {
            "label": v["label"],
            "unit": v["unit"],
            "proxy_eur": v["proxy_eur"],
            "description": v["description"],
            "sdg": v["sdg"],
        }
        for k, v in PROXY_VALUES.items()
    }
