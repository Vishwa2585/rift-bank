# RIFT BANK — Financial Simulator & Cross-Chain Ledger
**Product Category:** Fictional Financial Institution and Blockchain Transaction Simulator  
**Parent Ecosystem:** RIFT, Real-time Interchain Fraud Tracking  
**Purpose:** FUSION 2026, CSB-01 Demonstration  
**Permanent Environment Notice:**  
`RIFT BANK SIMULATION ENVIRONMENT · FICTIONAL CLIENTS · TEST ASSETS · NO REAL BANK CONNECTION`

---

## 1. Overview & Architectural Boundaries

RIFT Bank is an institutional financial operations console designed for private wealth management, interchain treasury allocations, and simulated cross-chain operations. It serves fictional billionaires, family offices, and digital asset funds while maintaining an **authoritative double-entry financial ledger** in SQLite and connecting to the **RIFT blockchain security platform**.

### Architectural Responsibility Matrix

| Responsibility Domain | RIFT Bank Owner | RIFT Security Platform Owner |
| :--- | :--- | :--- |
| **Fictional Clients & Profiles** | **YES** (Backend DB) | NO |
| **Simulated Accounts & Balances** | **YES** (Internal DB) | NO |
| **Double-Entry Financial Ledger** | **YES** (Authoritative) | NO |
| **Transfer Intent Generation** | **YES** (Initiator) | NO |
| **Cross-Chain Exploit Detection** | NO | **YES** (RIFT WATCH / Core) |
| **Transaction Risk Assessment** | NO | **YES** (Autonomous scoring) |
| **RIFT KEY Authorization Protocol** | NO (Submits & observes) | **YES** (Enforces policy) |
| **Blockchain Execution Policy** | NO | **YES** |
| **Local-Chain Transaction Submission** | NO | **YES** (Validator nodes) |
| **Forensic Evidence & Receipts** | NO (Consumes receipts) | **YES** (Investigation DB) |

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Glassmorphism design tokens (Dark mode primary + Light mode toggle).
- **Backend:** Python 3.13, FastAPI, SQLite, SQLAlchemy 2.0, Pydantic v2 schemas.
- **Ledger Engine:** Strict integer base units (cents for USD/EUR, integer micro-units for ETH/BTC) guaranteeing **zero floating-point inaccuracy** and enforcing atomic double-entry equality (Debits == Credits).
- **RIFT Adapter:** Resilient HTTP adapter with documented integration contract (`docs/RIFT_INTEGRATION.md`), raising explicit `RiftUnavailableException` when offline and displaying `RIFT CONNECTION UNAVAILABLE` without synthetic hash fabrication.
- **RIFT Reference Service:** Dedicated service on port 8001 implementing the RIFT security contract: policy evaluations, risk scoring, RIFT KEY MFA hardware authorization, and local EVM transaction execution across Chain 31337 & 31338.

---

## 3. The 14 Implemented User Interface Views

1. **Bank Overview:** Executive operations dashboard, total assets under management, interchain volume, recent transfer stream, and one-click CSB-01 demo launch.
2. **Client Directory:** All 6 fictional clients with categories, simulated wealth, and accounts count.
3. **Client Profile:** Deep dive into selected client (e.g. Alexander Veyron), asset allocation breakdown, and accounts list.
4. **Account Explorer:** Bank-wide vault directory (Treasury, Liquidity, Escrow, Custody, Settlement) with real-time balance statements.
5. **Account Ledger:** Authoritative double-entry journal with real-time "Audit Ledger Integrity" verification button.
6. **Transfer Creation:** 10-step validated transfer form supporting internal and cross-chain execution.
7. **Transfer Details:** Interactive transfer tracker with lifecycle stepper, risk metrics, and blockchain receipts.
8. **Cross-Chain Operations:** Multi-network operations routed across Ethereum Local L1 (31337) and Base Local L2 (31338).
9. **Authorization Status:** RIFT KEY Command Center for pending high-value operations awaiting biometric approval.
10. **Blockchain Evidence:** Verified local EVM chain receipts (distinct source & destination transaction hashes, block numbers, event logs).
11. **Reconciliation:** Audit table cross-referencing internal double-entry ledger settlements with verified on-chain receipts ($0.00 discrepancy).
12. **Activity & Audit History:** Immutable bank event logs with timestamps, event types, and metadata.
13. **System Integration Status:** Real-time telemetry, latency ping, and offline degradation status.
14. **Demo Controls:** Presentation harness with step-by-step walkthrough, one-click Alexander Veyron $250M launch, and database reset/reseed.

