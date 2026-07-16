"""
Logo (Tiger / Netsis / Go) adaptörü.

Türkiye'de en yaygın muhasebe/ERP sistemlerinden. Enerji ve yakıt alım fişlerinden
tüketim verisi çıkarılır. Bağlantı: Logo REST servisleri / Logo Objects / Logo Connect.

Not: Logo API'leri kuruluma göre değişir (Tiger vs Netsis vs Go); bazı kurulumlarda
doğrudan SQL Server erişimi tercih edilir. `fetch_activity_data` pilot müşterinin
Logo sürümüne göre canlıya alınır.
"""
from .base import IntegrationAdapter, ActivityData, IntegrationNotConfigured


class LogoAdapter(IntegrationAdapter):
    provider = "logo"
    display_name = "Logo (Tiger / Netsis / Go)"
    maturity = "beta"
    description = "Muhasebe fişlerinden enerji/yakıt tüketimi — Türkiye'nin en yaygın ERP'si."
    required_config = ["base_url", "api_key", "firm_number", "period"]

    def test_connection(self) -> dict:
        missing = self.validate_config()
        if missing:
            return {"ok": False, "message": f"Eksik yapılandırma: {', '.join(missing)}"}
        raise IntegrationNotConfigured(
            "Logo bağlantısı için REST servis URL'si + API anahtarı + firma/dönem no gerekli. "
            "Pilot müşterinin Logo sürümüne göre bağlantı devreye alınacak."
        )

    def fetch_activity_data(self, year: int) -> ActivityData:
        missing = self.validate_config()
        if missing:
            raise IntegrationNotConfigured(f"Eksik yapılandırma: {', '.join(missing)}")
        # Canlı akış (kimlik geldiğinde):
        # 1. Logo REST/Objects üzerinden `year` dönemi enerji/yakıt alım fişlerini sorgula
        # 2. Malzeme kodları / hesap planı kalemlerini enerji tiplerine eşle (data_mapping)
        # 3. Miktar + birimi çıkar, ActivityData'ya normalize et
        raise IntegrationNotConfigured("Logo veri çekimi canlı erişim bekliyor. Mimari hazır.")
