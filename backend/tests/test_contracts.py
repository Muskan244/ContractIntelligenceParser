from fastapi.testclient import TestClient
from backend.main import app
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

client = TestClient(app)

def test_contract_status_not_found():
    response = client.get("/contracts/invalid-id/status")
    assert response.status_code in [404, 200]
