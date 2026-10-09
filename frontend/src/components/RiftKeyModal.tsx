import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Fingerprint, X, AlertTriangle } from 'lucide-react';
import { Transfer } from '../types';
import { api } from '../services/api';

interface RiftKeyModalProps {
  transfer: Transfer;
  onClose: () => void;
  onSuccess: (updatedTransfer: Transfer) => void;
}

export const RiftKeyModal: React.FC<RiftKeyModalProps> = ({ transfer, onClose, onSuccess }) => {
  const [approver, setApprover] = useState(transfer.requested_by || 'Alexander Veyron (Authorized Signatory)');
  const [authToken, setAuthToken] = useState('RIFT-KEY-SEC-AUTH-773821');
  const [comments, setComments] = useState('Approved treasury transfer for institutional settlement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorize = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.authorizeTransfer(transfer.id, {
        auth_token: authToken,
        approver,
        comments
      });
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-[#090d16] border border-cyan-500/40 p-4 sm:p-6 shadow-2xl shadow-cyan-500/10 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-wide text-white">RIFT KEY™ MFA Authorization</h3>
            <p className="text-xs text-slate-400">Interchain Policy Enforcement Protocol (CSB-01)</p>
          </div>
        </div>

        {/* Transfer Brief */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs space-y-2 mb-4 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Transfer ID:</span>
            <span className="text-slate-200">{transfer.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount:</span>
            <span className="text-amber-400 font-bold">${transfer.amount_display} {transfer.asset}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Interchain Route:</span>
            <span className="text-cyan-400">Chain {transfer.source_chain_id} → Chain {transfer.destination_chain_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Policy Trigger:</span>
            <span className="text-amber-300">{transfer.rift_policy_matched || 'POL_HIGH_VALUE_THRESHOLD'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">RIFT Risk Score:</span>
            <span className="text-orange-400 font-semibold">{transfer.rift_risk_score ?? '0.42'} (ELEVATED)</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 mb-6 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Authorized Approver / Signatory</label>
            <input
              type="text"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">RIFT KEY Security Hardware Token</label>
            <div className="relative">
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 pl-9"
              />
              <Fingerprint className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Authorization Memo / Audit Reason</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthorize}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Signing & Submitting...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
