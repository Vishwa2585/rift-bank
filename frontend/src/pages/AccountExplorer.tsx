import React, { useEffect, useState } from 'react';
import { Wallet, Search, Filter, ArrowUpRight, Coins, FileText, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Account, LedgerEntry } from '../types';
import { api } from '../services/api';

export const AccountExplorer: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterAsset, setFilterAsset] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statement modal
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [statement, setStatement] = useState<LedgerEntry[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);

  useEffect(() => {
    api.getAccounts()
      .then(setAccounts)
      .finally(() => setLoading(false));
  }, []);

  const openStatement = async (acc: Account) => {
    setSelectedAccount(acc);
    setStatementLoading(true);
    try {
      const data = await api.getAccountStatement(acc.id);
      setStatement(data);
    } catch {
      setStatement([]);
    } finally {
      setStatementLoading(false);
    }
  };

  const filtered = accounts.filter((acc) => {
    if (filterType !== 'ALL' && acc.account_type !== filterType) return false;
    if (filterAsset !== 'ALL' && acc.asset !== filterAsset) return false;
    if (searchTerm && !acc.account_name.toLowerCase().includes(searchTerm.toLowerCase()) && !acc.account_number.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bank Account & Vault Explorer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authoritative accounts linked to double-entry ledger records and interchain vaults.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">Total Vaults:</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by account name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Types</option>
                <option value="TREASURY">Treasury</option>
                <option value="LIQUIDITY">Liquidity</option>
                <option value="ESCROW">Escrow</option>
                <option value="CUSTODY">Custody</option>
                <option value="SETTLEMENT">Settlement</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">Asset:</span>
              <select
                value={filterAsset}
                onChange={(e) => setFilterAsset(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Assets</option>
                <option value="TEST_USD">TEST_USD</option>
                <option value="TEST_EUR">TEST_EUR</option>
                <option value="TEST_ETH">TEST_ETH</option>
                <option value="TEST_BTC">TEST_BTC</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Accounts Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Account #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Chain Binding</th>
                <th className="px-4 py-3">Total Balance</th>
                <th className="px-4 py-3">In-Flight Hold</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
              {filtered.map((acc) => {
                const isFiat = acc.asset === 'TEST_USD' || acc.asset === 'TEST_EUR';
                const div = isFiat ? 100 : (acc.asset === 'TEST_ETH' ? 1_000_000 : 100_000_000);
                const total = (acc.balance_base_units / div).toLocaleString();
                const reserved = (acc.reserved_base_units / div).toLocaleString();
                const avail = (acc.available_balance_base_units / div).toLocaleString();

                return (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-600 dark:text-cyan-300 font-semibold">{acc.account_number}</td>
                    <td className="px-4 py-3 font-sans text-slate-800 dark:text-slate-200">{acc.account_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                        {acc.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500 dark:text-slate-400">
                      {acc.chain_id ? (
                        <span className="flex items-center space-x-1 text-purple-600 dark:text-purple-300">
                          <Coins className="w-3 h-3" />
                          <span>Chain {acc.chain_id}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Internal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">{total} {acc.asset}</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400">
                      {acc.reserved_base_units > 0 ? `${reserved} ${acc.asset}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{avail} {acc.asset}</td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => openStatement(acc)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 transition text-xs flex items-center space-x-1 ml-auto"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Journal</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Account Statement Journal Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-cyan-500/30 p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Account Statement: {selectedAccount.account_number}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">{selectedAccount.account_name}</p>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 flex-1">
              {statementLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono animate-pulse">
                  Loading ledger journal entries...
                </div>
              ) : statement.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-sans">
                  No double-entry movements recorded for this account.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Entry ID</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Direction</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {statement.map((e) => {
                      const isDebit = e.direction === 'DEBIT';
                      return (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{e.id}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{e.entry_type}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isDebit ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {e.direction}
                            </span>
                          </td>
                          <td className={`px-3 py-2 font-bold ${isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isDebit ? '-' : '+'}{(e.amount_base_units / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {e.asset}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-sans">{e.description}</td>
                          <td className="px-3 py-2 text-slate-400 dark:text-slate-500">
                            {new Date(e.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs text-slate-800 dark:text-white font-medium"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
