"""
BDDK Yeşil Varlık Oranı (GAR) Hesaplama Motoru
Sprint 32B — EU Taxonomy Entegrasyonu

Bu motor, bir bankanın kredi portföyünü analiz eder, her bir şirketin
AB Taksonomisi uyumunu hesaplar ve BDDK'nın istediği formatta GAR'ı üretir.

NOT: Portföy verisi bankanın çekirdek bankacılık/kredi sisteminden canlı olarak
çekilmelidir. Proje kuralı gereği sahte (mock) veri tutulmaz — gerçek entegrasyon
bağlanana kadar bu motor IntegrationNotConfigured fırlatır (ERP adaptörleriyle
aynı desen).
"""
from typing import List, Dict, Any

from .taxonomy_engine import calculate_full_taxonomy
from ..models.taxonomy_schema import TaxonomyCalculationRequest
from ..services.integrations import IntegrationNotConfigured


def _load_bank_portfolio(bank_id: str) -> List[Dict[str, Any]]:
    """Bankanın kredi portföyünü kaynak sistemden çeker.

    Canlı entegrasyon (çekirdek bankacılık / kredi risk sistemi) bağlanana kadar
    IntegrationNotConfigured fırlatır — sahte portföy döndürmez.
    """
    raise IntegrationNotConfigured(
        f"'{bank_id}' bankası için canlı portföy entegrasyonu yapılandırılmadı. "
        "GAR hesabı, çekirdek bankacılık/kredi sisteminden gerçek portföy verisi "
        "bağlandığında etkinleşecek."
    )


def calculate_bank_gar(bank_id: str, year: int) -> Dict[str, Any]:
    """
    Bir bankanın portföyü için Yeşil Varlık Oranı'nı (GAR) hesaplar.
    Her bir varlık için EU Taxonomy motorunu çağırır.
    """
    portfolio = _load_bank_portfolio(bank_id)

    total_assets = sum(asset["exposure_eur"] for asset in portfolio)
    total_aligned_assets = 0
    asset_details = []

    for asset in portfolio:
        # Her bir varlık için Taksonomi hesaplama isteği oluştur
        request = TaxonomyCalculationRequest(
            company_id=asset["company_id"],
            year=year,
            nace_code=asset["nace_code"],
            revenue_eur=1_000_000,  # GAR için ciro/capex/opex yerine risk ağırlığı önemli
            capex_eur=0, opex_eur=0,
            activities=asset.get("metrics", [])
        )

        # Taksonomi motorunu çalıştır
        taxonomy_result = calculate_full_taxonomy(request)

        # Taksonomiye uyumlu varlıkları topla
        aligned_amount = asset["exposure_eur"] * (taxonomy_result.alignment_percent / 100)
        total_aligned_assets += aligned_amount

        asset_details.append({
            "company_name": asset["company_name"],
            "exposure": asset["exposure_eur"],
            "taxonomy_alignment_pct": taxonomy_result.alignment_percent,
            "aligned_exposure": aligned_amount,
        })

    gar = (total_aligned_assets / total_assets) * 100 if total_assets > 0 else 0

    return {
        "bank_id": bank_id,
        "year": year,
        "green_asset_ratio_pct": round(gar, 2),
        "total_assets_eur": total_assets,
        "total_aligned_assets_eur": total_aligned_assets,
        "portfolio_breakdown": asset_details,
        "methodology": "BDDK Yeşil Varlık Oranı Yönetmeliği ve AB Taksonomisi Tüzüğü (EU 2020/852) temel alınmıştır."
    }
