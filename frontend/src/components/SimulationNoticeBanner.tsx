import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SimulationNoticeBanner: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-wider text-slate-300 flex flex-wrap items-center justify-between gap-1.5 backdrop-blur-md">
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
        <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
        <span className="font-bold text-amber-400 tracking-widest uppercase">RIFT BANK</span>
        <span className="text-slate-500">|</span>
        <span className="font-medium text-slate-200">SIMULATION ENVIRONMENT</span>
        <span className="text-slate-500 hidden md:inline">·</span>
        <span className="text-slate-400 text-[10px] sm:text-xs hidden md:inline">
          FICTIONAL CLIENTS · TEST ASSETS · NO REAL BANK CONNECTION
        </span>
      </div>
      <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center space-x-2 ml-auto sm:ml-0">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="whitespace-nowrap">CSB-01 PROTOCOL</span>
      </div>
    </div>
  );
};
