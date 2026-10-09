import {
  Client,
  ClientProfile,
  Account,
  LedgerEntry,
  Transfer,
  ReconciliationRecord,
  AuditLog,
  LedgerBalanceCheck,
  RiftHealth
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errorDetail = body.detail || JSON.stringify(body);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    return handleResponse<Client[]>(res);
  },

  async getClient(id: string): Promise<ClientProfile> {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    return handleResponse<ClientProfile>(res);
  },

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const res = await fetch(`${API_BASE}/accounts`);
    return handleResponse<Account[]>(res);
  },

  async getAccount(id: string): Promise<Account> {
    const res = await fetch(`${API_BASE}/accounts/${id}`);
    return handleResponse<Account>(res);
  },

  async getAccountStatement(id: string): Promise<LedgerEntry[]> {
    const res = await fetch(`${API_BASE}/accounts/${id}/statement`);
    return handleResponse<LedgerEntry[]>(res);
  },

  // Transfers
  async getTransfers(filter?: { client_id?: string; status?: string; transfer_type?: string }): Promise<Transfer[]> {
    const params = new URLSearchParams();
    if (filter?.client_id) params.append('client_id', filter.client_id);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.transfer_type) params.append('transfer_type', filter.transfer_type);
    const res = await fetch(`${API_BASE}/transfers?${params.toString()}`);
    return handleResponse<Transfer[]>(res);
  },

  async getTransfer(id: string): Promise<Transfer> {
    const res = await fetch(`${API_BASE}/transfers/${id}`);
    return handleResponse<Transfer>(res);
  },

  async createTransfer(payload: {
    idempotency_key: string;
    client_id: string;
    source_account_id: string;
    destination_account_id: string;
    asset: string;
    amount_display: string;
    source_chain_id?: number;
    destination_chain_id?: number;
    destination_address?: string;
    requested_by: string;
    memo?: string;
  }): Promise<Transfer> {
    const res = await fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Transfer>(res);
  },

  async authorizeTransfer(id: string, payload: { auth_token: string; approver: string; comments?: string }): Promise<Transfer> {
    const res = await fetch(`${API_BASE}/transfers/${id}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Transfer>(res);
  },

  // Ledger
  async getLedgerEntries(filter?: { account_id?: string; transaction_id?: string; asset?: string }): Promise<LedgerEntry[]> {
    const params = new URLSearchParams();
    if (filter?.account_id) params.append('account_id', filter.account_id);
    if (filter?.transaction_id) params.append('transaction_id', filter.transaction_id);
    if (filter?.asset) params.append('asset', filter.asset);
    const res = await fetch(`${API_BASE}/ledger?${params.toString()}`);
    return handleResponse<LedgerEntry[]>(res);
  },

  async verifyLedgerBalance(): Promise<LedgerBalanceCheck> {
    const res = await fetch(`${API_BASE}/ledger/balance-check`);
    return handleResponse<LedgerBalanceCheck>(res);
  },

  // Reconciliation
  async getReconciliations(): Promise<ReconciliationRecord[]> {
    const res = await fetch(`${API_BASE}/reconciliation`);
    return handleResponse<ReconciliationRecord[]>(res);
  },

  // Audit
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit`);
    return handleResponse<AuditLog[]>(res);
  },

  // RIFT
  async getRiftStatus(): Promise<RiftHealth> {
    const res = await fetch(`${API_BASE}/rift/status`);
    return handleResponse<RiftHealth>(res);
  },

  async getRiftInvestigation(opId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/rift/investigation/${opId}`);
    return handleResponse<any>(res);
  },

  // Demo Controls
  async resetDemoDatabase(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return handleResponse<{ status: string; message: string }>(res);
  },

  async runAlexanderVeyronScenario(): Promise<Transfer> {
    const res = await fetch(`${API_BASE}/demo/scenario/alexander-veyron-250m`, { method: 'POST' });
    return handleResponse<Transfer>(res);
  }
};
