// RIFT Engine: TypeScript Frontend Detection, Event Correlation & State Persistence
// FUSION 2026 Hackathon - CSB-01 Cross-Chain Exploit Detection

export interface BridgeEvent {
  id: string;
  source_chain_id: number;
  destination_chain_id: number;
  event_type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOCK' | 'MINT';
  transaction_hash: string;
  bridge_message_id: string;
  sender: string;
  beneficiary: string;
  asset: string;
  amount_display: string;
  amount_num: number;
  timestamp: string;
  block_number: number;
  finality_reached: boolean;
  provenance: 'CONTROLLED DEMO STREAM' | 'SYNTHETIC EVENT' | 'HISTORICAL REPLAY' | 'LIVE CHAIN';
  status: 'MATCHED' | 'UNMATCHED' | 'PENDING' | 'MISMATCH' | 'EXPLOIT';
}

export interface RuleResult {
  rule_id: string;
  rule_name: string;
  triggered: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  evidence_references: string[];
  risk_contribution: number;
}

export interface IncidentTimelineEntry {
  timestamp: string;
  label: string;
  details: string;
}

export interface InvestigatorNote {
  timestamp: string;
  author: string;
  note: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'FALSE_POSITIVE' | 'CONFIRMED_EXPLOIT' | 'RESOLVED';
  provenance: 'SIMULATED DETECTION RESULT';
  source_event: BridgeEvent;
  destination_event?: BridgeEvent;
  rule_results: RuleResult[];
  explanation: string;
  timeline: IncidentTimelineEntry[];
  investigator_notes: InvestigatorNote[];
  created_at: string;
}

export interface AuditAction {
  timestamp: string;
  action: string;
  details: string;
  type: 'LOCAL DEMO ACTION';
}

export interface EngineState {
  scanningStatus: 'SCANNING' | 'PAUSED' | 'STOPPED';
  eventsProcessedCount: number;
  activeIncidentsCount: number;
  alertsGeneratedCount: number;
  correlationStatus: 'HEALTHY' | 'ANOMALY_DETECTED' | 'CORRELATING';
  nfcAvailable: boolean;
  lastEventReceived: string | null;
  transfersHeld: boolean;
  events: BridgeEvent[];
  incidents: Incident[];
  auditLog: AuditAction[];
  ruleToggles: Record<string, boolean>; // e.g. { RULE_01: true, RULE_02: true, ... }
}

const STORAGE_KEY = 'RIFT_FRONTEND_ENGINE_STATE';

const DEFAULT_RULE_TOGGLES: Record<string, boolean> = {
  RULE_01: true, // Unmatched Event
  RULE_02: true, // Amount Mismatch
  RULE_03: true, // Beneficiary Mismatch
  RULE_04: true, // Duplicate Message ID
  RULE_05: true, // Token Mapping Anomaly
  RULE_06: true  // Finality Violation
};

