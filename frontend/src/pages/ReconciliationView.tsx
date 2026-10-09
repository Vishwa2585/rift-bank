import React, { useEffect, useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReconciliationRecord } from '../types';
import { api } from '../services/api';

export const ReconciliationView: React.FC = () => {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getReconciliations()
      .then(setRecords)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Financial & On-Chain Reconciliation</h2>
          <p className="text-xs text-slate-400">
            Cross-audit comparing internal double-entry ledger settlements against local blockchain receipts.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Reconciliation Ledger Audit Records</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{records.length} Audited Operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Transfer ID</th>
                <th className="px-4 py-3">Ledger Status</th>
                <th className="px-4 py-3">Chain Status</th>
                <th className="px-4 py-3">Expected Amount</th>
                <th className="px-4 py-3">Settled Amount</th>
                <th className="px-4 py-3">Discrepancy</th>
                <th className="px-4 py-3">Reconciliation Hash</th>
                <th className="px-4 py-3">Audited At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No cross-chain transfers completed and reconciled yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-300">{r.id}</td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{r.transfer_id}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.ledger_status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.blockchain_status} />
                    </td>
                    <td className="px-4 py-3 text-white">
                      ${(r.expected_amount_base_units / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">
                      ${(r.settled_amount_base_units / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.discrepancy_base_units === 0 ? (
                        <span className="text-emerald-400 font-bold">$0.00</span>
                      ) : (
                        <span className="text-rose-400 font-bold">${(r.discrepancy_base_units / 100).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]" title={r.reconciliation_hash || ''}>
                      {r.reconciliation_hash ? `${r.reconciliation_hash.substring(0, 10)}...` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(r.audited_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
