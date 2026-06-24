"""
Sustain Intelligence Hub Service.
Mocks a global intelligence feed comprising Policy Alerts, Climate Tech News, and Case Studies.
"""

from typing import List, Dict

def get_intelligence_feed() -> Dict[str, List[Dict]]:
    """
    Returns curated news and insights for the Sustain Intelligence Hub.
    """
    return {
        "policy_alerts": [
            {
                "id": "p1",
                "date": "Bugün",
                "title": "AB Parlamentosu CBAM'da Çelik Sınırlarını Güncelledi",
                "summary": "Avrupa Birliği, çelik sektörü için Gömülü Emisyon (Embedded Emissions) standartlarını %15 daha sıkılaştırdı. Türkiye'deki üreticiler için risk primi artıyor.",
                "impact": "High",
                "tag": "CBAM Alert"
            },
            {
                "id": "p2",
                "date": "Dün",
                "title": "KGK, TSRS Bağımsız Denetçi Standardını Açıkladı",
                "summary": "Türkiye Sürdürülebilirlik Raporlama Standartları (TSRS) kapsamında 2025 raporlarında Sınırlı Güvence (Limited Assurance) şartları netleşti.",
                "impact": "Medium",
                "tag": "TSRS"
            }
        ],
        "climate_tech": [
            {
                "id": "t1",
                "title": "Direct Air Capture (DAC) Maliyetleri İlk Kez $200/ton Altına İndi",
                "summary": "İzlanda'daki yeni karbon yakalama tesisi 'Mammoth', endüstriyel ölçekte DAC maliyetlerinde devrim yaratıyor.",
                "read_time": "5 dk okuma",
                "related_simulation": "carbon_capture"
            },
            {
                "id": "t2",
                "title": "Endüstriyel Isı Pompalarında 'Yeşil Amonyak' Dönemi",
                "summary": "Avrupalı üreticiler doğalgazı tamamen devreden çıkararak, yüksek sıcaklıklı endüstriyel prosesleri ısı pompaları ile çözmeyi başardı.",
                "read_time": "3 dk okuma",
                "related_simulation": "heat_pumps"
            }
        ],
        "case_studies": [
            {
                "id": "c1",
                "company": "Kordsa",
                "sector": "Tekstil & Malzeme",
                "title": "Kapsam 2 Emisyonlarında %40 Azaltım",
                "summary": "Kordsa, çatı GES ve enerji satın alma anlaşmaları (PPA) ile sadece 18 ayda Scope 2 emisyonlarını nasıl yarı yarıya indirdi?"
            },
            {
                "id": "c2",
                "company": "Volvo Trucks",
                "sector": "Lojistik",
                "title": "Fosil Yakıtsız Çelikten İlk Tır Üretimi",
                "summary": "Volvo, tedarik zincirindeki Kapsam 3 emisyonlarını sıfırlamak için SSAB'nin fosilsiz çeliğini kullanarak sektörde ilk adımı attı."
            }
        ]
    }
