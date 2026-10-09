import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, RefreshCw, Clock, Terminal } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AuditLog } from '../types';
import { api } from '../services/api';

export const ActivityAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Activity & Security Audit History</h2>
          <p className="text-xs text-slate-400">
            Immutable application-level audit journal logging all financial holds, authorizations, and settlements.
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

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Audit Event Stream (Last 100 Entries)</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{logs.length} Recorded Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Operation / Transfer ID</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-cyan-300">{l.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/5 font-semibold">
                        {l.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{l.transfer_id || '—'}</td>
                    <td className="px-4 py-3 font-sans text-slate-200">{l.description}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
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
