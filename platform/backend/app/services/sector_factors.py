"""
Sektörel Emisyon Faktörleri
Kaynaklar: Rateks (Tekstil), EPTA (Kimya), Erdoğanlar (Alüminyum), Gürsel (Turizm), Çukurova Üniv vb.
Bu çarpanlar "Intensity (Yoğunluk)" hesaplamalarında Kapsam 1-2-3 tahminleri için kullanılmaktadır.
"""

SECTOR_FACTORS = {
    "textile": {
        "label": "Tekstil",
        "factor": 4.2,
        "unit": "tCO₂e/ton ürün",
        "source": "Rateks Tekstil Raporu"
    },
    "aluminum": {
        "label": "Alüminyum",
        "factor": 1.8,
        "unit": "tCO₂e/ton ürün",
        "source": "Erdoğanlar Alüminyum Raporu"
    },
    "tourism": {
        "label": "Turizm",
        "factor": 0.0031, # 3.1 kg = 0.0031 ton
        "unit": "tCO₂e/m² konaklama",
        "source": "Gürsel Turizm"
    },
    "university": {
        "label": "Eğitim (Üniversite)",
        "factor": 0.45,
        "unit": "tCO₂e/öğrenci",
        "source": "Çukurova Üniv."
    },
    "chemicals": {
        "label": "Kimya",
        "factor": 2.6,
        "unit": "tCO₂e/ton ürün",
        "source": "EPTA Kimya"
    },
    "cement": {
        "label": "Çimento",
        "factor": 0.82,
        "unit": "tCO₂e/ton klinker",
        "source": "GRI Sector Standard"
    },
    "steel": {
        "label": "Çelik",
        "factor": 1.85,
        "unit": "tCO₂e/ton çelik",
        "source": "World Steel Association"
    }
}

def get_sector_factor(sector_id: str) -> dict | None:
    return SECTOR_FACTORS.get(sector_id)

def get_all_sector_factors() -> dict:
    return SECTOR_FACTORS