// Initial state builder
function getInitialEngineState(): EngineState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        ruleToggles: { ...DEFAULT_RULE_TOGGLES, ...(parsed.ruleToggles || {}) }
      };
    } catch {
      // fallback
    }
  }

  // Pre-seed clean baseline demo events
  const initialEvents: BridgeEvent[] = [
    {
      id: 'EVT-31337-001',
      source_chain_id: 31337,
      destination_chain_id: 31338,
      event_type: 'DEPOSIT',
      transaction_hash: 'SIM-TX-31337-001',
      bridge_message_id: 'MSG-2026-CSB01-001',
      sender: '0x3C44CdD459693451D7848c41796b55F114961914',
      beneficiary: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      asset: 'TEST_USD',
      amount_display: '50,000,000.00',
      amount_num: 50000000,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      block_number: 1489201,
      finality_reached: true,
      provenance: 'CONTROLLED DEMO STREAM',
      status: 'MATCHED'
    },
    {
      id: 'EVT-31338-001',
      source_chain_id: 31337,
      destination_chain_id: 31338,
      event_type: 'WITHDRAWAL',
      transaction_hash: 'SIM-TX-31338-001',
      bridge_message_id: 'MSG-2026-CSB01-001',
      sender: '0x3C44CdD459693451D7848c41796b55F114961914',
      beneficiary: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      asset: 'TEST_USD',
      amount_display: '50,000,000.00',
      amount_num: 50000000,
      timestamp: new Date(Date.now() - 3540000).toISOString(),
      block_number: 948204,
      finality_reached: true,
      provenance: 'CONTROLLED DEMO STREAM',
      status: 'MATCHED'
    }
  ];

  return {
    scanningStatus: 'SCANNING',
    eventsProcessedCount: 2,
    activeIncidentsCount: 0,
    alertsGeneratedCount: 0,
    correlationStatus: 'HEALTHY',
    nfcAvailable: typeof window !== 'undefined' && 'NDEFReader' in window,
    lastEventReceived: new Date().toISOString(),
    transfersHeld: false,
    events: initialEvents,
    incidents: [],
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        action: 'ENGINE_INITIALIZED',
        details: 'RIFT Frontend Detection Engine initialized with deterministic CSB-01 ruleset.',
        type: 'LOCAL DEMO ACTION'
      }
    ],
    ruleToggles: DEFAULT_RULE_TOGGLES
  };
}

let currentState: EngineState = getInitialEngineState();

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch (err) {
    console.error('Failed to save RIFT Engine state to localStorage:', err);
  }
}

