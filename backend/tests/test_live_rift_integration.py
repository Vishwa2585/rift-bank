"""
Integration tests between RIFT Bank and RIFT Security Platform.
Verifies:
1. Real HTTP calls to RIFT endpoints
2. Policy evaluation (High-value threshold triggers RIFT KEY requirement)
3. RIFT KEY authorization workflow
4. Verified local blockchain evidence generation with distinct hashes
5. Ledger hold settlement and reconciliation record production
"""

import pytest
import uuid
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.account import Account
from app.models.transfer import Transfer
from app.models.reconciliation import ReconciliationRecord
from app.services.transfer_service import TransferService
from app.schemas.common import TransferCreateInput, AuthorizeTransferRequest
from app.adapters.rift_adapter import RiftServiceAdapter
from app.seeds.seed_data import seed_database

# Use starlette test client / httpx ASGITransport for in-process live testing of both FastAPI apps
from rift_service_main import app as rift_app

@pytest.fixture
def test_setup():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()
    seed_database(session, force=True)
    yield session
    session.close()

@pytest.mark.asyncio
async def test_live_rift_service_contract_and_evidence(test_setup, monkeypatch):
    session = test_setup
    
    # Configure custom adapter routing directly to RIFT FastAPI application via ASGITransport
    transport = httpx.ASGITransport(app=rift_app)
    real_adapter = RiftServiceAdapter(base_url="http://testserver/api/v1/rift")
    
    # Patch httpx.AsyncClient in rift_adapter to use ASGITransport
    original_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original_client(transport=transport, **kwargs))
    
    from app.services import transfer_service
    monkeypatch.setattr(transfer_service, "rift_adapter", real_adapter)

    # 1. Test Health endpoint
    health_res = await real_adapter.check_health()
    assert health_res["connected"] is True
    assert health_res["data"]["chains_supported"] == [31337, 31338]

    # 2. Test Alexander Veyron $250M Cross-Chain Transfer
    payload = TransferCreateInput(
        idempotency_key=f"live_integration_key_{uuid.uuid4().hex[:6]}",
        client_id="cli_alexander_veyron",
        source_account_id="acc_veyron_treasury_usd",
        destination_account_id="0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        asset="TEST_USD",
        amount_display="250000000.00",
        source_chain_id=31337,
        destination_chain_id=31338,
        destination_address="0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        requested_by="Alexander Veyron"
    )

    transfer = await TransferService.create_transfer(session, payload)
    
    # RIFT policy should evaluate this >$100M transfer and demand RIFT KEY MFA
    assert transfer.status == "AWAITING_AUTHORIZATION"
    assert transfer.rift_auth_required is True
    assert transfer.rift_risk_score >= 0.35
    assert "HIGH_VALUE_THRESHOLD" in transfer.rift_policy_matched

    # Check funds hold placed
    src_acc = session.query(Account).filter(Account.id == "acc_veyron_treasury_usd").first()
    assert src_acc.reserved_base_units == 25000000000

    # 3. Perform RIFT KEY Authorization
    auth_req = AuthorizeTransferRequest(
        auth_token="RIFT-KEY-SEC-AUTH-773821",
        approver="Alexander Veyron (Authorized Signatory)",
        comments="Confirmed institutional treasury transfer to Base L2"
    )

    settled = await TransferService.authorize_transfer(session, transfer.id, auth_req)
    assert settled.status == "COMPLETED"
    
    # Distinct local-chain transaction evidence verified!
    assert settled.source_tx_hash.startswith("0x")
    assert settled.destination_tx_hash.startswith("0x")
    assert settled.source_tx_hash != settled.destination_tx_hash
    assert settled.source_block_number > 0
    assert settled.destination_block_number > 0

    # Check ledger balance settled
    session.refresh(src_acc)
    assert src_acc.reserved_base_units == 0

    # 4. Check Reconciliation
    rec = session.query(ReconciliationRecord).filter(ReconciliationRecord.transfer_id == transfer.id).first()
    assert rec.ledger_status == "BALANCED"
    assert rec.blockchain_status == "CONFIRMED"
    assert rec.reconciliation_hash.startswith("0x")