---

## 4. Fictional Client Universe

| Client Name | Category | Simulated Net Worth | Primary Accounts |
| :--- | :--- | :--- | :--- |
| **Alexander Veyron** | Technology Founder | **$86.4 billion** | Master Treasury USD, Prime Liquidity, L2 Bridge Vault, ETH Core Custody |
| **Isabella Laurent** | Global Investment Principal | **$52.8 billion** | Sovereign Global Treasury USD, European Settlement EUR |
| **Cassian Wolfe** | Digital Asset Fund Manager | **$34.2 billion** | Hyperion High-Frequency Liquidity USD, Bitcoin Escrow BTC |
| **Zara Ellington** | Private Equity Investor | **$19.6 billion** | Buyout Strategic Treasury USD |
| **Adrian Blackwell** | Family Office Principal | **$12.7 billion** | Dynasty Liquid Family Reserve USD |
| **Helena Ashford** | Corporate Treasury Executive | **$8.9 billion** | Interchain Supply Chain Treasury USD |

---

## 5. Endpoints Reference

### RIFT Bank Backend (Port 8000)
- `GET /health` — Service health check
- `GET /api/v1/clients` — List all 6 fictional clients
- `GET /api/v1/clients/{client_id}` — Client portfolio analytics and asset allocations
- `GET /api/v1/accounts` — List bank accounts
- `GET /api/v1/accounts/{account_id}/statement` — Account double-entry ledger statement
- `POST /api/v1/transfers` — Create transfer intent (internal or cross-chain)
- `GET /api/v1/transfers` — Query transfer operations (filtered by client/status/type)
- `GET /api/v1/transfers/{transfer_id}` — Retrieve transfer details and execution status
- `POST /api/v1/transfers/{transfer_id}/authorize` — RIFT KEY biometric authorization
- `GET /api/v1/ledger` — List general ledger journal entries
- `GET /api/v1/ledger/balance-check` — Verify global double-entry debit/credit equality
- `GET /api/v1/reconciliation` — List reconciliation audit records
- `GET /api/v1/audit` — List immutable system audit logs
- `GET /api/v1/rift/status` — Live telemetry and latency ping to RIFT service
- `POST /api/v1/demo/scenario/alexander-veyron-250m` — Repeatable CSB-01 $250M demonstration
- `POST /api/v1/demo/reset` — Reset database and reseed initial double-entry state

### RIFT Reference Service (Port 8001)
- `GET /health` — Platform health and supported chains [31337, 31338]
- `POST /api/v1/rift/transfers/intent` — Evaluates policy heuristics and enforces RIFT KEY MFA
- `GET /api/v1/rift/operations/{rift_operation_id}` — Query operation status and receipts
- `POST /api/v1/rift/operations/{rift_operation_id}/authorize` — Verify RIFT KEY and execute on-chain
- `GET /api/v1/rift/investigation/{rift_operation_id}` — Forensic evidence telemetry

---

## 6. How to Run the Applications

### Prerequisites
- Python 3.13+ installed
- Node.js 20+ & npm installed

### Step 1: Start RIFT Reference Platform Service
```bash
cd rift-service
..\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8001 --host 127.0.0.1
```

### Step 2: Start RIFT Bank Backend
```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --host 127.0.0.1
```

### Step 3: Start RIFT Bank Frontend
```bash
cd frontend
npm run preview -- --port 5173 --host 127.0.0.1
```

Visit the application at: **http://127.0.0.1:5173/**

---

## 7. Running Automated Tests

Run the complete test suite:
```bash
cd backend
.venv\Scripts\python.exe -m pytest -v tests/
```
All 10 tests cover:
1. Client and account seeding
2. Monetary base unit precision
3. Initial ledger double-entry balancing
4. Unbalanced ledger rejection
5. Internal transfer execution
6. Insufficient balance rejection
7. Idempotent transfer retries
8. Cross-chain reservation and offline handling (`RIFT CONNECTION UNAVAILABLE`)
9. Cross-chain full authorization and settlement scenario
10. Live RIFT service contract and evidence verification
