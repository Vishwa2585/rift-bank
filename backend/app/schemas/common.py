from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# Client Schemas
class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    account_number: str
    account_name: str
    account_type: str
    asset: str
    balance_base_units: int
    reserved_base_units: int
    available_balance_base_units: int
    is_active: bool
    chain_id: Optional[int] = None
    onchain_address: Optional[str] = None
    created_at: datetime

class ClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    headline: Optional[str] = None
    simulated_net_worth_display: str
    simulated_net_worth_units: int
    avatar_url: Optional[str] = None
    status: str
    created_at: datetime
    accounts: List[AccountOut] = []

class ClientProfileOut(ClientOut):
    total_calculated_usd: float
    total_reserved_usd: float
    total_available_usd: float
    asset_allocation: List[dict]

# Ledger Schemas
class LedgerEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transaction_id: str
    account_id: str
    asset: str
    direction: str  # DEBIT or CREDIT
    amount_base_units: int
    timestamp: datetime
    entry_type: str
    related_operation_id: Optional[str] = None
    status: str
    reversal_reference_id: Optional[str] = None
    description: str

# Transfer Schemas
class TransferCreateInput(BaseModel):
    idempotency_key: str
    client_id: str
    source_account_id: str
    destination_account_id: str
    asset: str
    amount_display: str
    source_chain_id: Optional[int] = None
    destination_chain_id: Optional[int] = None
    destination_address: Optional[str] = None
    requested_by: str
    memo: Optional[str] = None

class TransferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idempotency_key: str
    client_id: str
    source_account_id: str
    destination_account_id: str
    transfer_type: str
    asset: str
    amount_base_units: int
    amount_display: str
    source_chain_id: Optional[int] = None
    destination_chain_id: Optional[int] = None
    destination_address: Optional[str] = None
    requested_by: str
    memo: Optional[str] = None
    status: str
    rift_operation_id: Optional[str] = None
    rift_risk_score: Optional[float] = None
    rift_risk_level: Optional[str] = None
    rift_policy_matched: Optional[str] = None
    rift_auth_required: bool = False
    rift_auth_url: Optional[str] = None
    source_tx_hash: Optional[str] = None
    destination_tx_hash: Optional[str] = None
    source_block_number: Optional[int] = None
    destination_block_number: Optional[int] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AuthorizeTransferRequest(BaseModel):
    auth_token: str = "RIFT-KEY-SEC-AUTH-773821"
    approver: str
    comments: Optional[str] = "Authorized via RIFT KEY biometric security hardware"

# Reconciliation Schemas
class ReconciliationRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transfer_id: str
    rift_operation_id: Optional[str] = None
    ledger_status: str
    blockchain_status: str
    expected_amount_base_units: int
    settled_amount_base_units: int
    discrepancy_base_units: int
    reconciliation_hash: Optional[str] = None
    notes: Optional[str] = None
    audited_at: datetime

# Audit Schemas
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_type: str
    client_id: Optional[str] = None
    transfer_id: Optional[str] = None
    description: str
    metadata_json: Optional[str] = None
    timestamp: datetime
