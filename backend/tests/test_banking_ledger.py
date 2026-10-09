"""
Comprehensive automated tests for RIFT Bank:
- Double-entry ledger balancing
- Decimal precision & base units
- Client & account portfolio retrieval
- Fund reservation & settlement lifecycle
- Insufficient balance rejection
- Idempotent transfer retries
- RIFT adapter offline handling (RIFT CONNECTION UNAVAILABLE)
- RIFT KEY authorization & verified local-chain evidence persistence
- Reconciliation auditing
"""

import pytest
import uuid
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.client import Client
from app.models.account import Account
from app.models.ledger import LedgerEntry
from app.models.transfer import Transfer
from app.models.reconciliation import ReconciliationRecord
from app.services.ledger_engine import (
    LedgerEngine,
    InsufficientFundsException,
    UnbalancedLedgerException
)
from app.services.transfer_service import TransferService
from app.services.client_service import ClientService
from app.schemas.common import TransferCreateInput, AuthorizeTransferRequest
from app.adapters.rift_adapter import IRiftAdapter, RiftUnavailableException, RiftRejectedException
from app.seeds.seed_data import seed_database

# In-memory test SQLite database
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    # Seed initial test data
    seed_database(session, force=True)
    
    yield session
    session.close()

# Mock adapter for unit testing adapter boundary conditions
class MockRiftAdapter(IRiftAdapter):
    def __init__(self, mode="online"):
        self.mode = mode

    async def check_health(self):
        if self.mode == "offline":
            return {"connected": False, "error": "RIFT CONNECTION UNAVAILABLE"}
        return {"connected": True, "data": {"status": "healthy"}}

    async def submit_intent(self, intent_payload):
        if self.mode == "offline":
            raise RiftUnavailableException("RIFT CONNECTION UNAVAILABLE")
        if self.mode == "reject":
            raise RiftRejectedException("Rejected by policy engine")
        return {
            "rift_operation_id": f"rift_test_{uuid.uuid4().hex[:6]}",
            "status": "AWAITING_AUTHORIZATION",
            "risk_assessment": {
                "risk_score": 0.42,
                "risk_level": "ELEVATED",
                "factors": ["High-value transfer > $100M threshold"],
                "policy_matched": "POL_HIGH_VALUE_THRESHOLD_RIFT_KEY_MANDATORY"
            },
            "authorization_requirements": {
                "required": True,
                "mechanism": "RIFT_KEY_MFA",
                "auth_url": "/authorization/rift-key/mock"
            }
        }

    async def get_operation_status(self, rift_operation_id: str):
        if self.mode == "offline":
            raise RiftUnavailableException("RIFT CONNECTION UNAVAILABLE")
        return {"status": "AWAITING_AUTHORIZATION"}

    async def authorize_operation(self, rift_operation_id: str, approver: str, auth_token: str, comments=None):
        if self.mode == "offline":
            raise RiftUnavailableException("RIFT CONNECTION UNAVAILABLE")
        return {
            "rift_operation_id": rift_operation_id,
            "status": "COMPLETED",
            "blockchain_evidence": {
                "source": {
                    "chain_id": 31337,
                    "chain_name": "Ethereum Local L1",
                    "tx_hash": "0x4e6b21789c1a5b4819d9c57d76a7e089d71c6d831512fb94711f7c234b6b23d1",
                    "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                    "block_number": 10482
                },
                "destination": {
                    "chain_id": 31338,
                    "chain_name": "Base Local L2",
                    "tx_hash": "0x89d71c6d831512fb94711f7c234b6b23d14e6b21789c1a5b4819d9c57d76a7e0",
                    "contract_address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
                    "block_number": 8912
                },
                "forensic_summary": {
                    "reconciliation_hash": "0xcc29381710928390192837461928374019283746"
                }
            }
        }

    async def get_investigation_case(self, rift_operation_id: str):
        return {"case_id": f"CASE-{rift_operation_id}", "status": "VERIFIED"}


