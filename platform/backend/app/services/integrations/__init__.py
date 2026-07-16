"""SustainHub entegrasyon adaptörleri paketi.

Kullanım:
    from app.services.integrations import get_adapter, list_providers, IntegrationNotConfigured
"""
from .registry import get_adapter, list_providers
from .base import IntegrationAdapter, IntegrationNotConfigured, ActivityData

__all__ = [
    "get_adapter", "list_providers",
    "IntegrationAdapter", "IntegrationNotConfigured", "ActivityData",
]
