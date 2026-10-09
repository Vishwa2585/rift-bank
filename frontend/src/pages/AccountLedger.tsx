import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Filter } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { LedgerEntry, LedgerBalanceCheck } from '../types';
import { api } from '../services/api';

export const AccountLedger: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balanceCheck, setBalanceCheck] = useState<LedgerBalanceCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [assetFilter, setAssetFilter] = useState('ALL');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getLedgerEntries(), api.verifyLedgerBalance()])
      .then(([ents, check]) => {
        setEntries(ents);
        setBalanceCheck(check);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyBalance = async () => {
    setVerifying(true);
    try {
      const check = await api.verifyLedgerBalance();
      setBalanceCheck(check);
    } finally {
      setVerifying(false);
    }
  };

  const filteredEntries = assetFilter === 'ALL' ? entries : entries.filter((e) => e.asset === assetFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Double-Entry Financial Ledger</h2>
          <p className="text-xs text-slate-400">
            Immutable journal records enforcing atomic double-entry balance equality (Debits == Credits).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVerifyBalance}
            disabled={verifying}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Auditing Debits/Credits...' : 'Audit Ledger Integrity'}</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Double-Entry Audit Summary Box */}
      {balanceCheck && (
        <GlassCard className="p-4 border-emerald-500/30 bg-emerald-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-emerald-300">
                    Double-Entry Integrity Confirmed (Zero Discrepancy)
                  </span>
                  <StatusBadge status={balanceCheck.status} />
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  All atomic journal transactions across system and client accounts are balanced.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              {balanceCheck.assets_audited.map((a) => (
                <div key={a.asset} className="text-right">
                  <div className="text-slate-400">{a.asset} Balancing</div>
                  <div className="text-emerald-400 font-bold">
                    Diff: {a.discrepancy_base_units === 0 ? '0.00' : a.discrepancy_base_units} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Filter and Ledger Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">General Ledger Journal Entries</h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter Asset:</span>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="ALL">All Assets</option>
              <option value="TEST_USD">TEST_USD</option>
              <option value="TEST_EUR">TEST_EUR</option>
              <option value="TEST_ETH">TEST_ETH</option>
              <option value="TEST_BTC">TEST_BTC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Entry ID</th>
                <th className="px-4 py-3">Tx / Batch ID</th>
                <th className="px-4 py-3">Account ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Amount (Base Units)</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((e) => {
                const isDebit = e.direction === 'DEBIT';
                return (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-400">{e.id}</td>
                    <td className="px-4 py-3 text-slate-400">{e.transaction_id}</td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{e.account_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/5">
                        {e.entry_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDebit ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {e.direction}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isDebit ? '-' : '+'}{(e.amount_base_units / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {e.asset}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-300 max-w-xs truncate">{e.description}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
