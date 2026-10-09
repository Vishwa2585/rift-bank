import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Client, Transfer } from '../types';

interface BankOverviewProps {
  clients: Client[];
  transfers: Transfer[];
  onSelectClient: (id: string) => void;
  onSelectScreen: (screen: any) => void;
  onLaunchDemoScenario: () => void;
}

export const BankOverview: React.FC<BankOverviewProps> = ({
  clients,
  transfers,
  onSelectClient,
  onSelectScreen,
  onLaunchDemoScenario
}) => {
  const totalSimulatedWealth = clients.reduce((acc, c) => acc + c.simulated_net_worth_units, 0);
  const totalSimulatedBillion = (totalSimulatedWealth / 100_000_000_000).toFixed(1);

  const pendingAuthCount = transfers.filter((t) => t.status === 'AWAITING_AUTHORIZATION').length;
  const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100 via-cyan-50 to-slate-100 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-slate-900/40 border border-cyan-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              FUSION 2026 · CSB-01
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Institutional Interchain Security Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">RIFT Bank Private Operations Console</h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl mt-0.5">
            Real application double-entry financial ledger orchestrating high-value transfer intents through the RIFT
            exploit detection and RIFT KEY authorization pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onLaunchDemoScenario}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Launch CSB-01 ($250M Demo)</span>
          </button>
        </div>
      </div>

      {/* Distinction Reminder Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-start space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-200">1. Simulated Balances</div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Invented wealth profiles for fictional billionaires & funds.</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-start space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-200">2. Authoritative Database Ledger</div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Strict double-entry debits/credits & fund holds in SQLite.</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-start space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-200">3. Verified Chain Transactions</div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">Distinct cryptographic tx receipts on local EVM 31337 & 31338.</div>
          </div>
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Simulated Private Wealth</span>
            <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">${totalSimulatedBillion}B</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across 6 High-Net-Worth Client Profiles</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Pending RIFT KEY Authorizations</span>
            <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">{pendingAuthCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires biometric / hardware verification</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Settled Operations</span>
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">{completedCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Balanced double-entry ledger records</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Active Local Chains</span>
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 tracking-tight">2 Networks</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Chain 31337 (L1) ↔ Chain 31338 (L2)</div>
        </GlassCard>
      </div>

      {/* Clients & Transfer Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client Universe Quick-Inspect */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Fictional Private Clients</h3>
            <button
              onClick={() => onSelectScreen('clients')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center space-x-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {clients.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onSelectClient(c.id);
                  onSelectScreen('profile');
                }}
                className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 hover:border-cyan-500/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {c.simulated_net_worth_display}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{c.accounts?.length || 0} accounts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Transfers Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Live Interchain Financial Operations</h3>
            <button
              onClick={() => onSelectScreen('transfer_details')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center space-x-1 font-medium"
            >
              <span>All Operations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono">
                  <tr>
                    <th className="px-4 py-3">Operation ID</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                        No financial transfers initiated yet. Launch the demonstration scenario or create a transfer.
                      </td>
                    </tr>
                  ) : (
                    transfers.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{t.id}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{t.requested_by.split(' ')[0]}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                          ${t.amount_display} {t.asset}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                            {t.transfer_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onSelectScreen('transfer_details')}
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-xs font-medium"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
