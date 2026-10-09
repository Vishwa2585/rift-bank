import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`rounded-xl border border-white/10 dark:border-white/10 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xl p-5 shadow-2xl transition-all duration-200 ${
        glow ? 'shadow-cyan-500/10 border-cyan-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
