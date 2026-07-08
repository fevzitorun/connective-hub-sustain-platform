"""
Sustain-Marketplace Akıllı Eşleştirme Motoru.
Simülasyon (ROI) sonuçlarına göre şirketleri doğru yeşil teknoloji sağlayıcılarıyla buluşturur.
"""

# Mock Vendor Database
VENDORS = [
    {
        "id": "v_solar_1",
        "name": "Enerjisa GES Çözümleri",
        "type": "solar",
        "trust_score": 98,
        "features": ["Anahtar Teslim", "10 Yıl Garanti", "Finansman Desteği"]
    },
    {
        "id": "v_solar_2",
        "name": "Kalyon PV",
        "type": "solar",
        "trust_score": 95,
        "features": ["Yerli Üretim", "Hızlı Kurulum"]
    },
    {
        "id": "v_ev_1",
        "name": "Zorlu Energy Solutions (ZES)",
        "type": "ev_fleet",
        "trust_score": 96,
        "features": ["Şarj İstasyonu Ağı", "Filo Yönetim Yazılımı"]
    },
    {
        "id": "v_heat_1",
        "name": "Ecolab Atık Isı",
        "type": "waste_heat",
        "trust_score": 92,
        "features": ["Endüstriyel Verimlilik", "Hızlı Amortisman"]
    }
]

def get_smart_recommendations(investment_type: str) -> list[dict]:
    """
    Kullanıcının simüle ettiği veya ihtiyaç duyduğu yatırım tipine göre tedarikçileri listeler.
    """
    recommended = [v for v in VENDORS if v["type"] == investment_type]
    # Güven skoruna göre sırala
    recommended.sort(key=lambda x: x["trust_score"], reverse=True)
    return recommended

def submit_lead(company_name: str, vendor_id: str, investment_eur: float) -> dict:
    """
    Şirket 'Teklif Al' dediğinde tedarikçiye (Vendor) gönderilecek olan lead kaydı.
    """
    vendor = next((v for v in VENDORS if v["id"] == vendor_id), None)
    if not vendor:
        raise ValueError("Tedarikçi bulunamadı.")
        
    lead_data = {
        "status": "sent",
        "vendor_name": vendor["name"],
        "company_name": company_name,
        "potential_deal_size": investment_eur,
        "message": f"{vendor['name']} firmasına {investment_eur} EUR değerinde bir proje potansiyeli için iletişim talebiniz iletildi. Müşteri temsilcisi 24 saat içinde size dönüş yapacaktır."
    }
    
    # Burada normalde e-posta gönderilir veya CRM entegrasyonu (Salesforce/HubSpot) çalışır.
    
    return lead_data

def get_mentorship_matches(maturity_score: int) -> list[dict]:
    """
    Returns relevant mentorship and partner matching based on the company's maturity score.
    Integrates logically with ISO and TUBITAK (EEN) networks.
    """
    matches = []
    
    if maturity_score < 40:
        matches.append({
            "provider": "İSO Sürekli Eğitim Merkezi",
            "type": "Mentorship",
            "program": "Temel Karbon Ayak İzi Yönetimi Eğitimi",
            "description": "KOBİ'ler için ücretsiz başlangıç seviyesi iklim mentörlüğü."
        })
    elif maturity_score < 70:
        matches.append({
            "provider": "TÜBİTAK TEYDEB",
            "type": "Funding & Partner",
            "program": "1501 - Sanayi Ar-Ge Projeleri Destekleme Programı (Yeşil Dönüşüm)",
            "description": "Kapsam 3 emisyonlarını düşürmek için dijitalleşme hibesi."
        })
    else:
        matches.append({
            "provider": "Enterprise Europe Network (EEN)",
            "type": "Global Matchmaking",
            "program": "UK-TR Green Tech Partnership Bridge",
            "description": "İngiltere pazarında sürdürülebilirlik odaklı iş ortaklıkları ve ihracat bağlantıları."
        })
        
    return matches
