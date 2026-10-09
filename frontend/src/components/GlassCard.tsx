import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-sm dark:shadow-2xl transition-all duration-200 ${
        glow ? 'shadow-cyan-500/10 border-cyan-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
