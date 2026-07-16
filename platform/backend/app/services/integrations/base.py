"""
Entegrasyon adaptörü — ortak arayüz.

Her veri kaynağı (e-Fatura, Logo, Mikro, SAP, Oracle) bu arayüzü uygular.
Amaç: her ERP kendi bağlantı/kimlik doğrulama detayına sahip olsa da, hepsi
sisteme AYNI şekilde (ActivityData) veri döndürür. Böylece hesaplama motoru ve
rapor akışı kaynaktan bağımsız çalışır.

Kredensiyal/kurulum yoksa adaptörler IntegrationNotConfigured fırlatır — sahte
veri üretmez (yatırımcı/banka önünde "çalışıyor" izlenimi vermez).
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


class IntegrationNotConfigured(Exception):
    """Adaptör gerçek kimlik bilgileri / canlı erişim olmadan çağrıldı."""


@dataclass
class ActivityData:
    """Bir dönem için ham aktivite verisi — hesaplama motorunun beklediği alanlar.

    Adaptörler kaynak sistemden veriyi çekip bu yapıya normalize eder;
    ardından calculation_engine bunları tCO2e'ye çevirir.
    """
    electricity_kwh: float = 0.0
    natural_gas_m3: float = 0.0
    diesel_liters: float = 0.0
    lpg_kg: float = 0.0
    coal_tons: float = 0.0
    raw: dict = field(default_factory=dict)  # kaynak sistemden gelen ham kayıt (denetim izi)

    def to_emission_fields(self) -> dict:
        """EmissionRecord alanlarına eşle."""
        return {
            "electricity_kwh": self.electricity_kwh,
            "natural_gas_m3": self.natural_gas_m3,
            "diesel_liters": self.diesel_liters,
            "lpg_kg": self.lpg_kg,
            "coal_tons": self.coal_tons,
        }


class IntegrationAdapter(ABC):
    """Tüm entegrasyon adaptörlerinin temel sınıfı."""

    provider: str = "base"
    display_name: str = "Base"
    # UI'da bağlantı formu + doğrulama için gereken config alanları
    required_config: list[str] = []
    # Olgunluk: 'available' (canlı), 'beta' (mimari hazır, kimlik bekliyor), 'planned'
    maturity: str = "planned"
    # Kısa açıklama (UI marketplace kartı)
    description: str = ""

    def __init__(self, config: dict | None = None):
        self.config = config or {}

    def validate_config(self) -> list[str]:
        """Eksik zorunlu config alanlarını döndürür (boşsa hazır)."""
        return [f for f in self.required_config if not self.config.get(f)]

    @abstractmethod
    def test_connection(self) -> dict:
        """Bağlantıyı test eder. {'ok': bool, 'message': str} döndürür."""
        ...

    @abstractmethod
    def fetch_activity_data(self, year: int) -> ActivityData:
        """Verilen yıl için aktivite verisini kaynaktan çeker."""
        ...

    def info(self) -> dict:
        """Marketplace/registry için özet."""
        return {
            "provider": self.provider,
            "display_name": self.display_name,
            "maturity": self.maturity,
            "description": self.description,
            "required_config": self.required_config,
        }
