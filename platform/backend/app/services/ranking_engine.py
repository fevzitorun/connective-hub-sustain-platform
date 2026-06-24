"""
Global Ranking Engine for Universities.
Converts campus metrics to THE Impact and UI GreenMetric ranking points.
"""

from typing import Dict, Any

def calculate_greenmetric_score(campus_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates UI GreenMetric World University Rankings calculation.
    Total maximum points: 10,000
    Categories:
    - Setting & Infrastructure (15%)
    - Energy & Climate Change (21%)
    - Waste (18%)
    - Water (10%)
    - Transportation (18%)
    - Education & Research (18%)
    """
    
    # Mock point distribution based on demo data
    ev_fleet_percentage = campus_data.get("ev_fleet_percentage", 10)
    renewable_energy_percentage = campus_data.get("renewable_energy_percentage", 15)
    
    # Points logic (Simplified)
    transport_points = min(1800, int((ev_fleet_percentage / 100) * 1800) + 500)
    energy_points = min(2100, int((renewable_energy_percentage / 100) * 2100) + 800)
    waste_points = 1200 # Static for demo
    water_points = 700  # Static for demo
    infrastructure_points = 1100 # Static for demo
    education_points = 1500 # Static for demo
    
    total_score = transport_points + energy_points + waste_points + water_points + infrastructure_points + education_points
    
    # Gap Analysis
    gap_analysis = []
    if ev_fleet_percentage < 50:
        gap_analysis.append(f"Transportation: %{50 - ev_fleet_percentage} oranında daha Elektrikli Araç (EV) filosuna geçiş yaparak +{int(1800*0.5 - transport_points)} puan kazanabilirsiniz.")
    if renewable_energy_percentage < 40:
        gap_analysis.append(f"Energy: Yenilenebilir enerji kullanımını %40'a çıkararak +{int(2100*0.4 - energy_points)} puan kazanıp Top 100'e girebilirsiniz.")

    return {
        "ranking_system": "UI GreenMetric",
        "total_score": total_score,
        "max_score": 10000,
        "global_estimate_rank": "Top 300" if total_score > 6000 else "Top 500",
        "category_scores": {
            "Setting & Infrastructure": infrastructure_points,
            "Energy & Climate Change": energy_points,
            "Waste": waste_points,
            "Water": water_points,
            "Transportation": transport_points,
            "Education": education_points
        },
        "gap_analysis": gap_analysis
    }

def calculate_the_impact_score(campus_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates Times Higher Education (THE) Impact Rankings (SDG focus).
    Focuses mainly on SDG 13 (Climate Action) and SDG 17 (Partnerships).
    """
    return {
        "ranking_system": "THE Impact Rankings",
        "sdg_13_score": 75.4,
        "sdg_17_score": 82.1,
        "gap_analysis": [
            "SDG 13: Kampüs Net-Zero hedef yılı resmi olarak deklare edilmeli.",
            "SDG 17: SustainHub Academy entegrasyonu ile endüstri-üniversite işbirliği raporlanmalı."
        ]
    }
