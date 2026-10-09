import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  FileText,
  Download,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Incident, riftEngine } from '../services/riftEngine';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onUpdate: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVIDENCE' | 'TIMELINE' | 'ACTIONS'>('OVERVIEW');
  const [newNote, setNewNote] = useState('');
  const [engineState, setEngineState] = useState(riftEngine.getState());

  const handleStatusChange = (newStatus: Incident['status']) => {
    riftEngine.updateIncidentStatus(incident.id, newStatus);
    setEngineState(riftEngine.getState());
    onUpdate();
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    riftEngine.addIncidentNote(incident.id, newNote);
    setNewNote('');
    setEngineState(riftEngine.getState());
    onUpdate();
  };

  const handleToggleHold = () => {
    riftEngine.toggleHoldTransfers(!engineState.transfersHeld);
    setEngineState(riftEngine.getState());
    onUpdate();
  };

  const handleExportJson = () => {
    riftEngine.exportIncidentEvidence(incident);
  };

  const triggeredRules = incident.rule_results.filter((r) => r.triggered);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#07090e] border border-slate-200 dark:border-cyan-500/40 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {incident.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                {incident.provenance}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {incident.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>{incident.title}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 dark:border-white/10 my-4 text-xs font-mono space-x-4">
          {[
            { id: 'OVERVIEW', label: 'Incident Overview' },
            { id: 'EVIDENCE', label: `Evidence & Rules (${triggeredRules.length})` },
            { id: 'TIMELINE', label: 'Timeline & Provenance' },
            { id: 'ACTIONS', label: 'Response Actions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Summary Tile */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-slate-400">Risk Score</div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {(incident.risk_score * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Investigation Status</div>
                  <div className="font-bold text-amber-600 dark:text-amber-300 mt-1">
                    {incident.status}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Source Asset / Amount</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-1">
                    ${incident.source_event.amount_display} {incident.source_event.asset}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Destination Anomaly</div>
                  <div className="font-bold text-cyan-600 dark:text-cyan-300 mt-1">
                    ${incident.destination_event?.amount_display || 'N/A'} {incident.destination_event?.asset || ''}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
                <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Detection Engine Analysis</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {incident.explanation}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleStatusChange('ACKNOWLEDGED')}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Acknowledge Alert
                </button>
                <button
                  onClick={() => handleStatusChange('INVESTIGATING')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 font-medium border border-amber-500/30"
                >
                  Mark as Investigating
                </button>
                <button
                  onClick={() => handleStatusChange('CONFIRMED_EXPLOIT')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-400"
                >
                  Confirm Exploit
                </button>
                <button
                  onClick={() => handleStatusChange('FALSE_POSITIVE')}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20"
                >
                  Mark as False Positive
                </button>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div className="space-y-4 text-xs font-mono">
              {/* Event Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="font-bold text-sm text-cyan-600 dark:text-cyan-300 font-sans flex items-center justify-between">
                    <span>Source Deposit Event (L1 Chain 31337)</span>
                    <span className="text-[10px] text-slate-400">ORIGINAL INTENT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event ID:</span>
                    <span className="text-slate-800 dark:text-slate-200">{incident.source_event.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deposit Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">${incident.source_event.amount_display} {incident.source_event.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authorized Beneficiary:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{incident.source_event.beneficiary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Message ID:</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{incident.source_event.bridge_message_id}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="font-bold text-sm text-rose-600 dark:text-rose-400 font-sans flex items-center justify-between">
                    <span>Destination Withdrawal Event (L2 Chain 31338)</span>
                    <span className="text-[10px] text-rose-400">OBSERVED ANOMALY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event ID:</span>
                    <span className="text-slate-800 dark:text-slate-200">{incident.destination_event?.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Withdrawal Amount:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">${incident.destination_event?.amount_display || 'N/A'} {incident.destination_event?.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient Address:</span>
                    <span className="text-rose-500 font-semibold truncate max-w-[200px]">{incident.destination_event?.beneficiary || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Message ID:</span>
                    <span className="text-rose-400">{incident.destination_event?.bridge_message_id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Triggered Rule Results Table */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
                <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Deterministic Rule Evaluations (CSB-01 Engine Output)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Rule ID</th>
                        <th className="px-3 py-2">Rule Name</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Risk Contribution</th>
                        <th className="px-3 py-2">Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {incident.rule_results.map((r) => (
                        <tr key={r.rule_id} className="hover:bg-slate-100 dark:hover:bg-white/5">
                          <td className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold">{r.rule_id}</td>
                          <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-sans font-semibold">{r.rule_name}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.triggered
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {r.triggered ? 'TRIGGERED' : 'CLEARED'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-900 dark:text-white font-bold">
                            +{ (r.risk_contribution * 100).toFixed(0) }%
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-sans max-w-xs">{r.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-3 font-mono text-xs">
              {incident.timeline.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex items-start space-x-3"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white font-sans">{entry.label}</span>
                      <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-sans mt-0.5">{entry.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ACTIONS' && (
            <div className="space-y-4 text-xs font-mono">
              {/* Emergency Control Toggle */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-amber-700 dark:text-amber-300 font-sans flex items-center space-x-1.5">
                    <PauseCircle className="w-5 h-5 text-amber-500" />
                    <span>Demonstration Circuit Breaker (LOCAL DEMO ACTION)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] font-sans mt-0.5">
                    Toggling this setting will force all subsequent simulated bank transfer requests to be held by RIFT policy.
                  </p>
                </div>
                <button
                  onClick={handleToggleHold}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 ${
                    engineState.transfersHeld
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {engineState.transfersHeld ? (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Demo Transfers</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>Hold New Demo Transfers</span>
                    </>
                  )}
                </button>
              </div>

              {/* Evidence Export Button */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white font-sans text-sm">Download Official Incident Package</div>
                  <div className="text-slate-400 text-[11px] font-sans">Includes raw events, rule matrices, timeline, and auditor notes.</div>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Evidence</span>
                </button>
              </div>

              {/* Investigator Notes List & Add Note */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-3">
                <h4 className="font-sans font-bold text-slate-900 dark:text-white text-sm">Investigator Notes & Audit Log</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {incident.investigator_notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-200 font-sans">{note.note}</div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add investigator audit note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