def test_client_and_account_seeding(db_session):
    """Verifies all 6 high-net-worth clients are present with accounts."""
    clients = db_session.query(Client).filter(Client.status != "SYSTEM").all()
    assert len(clients) == 6
    names = [c.name for c in clients]
    assert "Alexander Veyron" in names
    assert "Isabella Laurent" in names
    assert "Cassian Wolfe" in names
    assert "Zara Ellington" in names
    assert "Adrian Blackwell" in names
    assert "Helena Ashford" in names

    # Alexander Veyron account checks
    veyron = db_session.query(Client).filter(Client.id == "cli_alexander_veyron").first()
    assert len(veyron.accounts) >= 4
    treasury = next(a for a in veyron.accounts if a.id == "acc_veyron_treasury_usd")
    assert treasury.balance_base_units == 485000000000  # $4.85B in cents


def test_monetary_base_unit_precision():
    """Validates precise integer base units representation without floating point inaccuracy."""
    base_usd = LedgerEngine.parse_to_base_units("250000000.00", "TEST_USD")
    assert base_usd == 25000000000
    formatted = LedgerEngine.format_base_units(base_usd, "TEST_USD")
    assert formatted == "250,000,000.00"

    base_eth = LedgerEngine.parse_to_base_units("150000.500000", "TEST_ETH")
    assert base_eth == 150000500000


def test_initial_ledger_is_strictly_balanced(db_session):
    """Validates that initial system capitalization produced balanced debits and credits."""
    assets = db_session.query(LedgerEntry.asset).distinct().all()
    for (asset,) in assets:
        debits = sum(e.amount_base_units for e in db_session.query(LedgerEntry).filter(
            LedgerEntry.asset == asset, LedgerEntry.direction == "DEBIT"
        ).all())
        credits = sum(e.amount_base_units for e in db_session.query(LedgerEntry).filter(
            LedgerEntry.asset == asset, LedgerEntry.direction == "CREDIT"
        ).all())
        assert debits == credits, f"Asset {asset} is unbalanced: debits={debits}, credits={credits}"


def test_unbalanced_ledger_rejection(db_session):
    """Verifies that an intentionally unbalanced ledger transaction is aborted."""
    with pytest.raises(UnbalancedLedgerException):
        LedgerEngine.post_balanced_transaction(
            db=db_session,
            transaction_id="unbalanced_tx_test",
            asset="TEST_USD",
            entry_type="TRANSFER",
            entries=[
                {"account_id": "acc_veyron_treasury_usd", "direction": "DEBIT", "amount_base_units": 1000},
                {"account_id": "acc_veyron_liquidity_usd", "direction": "CREDIT", "amount_base_units": 500} # Mismatch!
            ]
        )


def test_internal_transfer_balanced_execution(db_session):
    """Tests account-to-account internal transfer."""
    src = "acc_veyron_treasury_usd"
    dst = "acc_veyron_liquidity_usd"
    
    src_before = db_session.query(Account).filter(Account.id == src).first().balance_base_units
    dst_before = db_session.query(Account).filter(Account.id == dst).first().balance_base_units

    amount_units = 50_000_000_00  # $50M

    entries = LedgerEngine.execute_internal_transfer(
        db=db_session,
        transfer_id="tx_internal_test_1",
        source_account_id=src,
        dest_account_id=dst,
        asset="TEST_USD",
        amount_base_units=amount_units,
        memo="Internal portfolio rebalancing"
    )

    assert len(entries) == 2
    src_after = db_session.query(Account).filter(Account.id == src).first().balance_base_units
    dst_after = db_session.query(Account).filter(Account.id == dst).first().balance_base_units

    assert src_after == src_before - amount_units
    assert dst_after == dst_before + amount_units


def test_insufficient_balance_rejection(db_session):
    """Tests rejection when requested transfer amount exceeds available balance."""
    with pytest.raises(InsufficientFundsException):
        LedgerEngine.reserve_funds(
            db=db_session,
            account_id="acc_ashford_treasury_usd",
            amount_base_units=999_999_999_999_00,  # Far exceeds balance
            operation_id="op_excessive"
        )


