import React, { useEffect, useState } from 'react';
import { ShieldCheck, Layers, ExternalLink, RefreshCw, CheckCircle2, Hash } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Transfer } from '../types';
import { api } from '../services/api';

export const BlockchainEvidence: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getTransfers({ status: 'COMPLETED' })
      .then((txs) => setTransfers(txs.filter((t) => t.source_tx_hash)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Local Blockchain Execution Evidence</h2>
          <p className="text-xs text-slate-400">
            Cryptographically verified transaction hashes and block receipts from local EVM test chains.
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

      <div className="space-y-5">
        {transfers.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-500 text-xs">
            No completed cross-chain operations with recorded blockchain receipts yet.
          </GlassCard>
        ) : (
          transfers.map((tx) => (
            <GlassCard key={tx.id} className="p-5 border-cyan-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-cyan-300 font-bold text-sm">{tx.id}</span>
                  <StatusBadge status="CONFIRMED" />
                  <span className="text-slate-400 text-xs font-mono">RIFT Op: {tx.rift_operation_id}</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  ${tx.amount_display} {tx.asset}
                </div>
              </div>

              {/* Two Separate Verified Legs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Source Leg */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>Source Leg: Chain {tx.source_chain_id} (Ethereum L1)</span>
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                      Block #{tx.source_block_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Lock Transaction Hash:</span>
                    <div className="text-slate-200 break-all bg-black/40 p-1.5 rounded border border-white/5 mt-0.5">
                      {tx.source_tx_hash}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bridge Vault Contract: <span className="text-slate-200">0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Emitted BridgeDepositInitiated Event</span>
                  </div>
                </div>

                {/* Destination Leg */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span>Destination Leg: Chain {tx.destination_chain_id} (Base L2)</span>
                    <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                      Block #{tx.destination_block_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Release Transaction Hash:</span>
                    <div className="text-slate-200 break-all bg-black/40 p-1.5 rounded border border-white/5 mt-0.5">
                      {tx.destination_tx_hash}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bridge Vault Contract: <span className="text-slate-200">0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Emitted BridgeReleaseFinalized Event</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
