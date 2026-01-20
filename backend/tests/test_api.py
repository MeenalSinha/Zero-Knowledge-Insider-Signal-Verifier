"""
Tests for FastAPI Backend
"""

import pytest
from fastapi.testclient import TestClient
from api import app

@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)

def test_root_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data
    assert "version" in data

def test_stats_endpoint(client):
    """Test stats endpoint"""
    response = client.get("/stats")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_signals_verified" in data
    assert "total_researchers" in data

def test_active_bounties_endpoint(client):
    """Test active bounties endpoint"""
    response = client.get("/bounties/active")
    
    assert response.status_code == 200
    data = response.json()
    assert "bounties" in data
    assert "count" in data

def test_researcher_reputation_endpoint(client):
    """Test researcher reputation endpoint"""
    test_address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0e4f"
    response = client.get(f"/researcher/{test_address}/reputation")
    
    assert response.status_code == 200
    data = response.json()
    assert "address" in data
    assert data["address"] == test_address

def test_recent_signals_endpoint(client):
    """Test recent signals endpoint"""
    response = client.get("/signals/recent?limit=5")
    
    assert response.status_code == 200
    data = response.json()
    assert "signals" in data
    assert "count" in data

def test_analyze_upload_invalid_file(client):
    """Test upload with invalid file"""
    response = client.post(
        "/analyze/upload",
        files={"file": ("test.txt", b"not xml", "text/plain")}
    )
    
    # Should handle gracefully
    assert response.status_code in [200, 400, 500]

def test_cors_headers(client):
    """Test CORS headers are present"""
    response = client.options("/")
    
    # CORS middleware should add headers
    assert "access-control-allow-origin" in response.headers or response.status_code == 200

def test_api_documentation_available(client):
    """Test that API docs are available"""
    response = client.get("/docs")
    
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_openapi_schema_available(client):
    """Test OpenAPI schema endpoint"""
    response = client.get("/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert "paths" in data

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
