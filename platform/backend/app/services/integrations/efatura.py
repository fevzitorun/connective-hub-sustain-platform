"""
e-Fatura (GİB) adaptörü.

En yüksek değer/çaba oranına sahip entegrasyon: Türkiye'de standart, tüm şirketlerde
var. Elektrik/doğalgaz/yakıt faturaları buradan otomatik gelir → Scope 1 & 2 verisi.

Bağlantı yolları (kuruluma göre):
- Doğrudan GİB e-Arşiv/e-Fatura portalı (SOAP)
- Entegratör üzerinden (Foriba, Uyumsoft, Mikro e-çözüm, Logo e-çözüm) — REST/SOAP

Kimlik bilgisi + sandbox erişimi geldiğinde `fetch_activity_data` içindeki akış
canlıya alınır; mimari ve normalize katmanı hazırdır.
"""
from .base import IntegrationAdapter, ActivityData, IntegrationNotConfigured


class EFaturaAdapter(IntegrationAdapter):
    provider = "efatura"
    display_name = "e-Fatura (GİB)"
    maturity = "beta"
    description = "Elektrik/doğalgaz/yakıt faturalarından otomatik tüketim verisi (Scope 1 & 2)."
    required_config = ["integrator", "username", "password", "vkn"]

    def test_connection(self) -> dict:
        missing = self.validate_config()
        if missing:
            return {"ok": False, "message": f"Eksik yapılandırma: {', '.join(missing)}"}
        # Kurulduğunda: entegratör/GİB kimlik doğrulaması (login → session token)
        raise IntegrationNotConfigured(
            "e-Fatura için GİB/entegratör kimlik bilgileri ve sandbox erişimi gerekli. "
            "Erişim geldiğinde bu adım entegratör oturum açma çağrısını yapacak."
        )

    def fetch_activity_data(self, year: int) -> ActivityData:
        missing = self.validate_config()
        if missing:
            raise IntegrationNotConfigured(f"Eksik yapılandırma: {', '.join(missing)}")
        # Canlı akış (kimlik geldiğinde doldurulacak):
        # 1. Entegratör/GİB'den `year` dönemindeki gelen e-faturaları çek
        # 2. Tedarikçi VKN + fatura tipine göre elektrik/doğalgaz/yakıt faturalarını filtrele
        #    (ör. elektrik dağıtım şirketleri VKN listesi, doğalgaz dağıtıcıları)
        # 3. Fatura kalemlerinden tüketim miktarını (kWh, m3, litre) ve birimi çıkar
        # 4. ActivityData'ya normalize et
        raise IntegrationNotConfigured(
            "e-Fatura veri çekimi canlı kimlik bilgisi bekliyor. Mimari hazır."
        )