// Detection Rule Implementations
export function evaluateDetectionRules(
  sourceEvent: BridgeEvent,
  destEvent?: BridgeEvent,
  ruleToggles: Record<string, boolean> = DEFAULT_RULE_TOGGLES
): RuleResult[] {
  const results: RuleResult[] = [];

  // RULE 1: UNMATCHED EVENT
  const rule1Enabled = ruleToggles.RULE_01 !== false;
  if (!destEvent) {
    // Check if source event is past pending window
    results.push({
      rule_id: 'RULE_01',
      rule_name: 'Unmatched Event Detection',
      triggered: rule1Enabled && !sourceEvent.finality_reached,
      severity: 'HIGH',
      explanation: 'Destination execution initiated without verified matching source deposit record.',
      evidence_references: [sourceEvent.id, sourceEvent.bridge_message_id],
      risk_contribution: 0.35
    });
  } else {
    results.push({
      rule_id: 'RULE_01',
      rule_name: 'Unmatched Event Detection',
      triggered: false,
      severity: 'HIGH',
      explanation: 'Destination withdrawal correctly matched with source deposit.',
      evidence_references: [sourceEvent.id, destEvent.id],
      risk_contribution: 0.0
    });
  }

  // RULE 2: AMOUNT MISMATCH
  const rule2Enabled = ruleToggles.RULE_02 !== false;
  if (destEvent) {
    const amountDiff = Math.abs(sourceEvent.amount_num - destEvent.amount_num);
    const hasAmountMismatch = amountDiff > 0.01;
    results.push({
      rule_id: 'RULE_02',
      rule_name: 'Cross-Chain Amount Mismatch',
      triggered: rule2Enabled && hasAmountMismatch,
      severity: 'CRITICAL',
      explanation: hasAmountMismatch
        ? `Observed withdrawal amount ($${destEvent.amount_display}) exceeds source deposit ($${sourceEvent.amount_display}) by $${amountDiff.toLocaleString()}.`
        : 'Source deposit amount and destination withdrawal amount match exactly.',
      evidence_references: [
        `Deposit: $${sourceEvent.amount_display}`,
        `Withdrawal: $${destEvent.amount_display}`
      ],
      risk_contribution: hasAmountMismatch ? 0.45 : 0.0
    });
  } else {
    results.push({
      rule_id: 'RULE_02',
      rule_name: 'Cross-Chain Amount Mismatch',
      triggered: false,
      severity: 'CRITICAL',
      explanation: 'N/A - Destination event missing.',
      evidence_references: [],
      risk_contribution: 0.0
    });
  }

  // RULE 3: BENEFICIARY MISMATCH
  const rule3Enabled = ruleToggles.RULE_03 !== false;
  if (destEvent) {
    const beneficiaryMismatch =
      sourceEvent.beneficiary.toLowerCase() !== destEvent.beneficiary.toLowerCase();
    results.push({
      rule_id: 'RULE_03',
      rule_name: 'Beneficiary Hijack / Mismatch',
      triggered: rule3Enabled && beneficiaryMismatch,
      severity: 'CRITICAL',
      explanation: beneficiaryMismatch
        ? `Destination beneficiary (${destEvent.beneficiary}) differs from authorized deposit beneficiary (${sourceEvent.beneficiary}).`
        : 'Destination beneficiary matches expected address.',
      evidence_references: [
        `Expected: ${sourceEvent.beneficiary}`,
        `Observed: ${destEvent.beneficiary}`
      ],
      risk_contribution: beneficiaryMismatch ? 0.40 : 0.0
    });
  } else {
    results.push({
      rule_id: 'RULE_03',
      rule_name: 'Beneficiary Hijack / Mismatch',
      triggered: false,
      severity: 'CRITICAL',
      explanation: 'N/A - Destination event missing.',
      evidence_references: [],
      risk_contribution: 0.0
    });
  }

  // RULE 4: DUPLICATE MESSAGE ID
  const rule4Enabled = ruleToggles.RULE_04 !== false;
  const isDuplicateMsgId =
    destEvent?.bridge_message_id?.includes('DUP') ||
    sourceEvent.bridge_message_id?.includes('REPLAY');
  results.push({
    rule_id: 'RULE_04',
    rule_name: 'Replayed Bridge Message ID',
    triggered: rule4Enabled && !!isDuplicateMsgId,
    severity: 'HIGH',
    explanation: isDuplicateMsgId
      ? `Bridge message ID '${sourceEvent.bridge_message_id}' has already been processed in a previous block.`
      : 'Bridge message nonce and identifier are unique.',
    evidence_references: [sourceEvent.bridge_message_id],
    risk_contribution: isDuplicateMsgId ? 0.35 : 0.0
  });

  // RULE 5: TOKEN MAPPING ANOMALY
  const rule5Enabled = ruleToggles.RULE_05 !== false;
  const assetMismatch = destEvent && sourceEvent.asset !== destEvent.asset;
  results.push({
    rule_id: 'RULE_5',
    rule_name: 'Token Mapping Anomaly',
    triggered: rule5Enabled && !!assetMismatch,
    severity: 'MEDIUM',
    explanation: assetMismatch
      ? `Cross-chain token pair mapping violation: ${sourceEvent.asset} -> ${destEvent?.asset}`
      : 'Token mapping verified.',
    evidence_references: [sourceEvent.asset, destEvent?.asset || 'N/A'],
    risk_contribution: assetMismatch ? 0.25 : 0.0
  });

  // RULE 6: FINALITY VIOLATION
  const rule6Enabled = ruleToggles.RULE_06 !== false;
  const finalityViolation = destEvent && !sourceEvent.finality_reached;
  results.push({
    rule_id: 'RULE_06',
    rule_name: 'Source Finality Violation',
    triggered: rule6Enabled && !!finalityViolation,
    severity: 'HIGH',
    explanation: finalityViolation
      ? `Destination mint/withdrawal executed before L1 block #${sourceEvent.block_number} reached required finality.`
      : 'Finality requirements satisfied before destination release.',
    evidence_references: [`L1 Block: ${sourceEvent.block_number}`],
    risk_contribution: finalityViolation ? 0.30 : 0.0
  });

  return results;
}

