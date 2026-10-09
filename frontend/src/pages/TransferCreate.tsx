import React, { useState, useEffect } from 'react';
import {
  Send,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  Layers,
  ArrowDown
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Client, Account, Transfer } from '../types';
import { api } from '../services/api';
import { riftEngine } from '../services/riftEngine';

interface TransferCreateProps {
  clients: Client[];
  initialClientId?: string;
  initialAccountId?: string;
  onTransferCreated: (transfer: Transfer) => void;
  onSelectScreen: (screen: any) => void;
}

export const TransferCreate: React.FC<TransferCreateProps> = ({
  clients,
  initialClientId,
  initialAccountId,
  onTransferCreated,
  onSelectScreen
}) => {
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || clients[0]?.id || '');
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId || '');
  const [transferType, setTransferType] = useState<'CROSS_CHAIN' | 'INTERNAL'>('CROSS_CHAIN');
  
  // Destination state
  const [destAccountId, setDestAccountId] = useState('');
  const [destAddress, setDestAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [destChainId, setDestChainId] = useState(31338);
  const [sourceChainId, setSourceChainId] = useState(31337);

  // Transfer details
  const [amountDisplay, setAmountDisplay] = useState('250000000.00');
  const [memo, setMemo] = useState('FUSION 2026 CSB-01 Demonstration Cross-Chain Transfer');
  const [requestedBy, setRequestedBy] = useState('');

  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active client & accounts
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const accounts = activeClient?.accounts || [];
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  useEffect(() => {
    if (activeClient) {
      setRequestedBy(`${activeClient.name} (Authorized Signatory)`);
      if (!selectedAccountId && accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [selectedClientId, activeClient]);

  // All other accounts in the bank (for internal transfers)
  const allOtherAccounts = clients
    .flatMap((c) => c.accounts || [])
    .filter((a) => a.id !== selectedAccountId);

  const handleSubmit = async () => {
    setError(null);

    if (riftEngine.getState().transfersHeld) {
      setError('LOCAL DEMO ACTION: New transfer intents are currently HELD by RIFT Emergency Security Policy.');
      return;
    }

    setSubmitting(true);
    try {
      const destination = transferType === 'INTERNAL' ? destAccountId : destAddress;
      const idempotencyKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const created = await api.createTransfer({
        idempotency_key: idempotencyKey,
        client_id: selectedClientId,
        source_account_id: selectedAccount.id,
        destination_account_id: destination,
        asset: selectedAccount.asset,
        amount_display: amountDisplay,
        source_chain_id: transferType === 'CROSS_CHAIN' ? sourceChainId : undefined,
        destination_chain_id: transferType === 'CROSS_CHAIN' ? destChainId : undefined,
        destination_address: transferType === 'CROSS_CHAIN' ? destAddress : undefined,
        requested_by: requestedBy,
        memo
      });

      onTransferCreated(created);
      onSelectScreen('transfer_details');
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Financial Transfer Intent</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Initiate internal double-entry transfers or submit cross-chain operations through the RIFT Security Platform.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <GlassCard className="p-4 sm:p-6 space-y-6">
        {/* Step 1 & 2: Client & Source Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              1. Select Fictional Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                const cl = clients.find((c) => c.id === e.target.value);
                if (cl && cl.accounts.length > 0) {
                  setSelectedAccountId(cl.accounts[0].id);
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.category} ({c.simulated_net_worth_display})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              2. Select Source Vault / Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name} ({a.account_number}) — Avail: {(a.available_balance_base_units / 100).toLocaleString()} {a.asset}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transfer Mode Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            3. Transfer Execution Workflow
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTransferType('CROSS_CHAIN')}
              className={`p-3 rounded-xl border text-left transition flex items-center space-x-3 ${
                transferType === 'CROSS_CHAIN'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Cross-Chain Interchain Transit</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Routes through RIFT exploit detection & RIFT KEY authorization</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTransferType('INTERNAL')}
              className={`p-3 rounded-xl border text-left transition flex items-center space-x-3 ${
                transferType === 'INTERNAL'
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-300 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Internal Account-to-Account</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Immediate balanced double-entry ledger settlement</div>
              </div>
            </button>
          </div>
        </div>

        {/* Destination Configuration */}
        {transferType === 'CROSS_CHAIN' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source Chain</label>
              <select
                value={sourceChainId}
                onChange={(e) => setSourceChainId(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value={31337}>Chain 31337 (Ethereum Local L1)</option>
                <option value={31338}>Chain 31338 (Base Local L2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Destination Chain</label>
              <select
                value={destChainId}
                onChange={(e) => setDestChainId(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value={31338}>Chain 31338 (Base Local L2)</option>
                <option value={31337}>Chain 31337 (Ethereum Local L1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Beneficiary Address (Hex)</label>
              <input
                type="text"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Destination Bank Account</label>
            <select
              value={destAccountId}
              onChange={(e) => setDestAccountId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select counterparty account...</option>
              {allOtherAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name} ({a.account_number}) — {a.asset}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Transfer Amount ({selectedAccount?.asset || 'TEST_USD'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">$</span>
              <input
                type="text"
                value={amountDisplay}
                onChange={(e) => setAmountDisplay(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Available to transfer:{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                ${selectedAccount ? (selectedAccount.available_balance_base_units / 100).toLocaleString() : '0.00'}{' '}
                {selectedAccount?.asset}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Authorized Signatory / Initiator
            </label>
            <input
              type="text"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Transfer Memo / Wire Purpose</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Review & Submit Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>High-value operations exceeding $100M trigger mandatory RIFT KEY MFA.</span>
          </div>

          <button
            type="button"
            onClick={() => setReviewOpen(!reviewOpen)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
          >
            <span>{reviewOpen ? 'Hide Review' : 'Review Proposal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Review Proposal Drawer */}
        {reviewOpen && (
          <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-3 font-mono">
            <h4 className="font-sans font-bold text-sm text-cyan-700 dark:text-cyan-300">Transfer Confirmation Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>Client: <span className="text-slate-900 dark:text-white font-semibold">{activeClient?.name}</span></div>
              <div>Workflow: <span className="text-cyan-600 dark:text-cyan-400">{transferType}</span></div>
              <div>Source Vault: <span className="text-slate-900 dark:text-white">{selectedAccount?.account_number}</span></div>
              <div>Amount: <span className="text-emerald-600 dark:text-emerald-400 font-bold">${amountDisplay} {selectedAccount?.asset}</span></div>
              <div>Route: <span className="text-purple-600 dark:text-purple-300">Chain {sourceChainId} → Chain {destChainId}</span></div>
              <div>Destination: <span className="text-slate-800 dark:text-slate-200 truncate">{destAddress}</span></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="animate-pulse">Submitting to RIFT...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize & Dispatch Intent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
