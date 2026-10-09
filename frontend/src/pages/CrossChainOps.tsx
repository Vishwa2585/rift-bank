import React, { useEffect, useState } from 'react';
import { Link2, Zap, ArrowRight, ShieldCheck, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiftKeyModal } from '../components/RiftKeyModal';
import { Transfer } from '../types';
import { api } from '../services/api';

export const CrossChainOps: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transfer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getTransfers({ transfer_type: 'CROSS_CHAIN' })
      .then(setTransfers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Cross-Chain Bridge Operations</h2>
          <p className="text-xs text-slate-400">
            Multi-network operations routed across Ethereum Local L1 (31337) and Base Local L2 (31338).
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Connectivity Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 font-mono">
              L1
            </div>
            <div>
              <div className="font-bold text-sm text-white">Ethereum Local L1 (Anvil)</div>
              <div className="text-[11px] text-slate-400 font-mono">Chain ID: 31337 · Contract: 0x5FbD...aa3</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ACTIVE
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 font-mono">
              L2
            </div>
            <div>
              <div className="font-bold text-sm text-white">Base Local L2 (Anvil)</div>
              <div className="text-[11px] text-slate-400 font-mono">Chain ID: 31338 · Contract: 0x9fE4...6e0</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ACTIVE
          </span>
        </GlassCard>
      </div>

      {/* Cross Chain Queue */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Cross-Chain Interchain Transit Log</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{transfers.length} Bridge Operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Operation ID</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">RIFT Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No cross-chain operations submitted yet.
                  </td>
                </tr>
              ) : (
                transfers.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-300 font-semibold">{tx.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans">{tx.requested_by.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-purple-300">
                      Chain {tx.source_chain_id} → Chain {tx.destination_chain_id}
                    </td>
                    <td className="px-4 py-3 text-white font-bold">${tx.amount_display} {tx.asset}</td>
                    <td className="px-4 py-3">
                      <span className="text-orange-400 font-bold">{tx.rift_risk_score ?? '0.42'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      {tx.status === 'AWAITING_AUTHORIZATION' ? (
                        <button
                          onClick={() => {
                            setSelectedTx(tx);
                            setModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Authorize</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">Logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* RIFT KEY Modal */}
      {modalOpen && selectedTx && (
        <RiftKeyModal
          transfer={selectedTx}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};