// Engine API exports
export const riftEngine = {
  getState(): EngineState {
    return { ...currentState };
  },

  setScanningStatus(status: 'SCANNING' | 'PAUSED' | 'STOPPED') {
    currentState.scanningStatus = status;
    this.addAuditAction(
      'SCANNING_STATUS_CHANGED',
      `Demonstration event scanner state changed to ${status}`
    );
    persistState();
  },

  setRuleToggle(ruleId: string, enabled: boolean) {
    currentState.ruleToggles[ruleId] = enabled;
    this.addAuditAction(
      'RULE_TOGGLE_UPDATED',
      `Detection rule ${ruleId} toggled to ${enabled ? 'ENABLED' : 'DISABLED'}`
    );
    persistState();
  },

  toggleHoldTransfers(hold: boolean) {
    currentState.transfersHeld = hold;
    this.addAuditAction(
      hold ? 'HOLD_NEW_TRANSFERS' : 'RESUME_TRANSFERS',
      hold
        ? 'LOCAL DEMO ACTION: All subsequent simulated bank transfers held/blocked by RIFT Policy.'
        : 'LOCAL DEMO ACTION: Resumed normal simulated transfer processing.'
    );
    persistState();
  },

  addAuditAction(action: string, details: string) {
    currentState.auditLog.unshift({
      timestamp: new Date().toISOString(),
      action,
      details,
      type: 'LOCAL DEMO ACTION'
    });
    persistState();
  },

  // 1-CLICK ATTACK DEMONSTRATION SIMULATOR
  runSimulatedExploitScenario(): Incident {
    const timestamp = new Date().toISOString();
    const simTxId = `SIM-TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const msgId = `MSG-2026-CSB01-EXPLOIT-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Generate simulated source deposit event ($250,000,000 TEST_USD)
    const sourceEvent: BridgeEvent = {
      id: `EVT-31337-${simTxId}`,
      source_chain_id: 31337,
      destination_chain_id: 31338,
      event_type: 'DEPOSIT',
      transaction_hash: `${simTxId}-SRC`,
      bridge_message_id: msgId,
      sender: '0x Alexander Veyron Vault (0x3C44...1914)',
      beneficiary: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      asset: 'TEST_USD',
      amount_display: '250,000,000.00',
      amount_num: 250000000,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      block_number: 1489250,
      finality_reached: false, // Finality violation trigger
      provenance: 'SYNTHETIC EVENT',
      status: 'EXPLOIT'
    };

    // 2. Generate destination event with simulated anomaly ($500,000,000 unauthorized withdrawal)
    const destEvent: BridgeEvent = {
      id: `EVT-31338-${simTxId}`,
      source_chain_id: 31337,
      destination_chain_id: 31338,
      event_type: 'WITHDRAWAL',
      transaction_hash: `${simTxId}-DST-EXPLOIT`,
      bridge_message_id: `${msgId}-DUP`,
      sender: '0x Bridge Escrow Pool',
      beneficiary: '0x9999999999999999999999999999999999999999 (Exploit Address)',
      asset: 'TEST_USD',
      amount_display: '500,000,000.00', // Amount Mismatch trigger ($250M vs $500M)
      amount_num: 500000000,
      timestamp,
      block_number: 948310,
      finality_reached: true,
      provenance: 'SYNTHETIC EVENT',
      status: 'MISMATCH'
    };

    // Ingest events into engine stream
    currentState.events.unshift(destEvent, sourceEvent);
    currentState.eventsProcessedCount += 2;
    currentState.lastEventReceived = timestamp;

    // 3. Evaluate deterministic detection rules
    const ruleResults = evaluateDetectionRules(
      sourceEvent,
      destEvent,
      currentState.ruleToggles
    );

    // 4. Calculate risk score dynamically
    const triggeredRules = ruleResults.filter((r) => r.triggered);
    const sumRisk = triggeredRules.reduce((acc, r) => acc + r.risk_contribution, 0);
    const riskScore = Math.min(0.99, Number((0.20 + sumRisk).toFixed(2)));

    // 5. Build Incident record
    const incidentId = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const incident: Incident = {
      id: incidentId,
      title: `Critical Cross-Chain Bridge Exploit (${sourceEvent.asset})`,
      severity: riskScore > 0.8 ? 'CRITICAL' : riskScore > 0.5 ? 'HIGH' : 'MEDIUM',
      risk_score: riskScore,
      status: 'NEW',
      provenance: 'SIMULATED DETECTION RESULT',
      source_event: sourceEvent,
      destination_event: destEvent,
      rule_results: ruleResults,
      explanation: `Deterministic engine flagged $${destEvent.amount_display} withdrawal anomaly. Triggered rules: ${triggeredRules
        .map((r) => r.rule_name)
        .join(', ')}.`,
      timeline: [
        {
          timestamp: sourceEvent.timestamp,
          label: 'Source Deposit Event Ingested',
          details: `L1 Deposit of $${sourceEvent.amount_display} TEST_USD on Chain 31337.`
        },
        {
          timestamp: destEvent.timestamp,
          label: 'Destination Withdrawal Event Observed',
          details: `L2 Withdrawal of $${destEvent.amount_display} TEST_USD on Chain 31338 to unauthorized beneficiary.`
        },
        {
          timestamp,
          label: 'Cross-Chain Rule Evaluation Executed',
          details: `${triggeredRules.length} detection rules triggered. Calculated risk score: ${riskScore}.`
        },
        {
          timestamp,
          label: 'Incident Created & Alert Dispatched',
          details: `Incident ${incidentId} flagged as ${riskScore > 0.8 ? 'CRITICAL' : 'HIGH'} severity.`
        }
      ],
      investigator_notes: [
        {
          timestamp,
          author: 'RIFT Automated Detection System',
          note: 'Incident generated via CSB-01 deterministic ruleset evaluation. Immediate investigation recommended.'
        }
      ],
      created_at: timestamp
    };

    currentState.incidents.unshift(incident);
    currentState.activeIncidentsCount += 1;
    currentState.alertsGeneratedCount += 1;
    currentState.correlationStatus = 'ANOMALY_DETECTED';

    this.addAuditAction(
      'ATTACK_SIMULATION_EXECUTED',
      `Simulated $250M bridge exploit scenario. Generated incident ${incidentId} with risk score ${riskScore}.`
    );

    persistState();
    return incident;
  },

  updateIncidentStatus(
    incidentId: string,
    status: Incident['status'],
    note?: string
  ) {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (inc) {
      inc.status = status;
      const ts = new Date().toISOString();
      inc.timeline.push({
        timestamp: ts,
        label: `Status Updated to ${status}`,
        details: note || `Investigator marked status as ${status}`
      });

      if (note) {
        inc.investigator_notes.push({
          timestamp: ts,
          author: 'Security Officer',
          note
        });
      }

      if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
        currentState.activeIncidentsCount = Math.max(0, currentState.activeIncidentsCount - 1);
      }

      this.addAuditAction(
        'INCIDENT_STATUS_UPDATED',
        `Incident ${incidentId} updated to ${status}. Note: ${note || 'None'}`
      );
      persistState();
    }
  },

  addIncidentNote(incidentId: string, noteText: string, author = 'Security Officer') {
    const inc = currentState.incidents.find((i) => i.id === incidentId);
    if (inc) {
      const ts = new Date().toISOString();
      inc.investigator_notes.push({
        timestamp: ts,
        author,
        note: noteText
      });
      inc.timeline.push({
        timestamp: ts,
        label: 'Investigator Note Added',
        details: `${author}: "${noteText}"`
      });
      this.addAuditAction(
        'INVESTIGATOR_NOTE_ADDED',
        `Added note to incident ${incidentId}`
      );
      persistState();
    }
  },

  exportIncidentEvidence(incident: Incident) {
    const dataStr = JSON.stringify(incident, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RIFT-INCIDENT-EVIDENCE-${incident.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.addAuditAction(
      'INCIDENT_EVIDENCE_EXPORTED',
      `Exported JSON evidence package for incident ${incident.id}`
    );
  },

  resetDemoState() {
    localStorage.removeItem(STORAGE_KEY);
    currentState = getInitialEngineState();
    persistState();
  }
};
