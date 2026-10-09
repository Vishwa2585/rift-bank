import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Play,
  Pause,
  Square,
  RotateCcw,
  Activity,
  Layers,
  Search,
  KeyRound,
  FileText,
  AlertTriangle,
  ArrowRight,
  Radio,
  Share2,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { riftEngine, EngineState, BridgeEvent, Incident } from '../services/riftEngine';
import { nfcService } from '../services/nfcService';
import { IncidentDetailModal } from '../components/IncidentDetailModal';

export const CommandRoom: React.FC = () => {
  const [engineState, setEngineState] = useState<EngineState>(riftEngine.getState());
  const [selectedEvent, setSelectedEvent] = useState<BridgeEvent | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcResult, setNfcResult] = useState<any | null>(null);

  // Poll state updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEngineState(riftEngine.getState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshState = () => {
    setEngineState(riftEngine.getState());
  };

  const handleSimulateExploit = () => {
    const inc = riftEngine.runSimulatedExploitScenario();
    setSelectedIncident(inc);
    refreshState();
  };

  const handleStartScanning = () => {
    riftEngine.setScanningStatus('SCANNING');
    refreshState();
  };

  const handlePauseScanning = () => {
    riftEngine.setScanningStatus('PAUSED');
    refreshState();
  };

  const handleStopScanning = () => {
    riftEngine.setScanningStatus('STOPPED');
    refreshState();
  };

  const handleResetDemo = () => {
    riftEngine.resetDemoState();
    setSelectedEvent(null);
    setSelectedIncident(null);
    setNfcResult(null);
    refreshState();
  };

  const [nfcWriting, setNfcWriting] = useState(false);

  // Real Web NFC API scan handler
  const handlePhysicalNFCScan = async () => {
    setNfcScanning(true);
    setNfcResult(null);

    const result = await nfcService.readPhysicalNFCTag();
    setNfcResult(result);
    setNfcScanning(false);

    if (result.success) {
      riftEngine.addAuditAction(
        'PHYSICAL_NFC_READ',
        `Read physical NFC tag payload: '${result.payload}'. Serial: ${result.serialNumber || 'N/A'}`
      );
    }
  };

  // Real Web NFC API write handler (NDEFReader.write)
  const handlePhysicalNFCWrite = async () => {
    setNfcWriting(true);
    setNfcResult(null);

    const result = await nfcService.writePhysicalNFCTag('RIFT-KEY:DEMO-01');
    setNfcResult(result);
    setNfcWriting(false);

    if (result.success) {
      riftEngine.addAuditAction(
        'PHYSICAL_NFC_WRITE',
        `Wrote NDEF payload 'RIFT-KEY:DEMO-01' to physical NFC card.`
      );
    }
  };

  // Hardware MFA simulation fallback
  const handleFallbackNFCTap = () => {
    const result = nfcService.triggerSimulatedKeyTap();
    setNfcResult(result);
    riftEngine.addAuditAction(
      'HARDWARE_MFA_FALLBACK',
      `Triggered enrolled hardware key simulation: '${result.payload}'`
    );
    refreshState();
  };

  const activeIncidents = engineState.incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'FALSE_POSITIVE'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 animate-pulse">
              FUSION 2026 · CSB-01 COMMAND ROOM
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Real-Time Cross-Chain Detection Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            RIFT Autonomous Security Operations Room
          </h1>
        </div>

        {/* 1-Click Exploit Demonstration Trigger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateExploit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition flex items-center space-x-2 animate-bounce"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>SIMULATE BRIDGE EXPLOIT</span>
          </button>
          <button
            onClick={handleResetDemo}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Reset Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active High-Severity Incident Alert Banner */}
      {activeIncidents.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-rose-600 dark:text-rose-400 font-sans">
                  ACTIVE EXPLOIT INCIDENT DETECTED ({activeIncidents[0].id})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white">
                  RISK: {(activeIncidents[0].risk_score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans mt-0.5">
                {activeIncidents[0].title} — {activeIncidents[0].explanation}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedIncident(activeIncidents[0])}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>INVESTIGATE INCIDENT</span>
          </button>
        </div>
      )}

      {/* SECTION 1: SYSTEM STATUS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1 flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Scanning</span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white">
            {engineState.scanningStatus}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Event Source</div>
          <div className="font-bold text-cyan-600 dark:text-cyan-300 truncate">
            CONTROLLED STREAM
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Events Processed</div>
          <div className="font-bold text-slate-900 dark:text-white text-base">
            {engineState.eventsProcessedCount}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Active Incidents</div>
          <div className={`font-bold text-base ${engineState.activeIncidentsCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
            {engineState.activeIncidentsCount}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Alerts Generated</div>
          <div className="font-bold text-amber-600 dark:text-amber-400 text-base">
            {engineState.alertsGeneratedCount}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Correlation</div>
          <div className={`font-bold ${engineState.correlationStatus === 'ANOMALY_DETECTED' ? 'text-rose-500' : 'text-emerald-500'}`}>
            {engineState.correlationStatus}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">NFC Status</div>
          <div className="font-bold text-cyan-600 dark:text-cyan-400">
            {engineState.nfcAvailable ? 'READY (Web NFC)' : 'SIMULATED'}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-slate-400 mb-1">Circuit Breaker</div>
          <div className={`font-bold ${engineState.transfersHeld ? 'text-amber-500' : 'text-slate-400'}`}>
            {engineState.transfersHeld ? 'HELD (Active)' : 'NORMAL'}
          </div>
        </GlassCard>
      </div>

      {/* SECTION 2: CROSS-CHAIN FRACTURE MAP & NFC PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fracture Map Node Graph */}
        <div className="lg:col-span-2">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-cyan-500" />
                  <span>Cross-Chain Fracture Map & Relationship Topology</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Interactive node mapping of L1 Chain 31337 (Source) and L2 Chain 31338 (Destination) event pairs.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400">Matched</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-400">Pending</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-400">Exploit/Mismatch</span>
                </span>
              </div>
            </div>

            {/* Interactive SVG Node Diagram */}
            <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-white/5 p-4 flex flex-col justify-between overflow-hidden">
              {/* Chain Columns Header */}
              <div className="flex justify-between text-xs font-mono font-bold text-slate-400 border-b border-slate-200 dark:border-white/5 pb-2 z-10">
                <div className="text-purple-600 dark:text-purple-400">SOURCE CHAIN (31337 L1)</div>
                <div className="text-cyan-600 dark:text-cyan-400">DESTINATION CHAIN (31338 L2)</div>
              </div>

              {/* Dynamic Connected Node Rows */}
              <div className="relative flex-1 my-3 flex flex-col justify-around z-10 space-y-2 overflow-y-auto">
                {engineState.events.slice(0, 4).map((evt, idx) => {
                  const isSource = evt.source_chain_id === 31337 && evt.event_type === 'DEPOSIT';
                  const isExploit = evt.status === 'EXPLOIT' || evt.status === 'MISMATCH';

                  return (
                    <div key={evt.id} className="flex items-center justify-between px-4">
                      {/* Source Node */}
                      <div
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center space-x-2 text-xs font-mono max-w-[240px] ${
                          isExploit
                            ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-pulse'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-cyan-500'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${isExploit ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                        <div>
                          <div className="font-bold">{evt.id}</div>
                          <div className="text-[10px] opacity-80">${evt.amount_display} {evt.asset}</div>
                        </div>
                      </div>

                      {/* Edge Connection Line */}
                      <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 opacity-60 relative flex items-center justify-center">
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {evt.bridge_message_id}
                        </span>
                      </div>

                      {/* Destination Node */}
                      <div
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center space-x-2 text-xs font-mono max-w-[240px] ${
                          isExploit
                            ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-pulse'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-cyan-500'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${isExploit ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                        <div>
                          <div className="font-bold">{evt.transaction_hash}</div>
                          <div className="text-[10px] opacity-80">{evt.event_type} ({evt.status})</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] font-mono text-slate-400 text-center z-10 pt-1 border-t border-slate-200 dark:border-white/5">
                Click any event node above to view structured payload evidence.
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Col: REAL PHYSICAL NFC + RIFT KEY PANEL */}
        <div className="lg:col-span-1">
          <GlassCard className="p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500">
                  <KeyRound className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">RIFT KEY™ Physical NFC Panel</h3>
                  <p className="text-[11px] text-slate-400">Web NFC (NDEFReader) Hardware MFA</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">NFC API:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {engineState.nfcAvailable ? 'SUPPORTED' : 'UNSUPPORTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enrolled Tag ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">RIFT-KEY:DEMO-01</span>
                </div>
              </div>
            </div>

            {/* NFC Result Display */}
            {nfcResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                nfcResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{nfcResult.success ? 'NFC READ SUCCESS' : 'NFC SCAN NOTICE'}</span>
                </div>
                <div>Payload: <span className="font-bold text-slate-900 dark:text-white">{nfcResult.payload || 'None'}</span></div>
                <div className="text-[10px] opacity-80">{nfcResult.message}</div>
              </div>
            )}

            {/* NFC Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePhysicalNFCScan}
                disabled={nfcScanning || nfcWriting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Cpu className="w-4 h-4" />
                <span>{nfcScanning ? 'Reading Physical NFC Tag...' : 'READ PHYSICAL NFC TAG'}</span>
              </button>

              <button
                onClick={handlePhysicalNFCWrite}
                disabled={nfcScanning || nfcWriting}
                className="w-full py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{nfcWriting ? 'Hold NFC Tag to Phone to Write...' : 'WRITE RIFT KEY TO NFC CARD'}</span>
              </button>

              <button
                onClick={handleFallbackNFCTap}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
              >
                Simulate Hardware Key Tap (Desktop)
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* SECTION 3: LIVE EVENT DEMONSTRATION STREAM */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span>Live Demonstration Event Ingestion Stream</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Continuously evaluated events labeled with explicit data provenance.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={handleStartScanning}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1 font-semibold ${
                engineState.scanningStatus === 'SCANNING'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>START SCANNING</span>
            </button>

            <button
              onClick={handlePauseScanning}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1 font-semibold ${
                engineState.scanningStatus === 'PAUSED'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={handleStopScanning}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1 font-semibold ${
                engineState.scanningStatus === 'STOPPED'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>STOP</span>
            </button>
          </div>
        </div>

        {/* Stream Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2.5">Event ID</th>
                <th className="px-4 py-2.5">Provenience Tag</th>
                <th className="px-4 py-2.5">Source / Dest Route</th>
                <th className="px-4 py-2.5">Event Type</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Beneficiary / Recipient</th>
                <th className="px-4 py-2.5">Engine Status</th>
                <th className="px-4 py-2.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {engineState.events.map((evt) => {
                const isExploit = evt.status === 'EXPLOIT' || evt.status === 'MISMATCH';
                return (
                  <tr
                    key={evt.id}
                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition ${
                      isExploit ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 text-cyan-600 dark:text-cyan-400 font-bold">{evt.id}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {evt.provenance}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                      Chain {evt.source_chain_id} → Chain {evt.destination_chain_id}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{evt.event_type}</td>
                    <td className={`px-4 py-2.5 font-bold ${isExploit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      ${evt.amount_display} {evt.asset}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                      {evt.beneficiary}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExploit
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        SIMULATED: {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Selected Event Inspection Drawer */}
      {selectedEvent && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="font-bold text-sm text-cyan-600 dark:text-cyan-300">
              Payload Inspector: {selectedEvent.id}
            </span>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
            <div>Bridge Message ID: <span className="text-slate-900 dark:text-white">{selectedEvent.bridge_message_id}</span></div>
            <div>Transaction Hash: <span className="text-slate-900 dark:text-white">{selectedEvent.transaction_hash}</span></div>
            <div>Block Number: <span className="text-slate-900 dark:text-white">#{selectedEvent.block_number}</span></div>
            <div>Finality Reached: <span className="text-slate-900 dark:text-white">{selectedEvent.finality_reached ? 'YES' : 'NO'}</span></div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={refreshState}
        />
      )}
    </div>
  );
};
