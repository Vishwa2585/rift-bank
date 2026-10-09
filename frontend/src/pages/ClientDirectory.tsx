import React from 'react';
import { Users, Eye, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Client } from '../types';

interface ClientDirectoryProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  onSelectScreen: (screen: any) => void;
}

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({
  clients,
  onSelectClient,
  onSelectScreen
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Private Client Directory</h2>
          <p className="text-xs text-slate-400">
            Fictional high-net-worth universe for institutional interchain demonstration (CSB-01).
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
          6 Verified Profiles · Backend Persisted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((c) => (
          <GlassCard key={c.id} className="hover:border-cyan-500/40 transition group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  {c.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                {c.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                {c.headline || 'High-Net-Worth Principal'}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Simulated Net Worth:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {c.simulated_net_worth_display}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Managed Accounts:</span>
                  <span className="font-mono text-slate-200">{c.accounts?.length || 0} active</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5">
              <button
                onClick={() => {
                  onSelectClient(c.id);
                  onSelectScreen('profile');
                }}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition flex items-center justify-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Client Profile & Accounts</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
