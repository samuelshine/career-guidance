from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from models import MarketInsight
import pytest
from main import app, market_analyst

# Mock the market analyst to avoid external calls
@pytest.fixture
def mock_market_analyst(monkeypatch):
    mock = MagicMock()
    mock.analyze_role.return_value = MarketInsight(
        salary_range="$120k - $160k",
        demand_level="High",
        trends=["Trend 1", "Trend 2"],
        top_skills=["Skill A", "Skill B"]
    )
    # Monkeypatch the instance in main
    monkeypatch.setattr(market_analyst, "analyze_role", mock.analyze_role)
    return mock

def test_create_branch_with_market_insight(client, mock_market_analyst):
    # Register Alice
    client.post("/register", json={"username": "alice_market", "password": "password"})
    
    # Login
    res = client.post("/token", data={"username": "alice_market", "password": "password"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Branch
    res = client.post(
        "/branch/create", 
        json={"target_role": "Python Dev", "job_description": "JD"},
        headers=headers
    )
    
    assert res.status_code == 200
    data = res.json()
    
    # Assert Market Insight
    assert "market_insight" in data
    assert data["market_insight"] is not None
    assert data["market_insight"]["salary_range"] == "$120k - $160k"
    assert data["market_insight"]["demand_level"] == "High"
    
    # Verify mock was called
    mock_market_analyst.analyze_role.assert_called_with("Python Dev")
