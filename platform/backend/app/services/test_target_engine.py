"""
Test for the SBTi Target Engine.
"""
import pytest
from app.services.target_engine import calculate_holding_sbti_target


@pytest.fixture
def mock_holding_subsidiaries():
    """
    Provides a mock list of subsidiaries for a holding company,
    representing different sectors and emission profiles.
    """
    return [
        {
            "name": "Enerji A.Ş.",
            "sector": "enerji",
            "base_scope12": 20000,
            "base_scope3": 5000,
        },
        {
            "name": "Tekstil Fabrikası Ltd.",
            "sector": "imalat",
            "base_scope12": 5000,
            "base_scope3": 15000,
        },
        {
            "name": "Finans Bank",
            "sector": "bankacılık",
            "base_scope12": 1000,
            "base_scope3": 30000,
        },
    ]


def test_calculate_holding_sbti_target(mock_holding_subsidiaries):
    """
    Tests the consolidation of subsidiary data to calculate a holding-level SBTi target.
    This directly validates the feature developed to address the D5 finding.
    """
    result = calculate_holding_sbti_target(
        subsidiaries=mock_holding_subsidiaries,
        holding_base_year=2024,
        current_year=2026
    )

    # 1. Check if total base emissions are correctly summed up
    assert result.base_scope12 == 26000  # 20000 + 5000 + 1000
    assert result.base_scope3 == 50000   # 5000 + 15000 + 30000

    # 2. Check if the recommendation string contains the calculated weighted average rates
    # Manual calculation:
    # Total = 76000. Enerji (25k/76k), İmalat (20k/76k), Banka (31k/76k)
    # Weighted S12 rate: (0.329*6.5) + (0.263*4.9) + (0.408*4.2) = 2.138 + 1.288 + 1.713 = ~5.14%
    # Weighted S3 rate: (0.329*8.0) + (0.263*6.5) + (0.408*7.0) = 2.632 + 1.709 + 2.856 = ~7.20%
    assert "yıllık %5.1 (K1+2)" in result.recommendations[0]
    assert "ve %7.2 (K3) azaltım hedefi" in result.recommendations[0]

    # 3. Check if the 2030 gap is calculated
    assert result.gap_2030 > 0
    assert result.gap_pct_2030 > 0

    # 4. Check if the target path shows a reduction
    assert result.sbti_target_path[0].total > result.sbti_target_path[-1].total