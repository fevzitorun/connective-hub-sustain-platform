"""
Supplier Intelligence Service.
Generates automated Supplier Scorecards and recommends interventions for high-emission partners.
"""

from typing import List, Dict

def generate_supplier_scorecard(supplier_id: str) -> Dict:
    """
    Generates a comprehensive ESG and Emissions scorecard for a specific supplier.
    This scorecard can be emailed to the supplier to foster a 'Race to Zero' competition.
    """
    # Mock data for demonstration
    mock_scorecards = {
        "SUP-100": {
            "name": "Kordsa Lojistik",
            "category": "Nakliye",
            "sustain_score": "B+",
            "emissions_intensity": "1.2 kg CO2e / kg yük",
            "industry_benchmark": "1.5 kg CO2e / kg yük",
            "status": "Performing Well",
            "recommendation": "Elektrikli araç (EV) filosunu %20 artırmaları için 'Yeşil Finansman' desteği sunulabilir."
        },
        "SUP-101": {
            "name": "DemirÇelik A.Ş.",
            "category": "Hammadde",
            "sustain_score": "C-",
            "emissions_intensity": "2.8 ton CO2e / ton çelik",
            "industry_benchmark": "1.9 ton CO2e / ton çelik",
            "status": "High Risk",
            "recommendation": "Tedarik zinciri sözleşmelerine 'Yenilenebilir Enerji Sertifikası (I-REC)' şartı eklenmeli veya alternatif tedarikçiler araştırılmalıdır."
        }
    }
    
    return mock_scorecards.get(supplier_id, {
        "name": "Bilinmeyen Tedarikçi",
        "sustain_score": "N/A",
        "status": "Data Missing",
        "recommendation": "Veri girişi talep ediniz."
    })

def get_high_risk_suppliers() -> List[Dict]:
    """
    Returns a list of suppliers whose emissions negatively impact the company's Scope 3 goals.
    """
    return [
        {
            "id": "SUP-101",
            "name": "DemirÇelik A.Ş.",
            "issue": "Sektör ortalamasının %47 üzerinde karbon yoğunluğu.",
            "action_required": "Sözleşme Revizyonu / İyileştirme Planı"
        }
    ]
