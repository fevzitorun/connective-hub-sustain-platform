"""
Kurumsal ERP adaptörleri: Mikro, SAP, Oracle.

Her biri kendi bağlantı yöntemine sahip; ortak IntegrationAdapter arayüzünü uygular.
Müşteri-bazlı devreye alınır (o sistemi kullanan ilk kurumsal müşteri geldiğinde),
hepsini önden değil. Mimari + normalize katmanı hazır.
"""
from .base import IntegrationAdapter, ActivityData, IntegrationNotConfigured


class MikroAdapter(IntegrationAdapter):
    provider = "mikro"
    display_name = "Mikro"
    maturity = "planned"
    description = "Mikro muhasebe — enerji/yakıt alımları (genelde SQL Server / web servisi)."
    required_config = ["connection_string", "company_code"]

    def test_connection(self) -> dict:
        missing = self.validate_config()
        if missing:
            return {"ok": False, "message": f"Eksik yapılandırma: {', '.join(missing)}"}
        raise IntegrationNotConfigured(
            "Mikro entegrasyonu için DB bağlantısı / web servis erişimi gerekli."
        )

    def fetch_activity_data(self, year: int) -> ActivityData:
        raise IntegrationNotConfigured("Mikro veri çekimi canlı erişim bekliyor.")


class SapAdapter(IntegrationAdapter):
    provider = "sap"
    display_name = "SAP S/4HANA"
    maturity = "planned"
    description = "SAP OData / BAPI üzerinden enerji ve tüketim verisi (kurumsal)."
    required_config = ["odata_url", "client", "username", "password"]

    def test_connection(self) -> dict:
        missing = self.validate_config()
        if missing:
            return {"ok": False, "message": f"Eksik yapılandırma: {', '.join(missing)}"}
        raise IntegrationNotConfigured(
            "SAP entegrasyonu için OData servis URL'si + client + kimlik gerekli "
            "(genelde SAP tarafı konfigürasyon + middleware ister)."
        )

    def fetch_activity_data(self, year: int) -> ActivityData:
        raise IntegrationNotConfigured("SAP veri çekimi canlı erişim bekliyor.")


class OracleAdapter(IntegrationAdapter):
    provider = "oracle"
    display_name = "Oracle ERP Cloud"
    maturity = "planned"
    description = "Oracle ERP Cloud REST API üzerinden tüketim/finansal veri."
    required_config = ["rest_url", "username", "password"]

    def test_connection(self) -> dict:
        missing = self.validate_config()
        if missing:
            return {"ok": False, "message": f"Eksik yapılandırma: {', '.join(missing)}"}
        raise IntegrationNotConfigured(
            "Oracle ERP Cloud için REST endpoint + kimlik bilgileri gerekli."
        )

    def fetch_activity_data(self, year: int) -> ActivityData:
        raise IntegrationNotConfigured("Oracle veri çekimi canlı erişim bekliyor.")
