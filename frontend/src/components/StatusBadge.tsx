import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = (s: string) => {
    switch (s.toUpperCase()) {
      case 'COMPLETED':
      case 'BALANCED':
      case 'CONFIRMED':
      case 'ONLINE':
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'AWAITING_AUTHORIZATION':
      case 'RISK_ASSESSMENT_PENDING':
      case 'PENDING_SETTLEMENT':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse';
      case 'AUTHORIZED':
      case 'SOURCE_TRANSACTION_CONFIRMED':
      case 'SUBMITTED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'FAILED':
      case 'REJECTED':
      case 'DISCREPANCY':
      case 'UNBALANCED_WARNING':
      case 'OFFLINE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'RECONCILIATION_REQUIRED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${getStyle(status)}`}>
      {status}
    </span>
  );
};
