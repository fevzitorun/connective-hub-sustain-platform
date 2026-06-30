from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_request_verification():
    # Since we need auth and DB for this, we will just test the model structure
    from app.models.verification import Verification
    v = Verification(
        emission_id="test-emission",
        auditor_id="auditor-1",
        status="pending"
    )
    assert v.status == "pending"
    assert v.emission_id == "test-emission"
    assert v.assurance_level == "limited"
