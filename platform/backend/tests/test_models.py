"""
Model Testleri: Yeni modellerin doğru oluşturulup oluşturulmadığını kontrol eder.
materiality_assessments, cbam_declarations, supply_chain, credit_scores, integration_connections
"""
import pytest


class TestModelImports:
    """Tüm modellerin başarılı import edilebildiğini doğrula."""

    def test_materiality_assessment_import(self):
        from app.models.materiality import MaterialityAssessment
        assert MaterialityAssessment.__tablename__ == "materiality_assessments"

    def test_cbam_declaration_import(self):
        from app.models.cbam import CBAMDeclaration
        assert CBAMDeclaration.__tablename__ == "cbam_declarations"

    def test_cbam_product_import(self):
        from app.models.cbam import CBAMProduct
        assert CBAMProduct.__tablename__ == "cbam_products"

    def test_supply_chain_import(self):
        from app.models.supply_chain import SupplyChainEntry
        assert SupplyChainEntry.__tablename__ == "supply_chain"

    def test_supply_chain_alert_import(self):
        from app.models.supply_chain import SupplyChainAlert
        assert SupplyChainAlert.__tablename__ == "supply_chain_alerts"

    def test_credit_score_import(self):
        from app.models.credit_score import CreditScore
        assert CreditScore.__tablename__ == "credit_scores"

    def test_integration_connection_import(self):
        from app.models.integration import IntegrationConnection
        assert IntegrationConnection.__tablename__ == "integration_connections"

    def test_integration_log_import(self):
        from app.models.integration import IntegrationLog
        assert IntegrationLog.__tablename__ == "integration_logs"

    def test_all_models_in_init(self):
        """models/__init__.py tüm yeni modelleri dışa aktarıyor mu?"""
        from app.models import (
            MaterialityAssessment,
            CBAMDeclaration,
            CBAMProduct,
            SupplyChainEntry,
            SupplyChainAlert,
            CreditScore,
            IntegrationConnection,
            IntegrationLog,
        )
        assert MaterialityAssessment is not None
        assert CBAMDeclaration is not None
        assert CBAMProduct is not None
        assert SupplyChainEntry is not None
        assert SupplyChainAlert is not None
        assert CreditScore is not None
        assert IntegrationConnection is not None
        assert IntegrationLog is not None


class TestRegulationRequirements:
    """Düzenleme uyum doğrulama sabitlerinin doğruluğu."""

    def test_regulation_requirements_exist(self):
        from app.routes.validation import REGULATION_REQUIREMENTS
        assert "tsrs" in REGULATION_REQUIREMENTS
        assert "cbam" in REGULATION_REQUIREMENTS
        assert "eudr" in REGULATION_REQUIREMENTS
        assert "csrd" in REGULATION_REQUIREMENTS
        assert "bddk_gar" in REGULATION_REQUIREMENTS

    def test_cbam_sectors(self):
        from app.routes.validation import REGULATION_REQUIREMENTS
        cbam = REGULATION_REQUIREMENTS["cbam"]
        assert "cement" in cbam["sectors"]
        assert "iron_steel" in cbam["sectors"]
        assert "aluminium" in cbam["sectors"]
        assert "fertilizers" in cbam["sectors"]
        assert "electricity" in cbam["sectors"]
        assert "hydrogen" in cbam["sectors"]

    def test_eudr_commodities(self):
        from app.routes.validation import REGULATION_REQUIREMENTS
        eudr = REGULATION_REQUIREMENTS["eudr"]
        assert "cocoa" in eudr["commodities"]
        assert "coffee" in eudr["commodities"]
        assert "palm_oil" in eudr["commodities"]
