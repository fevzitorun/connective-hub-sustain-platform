"""
Entegrasyon adaptör registry'si.

Sağlayıcı adı → adaptör sınıfı eşlemesi. Route katmanı buradan adaptör alır;
yeni bir ERP eklemek = yeni adaptör dosyası + buraya bir satır.
"""
from .base import IntegrationAdapter, IntegrationNotConfigured, ActivityData
from .efatura import EFaturaAdapter
from .logo import LogoAdapter
from .enterprise import MikroAdapter, SapAdapter, OracleAdapter

__all__ = [
    "get_adapter", "list_providers",
    "IntegrationAdapter", "IntegrationNotConfigured", "ActivityData",
]

# Kayıtlı adaptörler (öncelik sırası: banka betası için önce e-Fatura + Logo)
_ADAPTER_CLASSES: list[type[IntegrationAdapter]] = [
    EFaturaAdapter,
    LogoAdapter,
    MikroAdapter,
    SapAdapter,
    OracleAdapter,
]

_REGISTRY: dict[str, type[IntegrationAdapter]] = {c.provider: c for c in _ADAPTER_CLASSES}


def list_providers() -> list[dict]:
    """Tüm sağlayıcıların özet bilgisi (marketplace / UI için)."""
    return [cls().info() for cls in _ADAPTER_CLASSES]


def get_adapter(provider: str, config: dict | None = None) -> IntegrationAdapter:
    """Sağlayıcı adına göre yapılandırılmış adaptör örneği döndürür."""
    cls = _REGISTRY.get(provider)
    if cls is None:
        raise KeyError(f"Bilinmeyen entegrasyon sağlayıcısı: {provider}")
    return cls(config)