def test_idempotent_transfer_retries(db_session):
    """Verifies duplicate request with same idempotency_key returns identical transfer without extra debit."""
    import asyncio
    payload = TransferCreateInput(
        idempotency_key="idempotency_test_key_123",
        client_id="cli_alexander_veyron",
        source_account_id="acc_veyron_treasury_usd",
        destination_account_id="acc_veyron_liquidity_usd",
        asset="TEST_USD",
        amount_display="1000000.00",
        requested_by="Alexander Veyron"
    )

    t1 = asyncio.run(TransferService.create_transfer(db_session, payload))
    t2 = asyncio.run(TransferService.create_transfer(db_session, payload))

    assert t1.id == t2.id
    assert t1.status == "COMPLETED"


def test_cross_chain_reservation_and_offline_handling(db_session, monkeypatch):
    """
    Validates that when RIFT is offline:
    1. Status is marked FAILED with 'RIFT CONNECTION UNAVAILABLE'
    2. Reservation is cleanly released so client funds are never stuck
    3. No fabricated successful hashes are generated
    """
    import asyncio
    from app.services import transfer_service
    
    mock_offline = MockRiftAdapter(mode="offline")
    monkeypatch.setattr(transfer_service, "rift_adapter", mock_offline)

    src_acc = db_session.query(Account).filter(Account.id == "acc_veyron_treasury_usd").first()
    avail_before = src_acc.available_balance_base_units

    payload = TransferCreateInput(
        idempotency_key="offline_test_key_456",
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

    transfer = asyncio.run(TransferService.create_transfer(db_session, payload))
    assert transfer.status == "FAILED"
    assert "RIFT CONNECTION UNAVAILABLE" in transfer.failure_reason
    assert transfer.source_tx_hash is None  # Never fabricated!

    # Funds reservation should be released
    db_session.refresh(src_acc)
    assert src_acc.available_balance_base_units == avail_before


def test_cross_chain_full_authorization_and_settlement_scenario(db_session, monkeypatch):
    """
    Tests the full Alexander Veyron $250M scenario:
    1. Creates intent -> status AWAITING_AUTHORIZATION (held funds)
    2. Authorizes via RIFT KEY -> executes on local chain
    3. Settle ledger -> balanced ledger entries posted
    4. Verified reconciliation record produced
    """
    import asyncio
    from app.services import transfer_service

    mock_online = MockRiftAdapter(mode="online")
    monkeypatch.setattr(transfer_service, "rift_adapter", mock_online)

    src_acc = db_session.query(Account).filter(Account.id == "acc_veyron_treasury_usd").first()
    bal_before = src_acc.balance_base_units
    avail_before = src_acc.available_balance_base_units

    payload = TransferCreateInput(
        idempotency_key="scenario_veyron_250m_test",
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

    # 1. Submit
    transfer = asyncio.run(TransferService.create_transfer(db_session, payload))
    assert transfer.status == "AWAITING_AUTHORIZATION"
    assert transfer.rift_auth_required is True
    assert transfer.rift_risk_score == 0.42

    # Verify reservation placed
    db_session.refresh(src_acc)
    amount_units = 25000000000
    assert src_acc.reserved_base_units == amount_units
    assert src_acc.available_balance_base_units == avail_before - amount_units
    assert src_acc.balance_base_units == bal_before  # Actual balance not deducted until settlement!

    # 2. Authorize
    auth_req = AuthorizeTransferRequest(
        auth_token="RIFT-KEY-SEC-AUTH-773821",
        approver="Alexander Veyron",
        comments="Approved treasury transfer for institutional bond purchase"
    )
    settled_tx = asyncio.run(TransferService.authorize_transfer(db_session, transfer.id, auth_req))

    assert settled_tx.status == "COMPLETED"
    assert settled_tx.source_tx_hash.startswith("0x")
    assert settled_tx.destination_tx_hash.startswith("0x")
    assert settled_tx.source_tx_hash != settled_tx.destination_tx_hash

    # Verify balance settlement
    db_session.refresh(src_acc)
    assert src_acc.reserved_base_units == 0
    assert src_acc.balance_base_units == bal_before - amount_units

    # Verify reconciliation record
    rec = db_session.query(ReconciliationRecord).filter(ReconciliationRecord.transfer_id == transfer.id).first()
    assert rec is not None
    assert rec.ledger_status == "BALANCED"
    assert rec.blockchain_status == "CONFIRMED"
    assert rec.discrepancy_base_units == 0
