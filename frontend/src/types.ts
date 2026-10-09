export interface Account {
  id: string;
  client_id: string;
  account_number: string;
  account_name: string;
  account_type: 'TREASURY' | 'LIQUIDITY' | 'ESCROW' | 'SETTLEMENT' | 'CUSTODY';
  asset: 'TEST_USD' | 'TEST_EUR' | 'TEST_ETH' | 'TEST_BTC';
  balance_base_units: number;
  reserved_base_units: number;
  available_balance_base_units: number;
  is_active: boolean;
  chain_id?: number | null;
  onchain_address?: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  category: string;
  headline?: string;
  simulated_net_worth_display: string;
  simulated_net_worth_units: number;
  avatar_url?: string;
  status: string;
  created_at: string;
  accounts: Account[];
}

export interface ClientProfile extends Client {
  total_calculated_usd: number;
  total_reserved_usd: number;
  total_available_usd: number;
  asset_allocation: {
    asset: string;
    value_usd: number;
    percentage: number;
  }[];
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  asset: string;
  direction: 'DEBIT' | 'CREDIT';
  amount_base_units: number;
  timestamp: string;
  entry_type: string;
  related_operation_id?: string;
  status: string;
  reversal_reference_id?: string;
  description: string;
}

export interface Transfer {
  id: string;
  idempotency_key: string;
  client_id: string;
  source_account_id: string;
  destination_account_id: string;
  transfer_type: 'INTERNAL' | 'CROSS_CHAIN';
  asset: string;
  amount_base_units: number;
  amount_display: string;
  source_chain_id?: number;
  destination_chain_id?: number;
  destination_address?: string;
  requested_by: string;
  memo?: string;
  status: string;
  rift_operation_id?: string;
  rift_risk_score?: number;
  rift_risk_level?: string;
  rift_policy_matched?: string;
  rift_auth_required: boolean;
  rift_auth_url?: string;
  source_tx_hash?: string;
  destination_tx_hash?: string;
  source_block_number?: number;
  destination_block_number?: number;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ReconciliationRecord {
  id: string;
  transfer_id: string;
  rift_operation_id?: string;
  ledger_status: string;
  blockchain_status: string;
  expected_amount_base_units: number;
  settled_amount_base_units: number;
  discrepancy_base_units: number;
  reconciliation_hash?: string;
  notes?: string;
  audited_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  client_id?: string;
  transfer_id?: string;
  description: string;
  metadata_json?: string;
  timestamp: string;
}

export interface LedgerBalanceCheck {
  status: string;
  double_entry_integrity_verified: boolean;
  assets_audited: {
    asset: string;
    total_debits_base_units: number;
    total_credits_base_units: number;
    discrepancy_base_units: number;
    is_balanced: boolean;
  }[];
}

export interface RiftHealth {
  connected: boolean;
  data?: {
    status: string;
    service: string;
    version: string;
    chains_supported: number[];
    policy_engine_active: boolean;
    rift_key_service: string;
  };
  error?: string;
  detail?: string;
}
