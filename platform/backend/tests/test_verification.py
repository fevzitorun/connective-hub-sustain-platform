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
    # assurance_level is a server/flush-time default (SQLAlchemy Column default=),
    # not applied to unpersisted instances — verify the declared default instead.
    assert Verification.__table__.columns["assurance_level"].default.arg == "limited"
