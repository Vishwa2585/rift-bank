import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Wallet,
  BookOpen,
  Send,
  Link2,
  KeyRound,
  ShieldAlert,
  Scale,
  History,
  Activity,
  PlaySquare,
  Moon,
  Sun,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  Menu,
  X
} from 'lucide-react';
import { RiftHealth, Client } from '../types';

export type ScreenId =
  | 'command_room'
  | 'replay_lab'
  | 'overview'
  | 'clients'
  | 'profile'
  | 'accounts'
  | 'ledger'
  | 'transfer_create'
  | 'transfer_details'
  | 'cross_chain'
  | 'authorizations'
  | 'blockchain_evidence'
  | 'reconciliation'
  | 'audit'
  | 'system_status'
  | 'demo_controls';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  riftHealth: RiftHealth | null;
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  riftHealth,
  clients,
  selectedClientId,
  onSelectClient,
  isDarkMode,
  onToggleTheme
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const navItems = [
    { id: 'command_room', label: 'Command Room', icon: ShieldAlert, desc: 'CSB-01 Exploit Engine & Fracture Map' },
    { id: 'replay_lab', label: 'Replay Lab', icon: PlaySquare, desc: 'Counterfactual replay & rule toggles' },
    { id: 'overview', label: 'Overview', icon: Building2, desc: 'Executive banking dashboard' },
    { id: 'clients', label: 'Clients', icon: Users, desc: '6 High-net-worth fictional clients' },
    { id: 'profile', label: 'Profile', icon: Eye, desc: 'Client portfolio & asset allocations' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, desc: 'Bank accounts & vault directory' },
    { id: 'ledger', label: 'Ledger', icon: BookOpen, desc: 'Authoritative double-entry journal' },
    { id: 'transfer_create', label: 'Transfer', icon: Send, desc: '10-step validated transfer form' },
    { id: 'transfer_details', label: 'Transfers', icon: FileText, desc: 'Operations tracker & receipts' },
    { id: 'cross_chain', label: 'Cross-Chain', icon: Link2, desc: 'Chain 31337 ↔ 31338 bridge operations' },
    { id: 'authorizations', label: 'RIFT KEY', icon: KeyRound, desc: 'Hardware MFA biometric approvals' },
    { id: 'blockchain_evidence', label: 'Evidence', icon: ShieldAlert, desc: 'Verified local EVM receipts' },
    { id: 'reconciliation', label: 'Reconciliation', icon: Scale, desc: 'Ledger vs chain audit ($0 diff)' },
    { id: 'audit', label: 'Audit', icon: History, desc: 'Immutable security event stream' },
    { id: 'system_status', label: 'System', icon: Activity, desc: 'RIFT integration & telemetry' },
    { id: 'demo_controls', label: 'Demo Lab', icon: PlaySquare, desc: 'Alexander Veyron $250M presentation' }
  ];

  const isRiftConnected = riftHealth?.connected ?? false;

  const handleNavClick = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#07090e]/90 backdrop-blur-xl">
      {/* Top Bar */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onSelectScreen('overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#07090e] rounded-[10px] flex items-center justify-center font-black tracking-tighter text-cyan-500 dark:text-cyan-400 text-lg">
              RF
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-sm sm:text-base text-slate-900 dark:text-white">RIFT BANK</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hidden xs:inline">
                PRIVATE
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight font-medium hidden sm:block">
              Interchain Wealth & Financial Operations
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Active Client selector (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Client:</span>
            <select
              value={selectedClientId}
              onChange={(e) => {
                onSelectClient(e.target.value);
                onSelectScreen('profile');
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c.name} ({c.simulated_net_worth_display})
                </option>
              ))}
            </select>
          </div>

          {/* RIFT Connectivity Pill */}
          <button
            onClick={() => onSelectScreen('system_status')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer flex-shrink-0 ${
              isRiftConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/20 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRiftConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`}
            ></span>
            <span className="hidden sm:inline">{isRiftConnected ? 'RIFT ONLINE' : 'RIFT CONNECTION UNAVAILABLE'}</span>
            <span className="sm:hidden">{isRiftConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-500" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition lg:hidden"
            title="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/90 dark:bg-slate-950/70 overflow-x-auto scrollbar-none py-1.5 px-3 sm:px-6 lg:px-8 xl:px-12 flex space-x-1.5 touch-pan-x">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as ScreenId)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[110px] bottom-0 z-50 bg-white/98 dark:bg-[#07090e]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 p-4 overflow-y-auto">
          {/* Mobile Client Switcher */}
          <div className="p-3 mb-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs">
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Active Client Profile</label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                onSelectClient(e.target.value);
                handleNavClick('profile');
              }}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.simulated_net_worth_display})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Navigation Console (14 Screens)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as ScreenId)}
                  className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
