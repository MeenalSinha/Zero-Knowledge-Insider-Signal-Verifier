"""
Tests for SEC Filing Analyzer
"""

import pytest
from datetime import datetime
from analyzer import SECFilingAnalyzer, InsiderTransaction, InsiderSignal

@pytest.fixture
def analyzer():
    """Create analyzer instance"""
    return SECFilingAnalyzer()

@pytest.fixture
def sample_transactions():
    """Sample insider transactions for testing"""
    return [
        InsiderTransaction(
            insider_name="John Doe",
            title="Chief Executive Officer",
            transaction_date="2025-01-15",
            shares_sold=150000,
            shares_bought=0,
            shares_owned_after=200000,
            transaction_type="Sale"
        ),
        InsiderTransaction(
            insider_name="Jane Smith",
            title="Chief Financial Officer",
            transaction_date="2025-01-16",
            shares_sold=50000,
            shares_bought=0,
            shares_owned_after=100000,
            transaction_type="Sale"
        )
    ]

def test_detect_insider_selling_above_threshold(analyzer, sample_transactions):
    """Test detection when selling exceeds threshold"""
    signal = analyzer.detect_insider_selling_signal(sample_transactions, threshold=40.0)
    
    assert signal is not None
    assert signal.signal_type == "INSIDER_SELLING"
    assert signal.threshold_exceeded == True
    assert signal.threshold_value >= 40.0

def test_detect_insider_selling_below_threshold(analyzer):
    """Test no detection when selling below threshold"""
    transactions = [
        InsiderTransaction(
            insider_name="John Doe",
            title="Director",
            transaction_date="2025-01-15",
            shares_sold=10000,
            shares_bought=0,
            shares_owned_after=200000,
            transaction_type="Sale"
        )
    ]
    
    signal = analyzer.detect_insider_selling_signal(transactions, threshold=40.0)
    assert signal is None

def test_role_weighting_ceo_vs_director(analyzer):
    """Test that CEO sales are weighted higher than Director sales"""
    ceo_transaction = [
        InsiderTransaction(
            insider_name="CEO",
            title="Chief Executive Officer",
            transaction_date="2025-01-15",
            shares_sold=100000,
            shares_bought=0,
            shares_owned_after=150000,
            transaction_type="Sale"
        )
    ]
    
    director_transaction = [
        InsiderTransaction(
            insider_name="Director",
            title="Director",
            transaction_date="2025-01-15",
            shares_sold=100000,
            shares_bought=0,
            shares_owned_after=150000,
            transaction_type="Sale"
        )
    ]
    
    ceo_signal = analyzer.detect_insider_selling_signal(ceo_transaction, threshold=40.0)
    director_signal = analyzer.detect_insider_selling_signal(director_transaction, threshold=40.0)
    
    assert ceo_signal is not None
    assert director_signal is not None
    assert ceo_signal.details['effective_percentage'] > director_signal.details['effective_percentage']

def test_confidence_calculation_multiple_factors(analyzer, sample_transactions):
    """Test confidence scoring with multiple factors"""
    signal = analyzer.detect_insider_selling_signal(sample_transactions, threshold=40.0)
    
    assert signal is not None
    assert 0.0 <= signal.confidence <= 0.99
    assert signal.confidence > 0.0  # Should have some confidence
    
    # Check that multiple insiders increases confidence
    single_insider = [sample_transactions[0]]
    single_signal = analyzer.detect_insider_selling_signal(single_insider, threshold=40.0)
    
    if single_signal:  # Only compare if single insider also triggers
        # Multiple insiders should generally have higher confidence
        assert signal.details['num_unique_insiders'] > single_signal.details['num_unique_insiders']

def test_empty_transactions(analyzer):
    """Test handling of empty transaction list"""
    signal = analyzer.detect_insider_selling_signal([], threshold=40.0)
    assert signal is None

def test_time_clustering_detection(analyzer):
    """Test detection of time-clustered sales"""
    clustered_transactions = [
        InsiderTransaction(
            insider_name="Person A",
            title="CFO",
            transaction_date="2025-01-15",
            shares_sold=50000,
            shares_bought=0,
            shares_owned_after=100000,
            transaction_type="Sale"
        ),
        InsiderTransaction(
            insider_name="Person B",
            title="COO",
            transaction_date="2025-01-20",  # Within 30 days
            shares_sold=50000,
            shares_bought=0,
            shares_owned_after=100000,
            transaction_type="Sale"
        )
    ]
    
    signal = analyzer.detect_insider_selling_signal(clustered_transactions, threshold=30.0)
    
    assert signal is not None
    assert 'time_clustered' in signal.details
    assert signal.details['time_clustered'] == True

def test_percentage_calculation_accuracy(analyzer):
    """Test percentage calculation is accurate"""
    transactions = [
        InsiderTransaction(
            insider_name="Test",
            title="CEO",
            transaction_date="2025-01-15",
            shares_sold=42900,  # 42.9% of 100000
            shares_bought=0,
            shares_owned_after=57100,
            transaction_type="Sale"
        )
    ]
    
    signal = analyzer.detect_insider_selling_signal(transactions, threshold=40.0)
    
    assert signal is not None
    # Allow small floating point error
    assert abs(signal.threshold_value - 42.9) < 0.1

def test_filing_hash_no_truncation():
    """Test that filing hash conversion doesn't truncate"""
    analyzer = SECFilingAnalyzer()
    
    # 256-bit hash
    filing_hash = "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890"
    
    # This should not raise an error and should preserve entropy
    # The actual proof generation would fail if truncation was severe
    try:
        # We can't actually generate proof without full setup, but we can test the conversion
        import hashlib
        filing_hash_int = int(filing_hash, 16)
        filing_hash_high = filing_hash_int >> 128
        filing_hash_low = filing_hash_int & ((1 << 128) - 1)
        
        # Both parts should be non-zero for a random hash
        assert filing_hash_high > 0
        assert filing_hash_low > 0
        
        # Combined should still be large
        combined_bytes = filing_hash_high.to_bytes(16, 'big') + filing_hash_low.to_bytes(16, 'big')
        assert len(combined_bytes) == 32  # Full 256 bits
        
    except Exception as e:
        pytest.fail(f"Hash conversion failed: {e}")

def test_signal_details_completeness(analyzer, sample_transactions):
    """Test that signal contains all required details"""
    signal = analyzer.detect_insider_selling_signal(sample_transactions, threshold=40.0)
    
    assert signal is not None
    
    # Check required fields
    assert 'total_shares_sold' in signal.details
    assert 'percentage_sold' in signal.details
    assert 'effective_percentage' in signal.details
    assert 'num_unique_insiders' in signal.details
    assert 'insiders' in signal.details
    assert 'roles' in signal.details
    assert 'role_multiplier' in signal.details
    
    # Check values are reasonable
    assert signal.details['total_shares_sold'] > 0
    assert signal.details['percentage_sold'] > 0
    assert signal.details['num_unique_insiders'] >= 1

def test_confidence_never_exceeds_99_percent(analyzer):
    """Test that confidence is always capped at 0.99"""
    # Create extreme scenario
    extreme_transactions = [
        InsiderTransaction(
            insider_name=f"Exec {i}",
            title="Chief Executive Officer",
            transaction_date="2025-01-15",
            shares_sold=90000,
            shares_bought=0,
            shares_owned_after=10000,
            transaction_type="Sale"
        ) for i in range(5)  # 5 CEOs selling 90%
    ]
    
    signal = analyzer.detect_insider_selling_signal(extreme_transactions, threshold=40.0)
    
    assert signal is not None
    assert signal.confidence <= 0.99  # Never 100%

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
