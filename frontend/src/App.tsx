import React, { useState, useEffect } from 'react';
import { SimulationNoticeBanner } from './components/SimulationNoticeBanner';
import { Navbar, ScreenId } from './components/Navbar';
import { BankOverview } from './pages/BankOverview';
import { ClientDirectory } from './pages/ClientDirectory';
import { ClientProfile } from './pages/ClientProfile';
import { AccountExplorer } from './pages/AccountExplorer';
import { AccountLedger } from './pages/AccountLedger';
import { TransferCreate } from './pages/TransferCreate';
import { TransferDetails } from './pages/TransferDetails';
import { CrossChainOps } from './pages/CrossChainOps';
import { AuthorizationStatus } from './pages/AuthorizationStatus';
import { BlockchainEvidence } from './pages/BlockchainEvidence';
import { ReconciliationView } from './pages/ReconciliationView';
import { ActivityAudit } from './pages/ActivityAudit';
import { SystemIntegrationStatus } from './pages/SystemIntegrationStatus';
import { DemoControls } from './pages/DemoControls';

import { Client, Transfer, RiftHealth } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('cli_alexander_veyron');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [riftHealth, setRiftHealth] = useState<RiftHealth | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Transfer creation prep
  const [initialTransferClientId, setInitialTransferClientId] = useState<string>('');
  const [initialTransferAccountId, setInitialTransferAccountId] = useState<string>('');
  const [inspectTransferId, setInspectTransferId] = useState<string>('');

  const loadInitialData = () => {
    api.getClients()
      .then((cls) => {
        setClients(cls);
        if (cls.length > 0 && !selectedClientId) {
          setSelectedClientId(cls[0].id);
        }
      })
      .catch((err) => console.error('Failed to load clients:', err));

    api.getTransfers()
      .then(setTransfers)
      .catch((err) => console.error('Failed to load transfers:', err));

    api.getRiftStatus()
      .then(setRiftHealth)
      .catch((err) => {
        setRiftHealth({ connected: false, error: 'RIFT CONNECTION UNAVAILABLE' });
      });
  };

  useEffect(() => {
    loadInitialData();

    // Periodic telemetry polling
    const interval = setInterval(() => {
      api.getRiftStatus()
        .then(setRiftHealth)
        .catch(() => setRiftHealth({ connected: false, error: 'RIFT CONNECTION UNAVAILABLE' }));

      api.getTransfers()
        .then(setTransfers)
        .catch(() => {});
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Apply dark class to <html> so Tailwind dark: variants work everywhere
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleInitTransfer = (cId: string, accId: string) => {
    setInitialTransferClientId(cId);
    setInitialTransferAccountId(accId);
    setCurrentScreen('transfer_create');
  };

  const handleTransferCreated = (tx: Transfer) => {
    setInspectTransferId(tx.id);
    setTransfers((prev) => [tx, ...prev]);
    setCurrentScreen('transfer_details');
  };

  const handleDemoScenario = async () => {
    try {
      const tx = await api.runAlexanderVeyronScenario();
      setInspectTransferId(tx.id);
      setTransfers((prev) => [tx, ...prev]);
      setCurrentScreen('transfer_details');
    } catch (err) {
      console.error(err);
      setCurrentScreen('demo_controls');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      {/* Permanent Tasteful Notice Banner */}
      <SimulationNoticeBanner />

      {/* Main Top Header & Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        riftHealth={riftHealth}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Body - Full Screen Expansive Layout */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
        {currentScreen === 'overview' && (
          <BankOverview
            clients={clients}
            transfers={transfers}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setCurrentScreen('profile');
            }}
            onSelectScreen={setCurrentScreen}
            onLaunchDemoScenario={handleDemoScenario}
          />
        )}

        {currentScreen === 'clients' && (
          <ClientDirectory
            clients={clients}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setCurrentScreen('profile');
            }}
            onSelectScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'profile' && (
          <ClientProfile
            clientId={selectedClientId}
            onSelectScreen={setCurrentScreen}
            onInitTransfer={handleInitTransfer}
          />
        )}

        {currentScreen === 'accounts' && <AccountExplorer />}

        {currentScreen === 'ledger' && <AccountLedger />}

        {currentScreen === 'transfer_create' && (
          <TransferCreate
            clients={clients}
            initialClientId={initialTransferClientId || selectedClientId}
            initialAccountId={initialTransferAccountId}
            onTransferCreated={handleTransferCreated}
            onSelectScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'transfer_details' && (
          <TransferDetails
            initialTransferId={inspectTransferId}
            onSelectScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'cross_chain' && <CrossChainOps />}

        {currentScreen === 'authorizations' && <AuthorizationStatus />}

        {currentScreen === 'blockchain_evidence' && <BlockchainEvidence />}

        {currentScreen === 'reconciliation' && <ReconciliationView />}

        {currentScreen === 'audit' && <ActivityAudit />}

        {currentScreen === 'system_status' && <SystemIntegrationStatus />}

        {currentScreen === 'demo_controls' && (
          <DemoControls
            onScenarioLaunched={(tx) => {
              setInspectTransferId(tx.id);
              setTransfers((prev) => [tx, ...prev]);
            }}
            onDatabaseReset={loadInitialData}
            onSelectScreen={setCurrentScreen}
          />
        )}
      </main>

      {/* Footer - Full Screen Width */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#07090e]/90 backdrop-blur-md py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
        <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            RIFT BANK · CSB-01 FINANCIAL SIMULATOR · DOUBLE-ENTRY LEDGER ENGINE
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>CHAIN 31337 ↔ 31338</span>
            <span>·</span>
            <span>RIFT KEY™ PROTOCOL</span>
            <span>·</span>
            <span>ZERO FLOATING-POINT DRIFT</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
