import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { riftEngine, EngineState, evaluateDetectionRules, RuleResult, BridgeEvent } from '../services/riftEngine';

export const ReplayLab: React.FC = () => {
  const [engineState, setEngineState] = useState<EngineState>(riftEngine.getState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [ruleToggles, setRuleToggles] = useState<Record<string, boolean>>(engineState.ruleToggles);

  useEffect(() => {
    setRuleToggles(engineState.ruleToggles);
  }, [engineState.ruleToggles]);

  // Handle rule toggle change
  const handleToggleRule = (ruleId: string) => {
    const nextVal = !ruleToggles[ruleId];
    const updated = { ...ruleToggles, [ruleId]: nextVal };
    setRuleToggles(updated);
    riftEngine.setRuleToggle(ruleId, nextVal);
    setEngineState(riftEngine.getState());
  };

  // Replay playback simulation loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalMs = 2000 / speed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= sampleTimeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handleStartReplay = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handlePauseReplay = () => {
    setIsPlaying(false);
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Deterministic sample replay events
  const sampleSource: BridgeEvent = {
    id: 'REPLAY-SRC-001',
    source_chain_id: 31337,
    destination_chain_id: 31338,
    event_type: 'DEPOSIT',
    transaction_hash: 'SIM-TX-REPLAY-001',
    bridge_message_id: 'MSG-2026-REPLAY-99',
    sender: '0x Alexander Veyron Vault',
    beneficiary: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    asset: 'TEST_USD',
    amount_display: '250,000,000.00',
    amount_num: 250000000,
    timestamp: new Date().toISOString(),
    block_number: 1489300,
    finality_reached: false,
    provenance: 'HISTORICAL REPLAY',
    status: 'EXPLOIT'
  };

  const sampleDest: BridgeEvent = {
    id: 'REPLAY-DST-001',
    source_chain_id: 31337,
    destination_chain_id: 31338,
    event_type: 'WITHDRAWAL',
    transaction_hash: 'SIM-TX-REPLAY-001-EXPLOIT',
    bridge_message_id: 'MSG-2026-REPLAY-99-DUP',
    sender: '0x Bridge Pool',
    beneficiary: '0x9999999999999999999999999999999999999999',
    asset: 'TEST_USD',
    amount_display: '500,000,000.00',
    amount_num: 500000000,
    timestamp: new Date().toISOString(),
    block_number: 948400,
    finality_reached: true,
    provenance: 'HISTORICAL REPLAY',
    status: 'MISMATCH'
  };

  // Evaluate rules against current toggles
  const currentEvaluations: RuleResult[] = evaluateDetectionRules(
    sampleSource,
    sampleDest,
    ruleToggles
  );

  const triggeredCount = currentEvaluations.filter((r) => r.triggered).length;
  const calculatedRiskScore = Math.min(
    0.99,
    Number(
      (
        0.20 +
        currentEvaluations
          .filter((r) => r.triggered)
          .reduce((acc, r) => acc + r.risk_contribution, 0)
      ).toFixed(2)
    )
  );

  const sampleTimeline = [
    { label: 'Event Ingestion', desc: 'Sample deposit & withdrawal events loaded into replay buffer.' },
    { label: 'Message Nonce Check', desc: 'Bridge message identifier evaluated against historical cache.' },
    { label: 'Amount & Beneficiary Cross-Audit', desc: 'Checking $250M deposit vs $500M withdrawal.' },
    { label: 'Source Finality Verification', desc: 'Checking L1 finality confirmation on block #1489300.' },
    { label: 'Dynamic Risk Scoring', desc: `Rules evaluated. Calculated risk score: ${calculatedRiskScore}.` }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40">
              SIMULATED REPLAY LAB
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              CSB-01 Counterfactual Detection Testing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Exploit Replay & Rule Counterfactual Lab
          </h1>
        </div>

        {/* Replay Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={isPlaying ? handlePauseReplay : handleStartReplay}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold shadow-md transition flex items-center space-x-1.5"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE REPLAY' : 'START REPLAY'}</span>
          </button>

          <button
            onClick={handleResetReplay}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Reset Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Rules Toggles, Right Replay Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Detection Rule Matrix Toggles */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                <span>Active Detection Ruleset</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CSB-01 ENGINE</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Toggle detection rules below to observe how alert outputs and risk calculations change in real time.
            </p>

            {/* Rule Checkboxes */}
            <div className="space-y-2.5 font-mono text-xs">
              {[
                { id: 'RULE_01', name: 'Rule 1: Unmatched Event', desc: 'Detect missing source deposit' },
                { id: 'RULE_02', name: 'Rule 2: Amount Mismatch', desc: 'Compare deposit vs withdrawal $' },
                { id: 'RULE_03', name: 'Rule 3: Beneficiary Mismatch', desc: 'Detect unauthorized address' },
                { id: 'RULE_04', name: 'Rule 4: Duplicate Message ID', desc: 'Detect bridge message replay' },
                { id: 'RULE_05', name: 'Rule 5: Token Mapping Anomaly', desc: 'Detect unmapped mint asset' },
                { id: 'RULE_06', name: 'Rule 6: Source Finality Violation', desc: 'Detect premature L2 release' }
              ].map((rule) => {
                const isEnabled = ruleToggles[rule.id] !== false;
                return (
                  <div
                    key={rule.id}
                    onClick={() => handleToggleRule(rule.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                      isEnabled
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isEnabled ? (
                        <CheckSquare className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{rule.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">{rule.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right 2 Columns: Replay Screen & Real-time Rule Outputs */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-5 space-y-4">
            {/* Speed & Timeline Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="text-slate-400">Replay Speed:</span>
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg border font-bold ${
                      speed === s
                        ? 'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-slate-400">
                Stage {currentStepIndex + 1} of {sampleTimeline.length}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden my-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / sampleTimeline.length) * 100}%` }}
              ></div>
            </div>

            {/* Current Step Description Card */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-mono space-y-1">
              <div className="font-bold text-purple-700 dark:text-purple-300 text-sm font-sans flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{sampleTimeline[currentStepIndex].label}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans">
                {sampleTimeline[currentStepIndex].desc}
              </p>
            </div>

            {/* Counterfactual Evaluation Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="text-slate-400">Active Rules Triggered</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-300 mt-1">
                  {triggeredCount} of 6
                </div>
              </div>
              <div>
                <div className="text-slate-400">Calculated Risk Score</div>
                <div className={`text-xl font-bold mt-1 ${calculatedRiskScore > 0.7 ? 'text-rose-500' : 'text-amber-500'}`}>
                  {(calculatedRiskScore * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-slate-400">Alert Outcome</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {triggeredCount > 0 ? 'CRITICAL EXPLOIT ALERT' : 'PASSED / UNFLAGGED'}
                </div>
              </div>
            </div>

            {/* Live Evaluated Rule Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Rule ID</th>
                    <th className="px-3 py-2">Rule Name</th>
                    <th className="px-3 py-2">Toggle Status</th>
                    <th className="px-3 py-2">Rule Evaluation</th>
                    <th className="px-3 py-2">Risk Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {currentEvaluations.map((ev) => {
                    const isEnabled = ruleToggles[ev.rule_id] !== false;
                    return (
                      <tr key={ev.rule_id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-3 py-2 text-purple-600 dark:text-purple-400 font-bold">{ev.rule_id}</td>
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-sans font-semibold">{ev.rule_name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isEnabled ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            {isEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ev.triggered
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                            }`}
                          >
                            {ev.triggered ? 'TRIGGERED' : 'CLEARED'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                          +{ (ev.risk_contribution * 100).toFixed(0) }%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
