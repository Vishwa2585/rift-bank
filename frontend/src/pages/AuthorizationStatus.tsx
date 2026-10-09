import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, AlertTriangle, Fingerprint, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiftKeyModal } from '../components/RiftKeyModal';
import { Transfer } from '../types';
import { api } from '../services/api';

export const AuthorizationStatus: React.FC = () => {
  const [pendingTransfers, setPendingTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transfer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPending = () => {
    setLoading(true);
    api.getTransfers({ status: 'AWAITING_AUTHORIZATION' })
      .then(setPendingTransfers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">RIFT KEY™ Authorization Hub</h2>
          <p className="text-xs text-slate-400">
            Mandatory hardware and biometric authorization queue for high-value interchain intents.
          </p>
        </div>
        <button
          onClick={loadPending}
          className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info Callout */}
      <GlassCard className="p-4 border-amber-500/30 bg-amber-950/15">
        <div className="flex items-start space-x-3">
          <KeyRound className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-amber-300">Policy Matched: POL_HIGH_VALUE_THRESHOLD_RIFT_KEY_MANDATORY</div>
            <p className="text-slate-300">
              RIFT's autonomous policy engine mandates hardware key biometric authentication for operations exceeding $100M
              prior to emitting execution instructions to local validator nodes. Funds are securely locked on hold.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Pending Items List */}
      <div className="space-y-4">
        {pendingTransfers.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-300">No operations currently awaiting authorization.</p>
            <p className="text-slate-500 text-[11px] mt-1">
              Trigger a transfer above $100M or run the Alexander Veyron demo scenario to populate this queue.
            </p>
          </GlassCard>
        ) : (
          pendingTransfers.map((tx) => (
            <GlassCard key={tx.id} className="p-5 border-amber-500/30 hover:border-amber-500/50 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-300 font-bold text-sm">{tx.id}</span>
                    <StatusBadge status={tx.status} />
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                      RIFT KEY MFA Required
                    </span>
                  </div>

                  <div className="text-base font-bold text-white font-mono">
                    ${tx.amount_display} {tx.asset}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                    <div>Signatory: <span className="text-slate-200">{tx.requested_by}</span></div>
                    <div>Route: <span className="text-purple-300">Chain {tx.source_chain_id} → Chain {tx.destination_chain_id}</span></div>
                    <div>RIFT Op: <span className="text-slate-300">{tx.rift_operation_id}</span></div>
                    <div>Risk Score: <span className="text-orange-400 font-bold">{tx.rift_risk_score} (ELEVATED)</span></div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center">
                  <button
                    onClick={() => {
                      setSelectedTx(tx);
                      setModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 animate-pulse"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Authorize with RIFT KEY™</span>
                  </button>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">Locks funds until validated</span>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {modalOpen && selectedTx && (
        <RiftKeyModal
          transfer={selectedTx}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadPending();
          }}
        />
      )}
    </div>
  );
};
