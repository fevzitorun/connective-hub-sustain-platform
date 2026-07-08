"""
Digital Library & Research-to-Industry Bridge.
Provides academic papers and research to industries based on their current simulation context.
"""
from typing import List, Dict

# Mock Academic Repository
ACADEMIC_PAPERS = [
    {
        "id": "p_solar_itu",
        "title": "Endüstriyel Çatılarda Hibrit Fotovoltaik Sistemlerin Verimlilik Analizi",
        "university": "İTÜ Enerji Enstitüsü",
        "year": 2024,
        "keywords": ["solar", "ges", "enerji", "verimlilik"],
        "roi_impact_note": "Bu araştırmaya göre, doğru açıyla kurulan hibrit paneller ROI süresini 1.2 yıl kısaltmaktadır.",
        "link": "https://sustainhub.online/library/p_solar_itu"
    },
    {
        "id": "p_battery_sabanci",
        "title": "Lityum-İyon Batarya Tesislerinde Döngüsel Ekonomi ve Atık Yönetimi Modeli",
        "university": "Sabancı Üniversitesi",
        "year": 2023,
        "keywords": ["battery", "batarya", "depolama", "döngüsel"],
        "roi_impact_note": "Batarya atıklarının geri kazanımı ile yeni hammadde alım maliyetlerinde %22 düşüş sağlanabilir.",
        "link": "https://sustainhub.online/library/p_battery_sabanci"
    },
    {
        "id": "p_ev_atlas",
        "title": "Lojistik Filolarının Elektrifikasyonunda Şarj Ağı Optimizasyonu",
        "university": "Atlas Üniversitesi",
        "year": 2024,
        "keywords": ["ev", "elektrikli araç", "lojistik", "filo"],
        "roi_impact_note": "Optimize edilmiş şarj istasyonu lokasyonları, filonun bekleme süresi maliyetlerini %15 oranında azaltır.",
        "link": "https://sustainhub.online/library/p_ev_atlas"
    }
]

def get_research_recommendations(active_simulation_topic: str) -> List[Dict]:
    """
    Returns a list of academic papers relevant to what the user is currently simulating.
    e.g. if the user is moving the "Solar" slider in the UI, this returns ITU's Solar paper.
    """
    topic_lower = active_simulation_topic.lower()
    
    # Map general UI topics to keywords
    mapping = {
        "solar_ges": ["solar", "ges"],
        "battery": ["battery", "batarya"],
        "ev_fleet": ["ev", "lojistik"]
    }
    
    target_keywords = mapping.get(topic_lower, [])
    if not target_keywords:
        return []

    results = []
    for paper in ACADEMIC_PAPERS:
        for keyword in paper["keywords"]:
            if keyword in target_keywords:
                results.append(paper)
                break # avoid duplicates
                
    return results
