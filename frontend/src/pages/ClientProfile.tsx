import React, { useEffect, useState } from 'react';
import {
  Wallet,
  PieChart,
  History,
  Send,
  ShieldCheck,
  Lock,
  ArrowRight,
  ExternalLink,
  Coins
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { ClientProfile as IClientProfile, Transfer } from '../types';
import { api } from '../services/api';

interface ClientProfileProps {
  clientId: string;
  onSelectScreen: (screen: any) => void;
  onInitTransfer: (clientId: string, accountId: string) => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  clientId,
  onSelectScreen,
  onInitTransfer
}) => {
  const [profile, setProfile] = useState<IClientProfile | null>(null);
  const [clientTransfers, setClientTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getClient(clientId),
      api.getTransfers({ client_id: clientId })
    ])
      .then(([p, txs]) => {
        if (isMounted) {
          setProfile(p);
          setClientTransfers(txs);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
        Retrieving backend-calculated portfolio analytics for client {clientId}...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
        Failed to load client profile: {error || 'Client not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header Card */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-2xl text-cyan-300">
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {profile.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">{profile.headline}</p>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-xs text-slate-400">Total Calculated Liquidity & Vaults:</span>
            <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              ${profile.total_calculated_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              Simulated Reference Wealth: <span className="text-slate-200 font-semibold">{profile.simulated_net_worth_display}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Financial Health Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <GlassCard>
          <div className="text-slate-400 mb-1">Available Unencumbered Balance</div>
          <div className="text-xl font-bold text-white">
            ${profile.total_available_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-sans">Ready for internal/bridge settlement</div>
        </GlassCard>

        <GlassCard>
          <div className="text-slate-400 mb-1">In-Flight Reserved Funds (Holds)</div>
          <div className="text-xl font-bold text-amber-400">
            ${profile.total_reserved_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">Awaiting RIFT KEY / Bridge confirmation</div>
        </GlassCard>

        <GlassCard>
          <div className="text-slate-400 mb-1">Interchain Vault Allocation</div>
          <div className="text-xl font-bold text-cyan-400">{profile.accounts.length} Accounts</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">Treasury, Liquidity & Escrow</div>
        </GlassCard>
      </div>

      {/* Asset Allocation Breakdown */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Calculated Asset Allocation (Backend Computed)</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Mark-to-Market Equivalence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.asset_allocation.map((item) => (
            <div key={item.asset} className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-mono font-bold text-white">{item.asset}</span>
                <span className="text-cyan-400 font-mono">{item.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                ${item.value_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Accounts & Vaults Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Accounts & Interchain Vaults</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Persistent Double-Entry Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Network / Chain</th>
                <th className="px-4 py-3">Total Balance</th>
                <th className="px-4 py-3">Hold / Reserved</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3 text-right">Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {profile.accounts.map((acc) => {
                const isFiat = acc.asset === 'TEST_USD' || acc.asset === 'TEST_EUR';
                const div = isFiat ? 100 : (acc.asset === 'TEST_ETH' ? 1_000_000 : 100_000_000);
                const total = (acc.balance_base_units / div).toLocaleString();
                const reserved = (acc.reserved_base_units / div).toLocaleString();
                const avail = (acc.available_balance_base_units / div).toLocaleString();

                return (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3.5 text-cyan-300 font-semibold">{acc.account_number}</td>
                    <td className="px-4 py-3.5 text-slate-200 font-sans font-medium">{acc.account_name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/5">
                        {acc.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-sans">
                      {acc.chain_id ? (
                        <span className="flex items-center space-x-1 text-purple-300">
                          <Coins className="w-3 h-3" />
                          <span>Chain {acc.chain_id}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Internal Ledger</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-white font-bold">{total} {acc.asset}</td>
                    <td className="px-4 py-3.5 text-amber-400">
                      {acc.reserved_base_units > 0 ? `${reserved} ${acc.asset}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-emerald-400 font-semibold">{avail} {acc.asset}</td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <button
                        onClick={() => {
                          onInitTransfer(profile.id, acc.id);
                          onSelectScreen('transfer_create');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition flex items-center space-x-1 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Client's Operation Stream */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Client's Financial Operations History</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{clientTransfers.length} Recorded Transits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Operation ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Interchain Path</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {clientTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500 font-sans">
                    No transfers logged for this client yet.
                  </td>
                </tr>
              ) : (
                clientTransfers.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-300">{tx.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/5">
                        {tx.transfer_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-bold">${tx.amount_display} {tx.asset}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {tx.source_chain_id && tx.destination_chain_id
                        ? `Chain ${tx.source_chain_id} → Chain ${tx.destination_chain_id}`
                        : 'Internal Account'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</td>
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
