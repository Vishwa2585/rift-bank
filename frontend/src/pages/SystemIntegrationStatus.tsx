import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw, Server, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiftHealth } from '../types';
import { api } from '../services/api';

export const SystemIntegrationStatus: React.FC = () => {
  const [health, setHealth] = useState<RiftHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [pingTime, setPingTime] = useState<number | null>(null);

  const checkConnectivity = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await api.getRiftStatus();
      setPingTime(Math.round(performance.now() - start));
      setHealth(res);
    } catch (err: any) {
      setHealth({
        connected: false,
        error: 'RIFT CONNECTION UNAVAILABLE',
        detail: err.message
      });
      setPingTime(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const isConnected = health?.connected ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">System Integration & Connectivity</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry and API adapter state between RIFT Bank and the RIFT Security Platform.
          </p>
        </div>
        <button
          onClick={checkConnectivity}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition text-xs flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping RIFT Platform</span>
        </button>
      </div>

      {/* Main Connection Status Banner */}
      <GlassCard className={`p-6 border-2 ${isConnected ? 'border-emerald-500/40 bg-emerald-950/15' : 'border-rose-500/40 bg-rose-950/20'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl border ${isConnected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
              {isConnected ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  {isConnected ? 'RIFT Security Integration Active' : 'RIFT CONNECTION UNAVAILABLE'}
                </h3>
                <StatusBadge status={isConnected ? 'ONLINE' : 'OFFLINE'} />
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isConnected
                  ? 'All transfer intents are evaluated through RIFT detection pipelines and RIFT KEY protocol.'
                  : 'RIFT security service is currently unreachable. RIFT Bank ledger remains accessible in read-only audit mode.'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            {pingTime !== null && (
              <div className="text-emerald-400">
                Round-trip latency: <span className="font-bold">{pingTime} ms</span>
              </div>
            )}
            <div className="text-slate-400 text-[11px] mt-0.5">
              Base URL: <span className="text-slate-200">http://localhost:8001/api/v1/rift</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Contract & Specification Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <GlassCard>
          <div className="text-slate-400 mb-1">Parent Ecosystem</div>
          <div className="text-sm font-bold text-white font-sans">RIFT Interchain Fraud Tracking</div>
          <div className="text-[11px] text-cyan-400 mt-1">FUSION 2026 · CSB-01</div>
        </GlassCard>

        <GlassCard>
          <div className="text-slate-400 mb-1">Policy Engine Status</div>
          <div className="text-sm font-bold text-emerald-400 font-sans">
            {isConnected ? 'Autonomous Heuristics Active' : 'Unreachable'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Threshold: $100M+ MFA Mandatory</div>
        </GlassCard>

        <GlassCard>
          <div className="text-slate-400 mb-1">Supported Local Chains</div>
          <div className="text-sm font-bold text-purple-400">Chain 31337 & 31338</div>
          <div className="text-[11px] text-slate-400 mt-1">Ethereum L1 ↔ Base L2</div>
        </GlassCard>
      </div>

      {/* Offline Degradation Architecture Notice */}
      <GlassCard className="p-5 border-white/10 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Architectural Integrity & Offline Rules</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <div className="font-bold text-slate-200">1. No Fabricated Execution</div>
            <p className="text-slate-400">
              When RIFT is offline, RIFT Bank never synthesizes fake blockchain transaction hashes. Cross-chain execution
              is explicitly suspended and marked with an unavailable status.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <div className="font-bold text-slate-200">2. Ledger Protection & Hold Releases</div>
            <p className="text-slate-400">
              If an intent fails due to RIFT connectivity loss, in-flight reservations on the client's account are
              cleanly released back to available balance, preventing trapped simulated funds.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
