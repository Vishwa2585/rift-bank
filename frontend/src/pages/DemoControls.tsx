import React, { useState } from 'react';
import {
  PlaySquare,
  Zap,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Transfer } from '../types';
import { api } from '../services/api';

interface DemoControlsProps {
  onScenarioLaunched: (tx: Transfer) => void;
  onDatabaseReset: () => void;
  onSelectScreen: (screen: any) => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onScenarioLaunched,
  onDatabaseReset,
  onSelectScreen
}) => {
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleLaunchScenario = async () => {
    setLoadingScenario(true);
    setStatusMsg(null);
    try {
      const tx = await api.runAlexanderVeyronScenario();
      onScenarioLaunched(tx);
      setStatusMsg(`Demo Scenario Launched: ${tx.id} created and sent to RIFT.`);
      onSelectScreen('transfer_details');
    } catch (err: any) {
      setStatusMsg(`Scenario Error: ${err.message}`);
    } finally {
      setLoadingScenario(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the bank database and re-seed all accounts?')) {
      return;
    }
    setLoadingReset(true);
    setStatusMsg(null);
    try {
      const res = await api.resetDemoDatabase();
      setStatusMsg(res.message);
      onDatabaseReset();
    } catch (err: any) {
      setStatusMsg(`Reset Error: ${err.message}`);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">FUSION 2026 CSB-01 Demonstration Controls</h2>
          <p className="text-xs text-slate-400">
            Interactive presentation harness for the Alexander Veyron $250M cross-chain simulation.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDatabase}
            disabled={loadingReset}
            className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingReset ? 'animate-spin' : ''}`} />
            <span>Reset Demo DB & Reseed</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {/* Main Repeatable Demo Card */}
      <GlassCard className="p-6 border-cyan-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OFFICIAL SCENARIO
              </span>
              <span className="text-xs text-slate-400">Repeatable Presentation Workflow</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Alexander Veyron · $250,000,000.00 Cross-Chain Strategic Bridge
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrates end-to-end integration: Alexander Veyron ($86.4B simulated net worth) requests a $250M
              transfer from Ethereum Local L1 (31337) to Base Local L2 (31338). RIFT evaluates the intent, detects the
              $100M+ threshold, and requires RIFT KEY biometric authorization. Once authorized, local-chain transactions
              execute and the double-entry ledger settles.
            </p>
          </div>

          <button
            onClick={handleLaunchScenario}
            disabled={loadingScenario}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition flex items-center justify-center space-x-2.5 flex-shrink-0 disabled:opacity-50"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>{loadingScenario ? 'Launching Scenario...' : 'Execute Scenario ($250M)'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Step-by-Step Presentation Script Walkthrough */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white tracking-wide">Presenter Demonstration Script (Step-by-Step)</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
              <span>Step 1: Inspect Client Profile</span>
            </div>
            <p className="text-slate-300">
              Open <strong>Client Profile</strong> for Alexander Veyron. Observe the $86.4B simulated net worth,
              unencumbered balance in the Master Treasury, and $0 current holds.
            </p>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
              <span>Step 2: Dispatch $250M Intent</span>
            </div>
            <p className="text-slate-300">
              Click <strong>Execute Scenario</strong>. RIFT Bank reserves $250M on Veyron's account and dispatches the
              intent to the RIFT adapter.
            </p>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">3</span>
              <span>Step 3: RIFT Policy Enforcement</span>
            </div>
            <p className="text-slate-300">
              RIFT's policy engine flags the &gt;$100M threshold (POL_HIGH_VALUE_THRESHOLD). Status updates to{' '}
              <strong className="text-amber-400">AWAITING_AUTHORIZATION</strong>. Available balance shows the held funds.
            </p>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">4</span>
              <span>Step 4: Authorize via RIFT KEY™</span>
            </div>
            <p className="text-slate-300">
              Click <strong>Authorize with RIFT KEY</strong> in the UI. Enter biometric signatory credentials. RIFT verifies
              the hardware token and triggers local validator execution.
            </p>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">5</span>
              <span>Step 5: Verified Chain Evidence</span>
            </div>
            <p className="text-slate-300">
              Inspect <strong>Blockchain Evidence</strong>. Observe distinct transaction hashes for Chain 31337 (Lock) and
              Chain 31338 (Release) with block receipts and event logs.
            </p>
          </GlassCard>

          <GlassCard className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">6</span>
              <span>Step 6: Reconciliation & Balancing</span>
            </div>
            <p className="text-slate-300">
              Inspect <strong>Reconciliation</strong> and <strong>Account Ledger</strong>. Verify that Debits == Credits and
              discrepancy is strictly $0.00.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
