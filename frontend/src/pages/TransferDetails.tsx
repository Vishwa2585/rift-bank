import React, { useEffect, useState } from 'react';
import {
  FileText,
  KeyRound,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiftKeyModal } from '../components/RiftKeyModal';
import { Transfer } from '../types';
import { api } from '../services/api';

interface TransferDetailsProps {
  initialTransferId?: string;
  onSelectScreen: (screen: any) => void;
}

export const TransferDetails: React.FC<TransferDetailsProps> = ({
  initialTransferId,
  onSelectScreen
}) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTransfers = () => {
    setLoading(true);
    api.getTransfers()
      .then((txs) => {
        setTransfers(txs);
        if (initialTransferId) {
          const found = txs.find((t) => t.id === initialTransferId);
          if (found) setSelectedTransfer(found);
          else if (txs.length > 0) setSelectedTransfer(txs[0]);
        } else if (txs.length > 0 && !selectedTransfer) {
          setSelectedTransfer(txs[0]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
  }, [initialTransferId]);

  const filteredTransfers = statusFilter === 'ALL'
    ? transfers
    : transfers.filter((t) => t.status === statusFilter);

  const getStepStatus = (stepState: string, currentStatus: string) => {
    const states = [
      'SUBMITTED',
      'RISK_ASSESSMENT_PENDING',
      'AWAITING_AUTHORIZATION',
      'AUTHORIZED',
      'SOURCE_TRANSACTION_CONFIRMED',
      'COMPLETED'
    ];
    const currentIndex = states.indexOf(currentStatus);
    const stepIndex = states.indexOf(stepState);

    if (currentStatus === 'FAILED' || currentStatus === 'REJECTED') {
      if (stepState === currentStatus) return 'failed';
    }

    if (currentIndex >= stepIndex && currentIndex !== -1) return 'completed';
    if (currentIndex + 1 === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Transfer Operations & Tracking</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lifecycle monitoring, RIFT security policies, RIFT KEY authorization, and execution states.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchTransfers}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transfer List Stream */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Operations ({filteredTransfers.length})</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="ALL">All States</option>
              <option value="AWAITING_AUTHORIZATION">Awaiting Authorization</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredTransfers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-sans">
                No transfer records matching filter.
              </div>
            ) : (
              filteredTransfers.map((t) => {
                const isSelected = selectedTransfer?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTransfer(t)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-200 dark:bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold">{t.id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      ${t.amount_display} {t.asset}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{t.transfer_type}</span>
                      <span>{new Date(t.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Transfer Deep Inspection */}
        <div className="lg:col-span-2">
          {selectedTransfer ? (
            <GlassCard className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Operation:</span>
                    <h3 className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-300">{selectedTransfer.id}</h3>
                    <StatusBadge status={selectedTransfer.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                    Requested by: <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedTransfer.requested_by}</span>
                  </p>
                </div>

                {selectedTransfer.status === 'AWAITING_AUTHORIZATION' && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 animate-pulse"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize with RIFT KEY™</span>
                  </button>
                )}
              </div>

              {/* Progress Stepper */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Transfer Lifecycle Stepper
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { label: 'Submitted', key: 'SUBMITTED' },
                    { label: 'Risk Evaluated', key: 'AWAITING_AUTHORIZATION' },
                    { label: 'RIFT KEY Approved', key: 'AUTHORIZED' },
                    { label: 'Settled & Verified', key: 'COMPLETED' }
                  ].map((step, idx) => {
                    const st = getStepStatus(step.key, selectedTransfer.status);
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                          st === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : st === 'current'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 font-sans">Stage {idx + 1}</span>
                        <span className="font-semibold">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operation Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="font-sans font-semibold text-slate-800 dark:text-slate-300">Financial Ledger Impact</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                    <span className="text-slate-900 dark:text-white font-bold">${selectedTransfer.amount_display} {selectedTransfer.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Source Account:</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedTransfer.source_account_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Destination:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{selectedTransfer.destination_account_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Memo:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-sans truncate">{selectedTransfer.memo || '—'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="font-sans font-semibold text-slate-800 dark:text-slate-300">RIFT Security Metadata</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">RIFT Operation ID:</span>
                    <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{selectedTransfer.rift_operation_id || 'Pending submission'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Risk Assessment:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{selectedTransfer.rift_risk_score ?? '0.42'} ({selectedTransfer.rift_risk_level || 'ELEVATED'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Matched Policy:</span>
                    <span className="text-amber-600 dark:text-amber-300 truncate max-w-[180px]">{selectedTransfer.rift_policy_matched || 'POL_HIGH_VALUE_THRESHOLD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">RIFT KEY Required:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{selectedTransfer.rift_auth_required ? 'YES (MFA)' : 'NO'}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Evidence Receipts */}
              {selectedTransfer.source_tx_hash && (
                <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono space-y-2.5">
                  <div className="flex items-center justify-between font-sans">
                    <span className="font-bold text-sm text-cyan-700 dark:text-cyan-300">Verified Local Blockchain Receipts</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Confirmed on Local EVM</span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Source Leg (Chain {selectedTransfer.source_chain_id}):</span>
                    <div className="text-slate-800 dark:text-slate-200 break-all bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded border border-slate-200 dark:border-white/5 mt-0.5">
                      {selectedTransfer.source_tx_hash}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Destination Leg (Chain {selectedTransfer.destination_chain_id}):</span>
                    <div className="text-slate-800 dark:text-slate-200 break-all bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded border border-slate-200 dark:border-white/5 mt-0.5">
                      {selectedTransfer.destination_tx_hash}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Source Block: #{selectedTransfer.source_block_number}</span>
                    <span>Destination Block: #{selectedTransfer.destination_block_number}</span>
                  </div>
                </div>
              )}

              {/* Failure Notice */}
              {selectedTransfer.failure_reason && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Execution Suspended</div>
                    <div>{selectedTransfer.failure_reason}</div>
                  </div>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              Select an operation to inspect lifecycle details.
            </GlassCard>
          )}
        </div>
      </div>

      {/* RIFT KEY Modal */}
      {modalOpen && selectedTransfer && (
        <RiftKeyModal
          transfer={selectedTransfer}
          onClose={() => setModalOpen(false)}
          onSuccess={(updated) => {
            setSelectedTransfer(updated);
            setModalOpen(false);
            fetchTransfers();
          }}
        />
      )}
    </div>
  );
};
