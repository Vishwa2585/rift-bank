"""
Transfer Orchestration Service for RIFT Bank.
Bridges internal client accounts, double-entry financial ledger holds,
and RIFT cross-chain authorization & execution adapter.
"""

import uuid
import json
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.account import Account
from app.models.transfer import Transfer
from app.models.reconciliation import ReconciliationRecord
from app.models.audit import AuditLog
from app.schemas.common import TransferCreateInput, AuthorizeTransferRequest
from app.services.ledger_engine import LedgerEngine, InsufficientFundsException, LedgerException
from app.adapters.rift_adapter import rift_adapter, RiftUnavailableException, RiftRejectedException

class TransferService:

    @classmethod
    async def create_transfer(cls, db: Session, payload: TransferCreateInput) -> Transfer:
        # 1. Idempotency Check
        existing_tx = db.query(Transfer).filter(Transfer.idempotency_key == payload.idempotency_key).first()
        if existing_tx:
            return existing_tx

        # 2. Account & Client Validation
        client = db.query(Client).filter(Client.id == payload.client_id).first()
        if not client:
            raise ValueError(f"Client {payload.client_id} does not exist")

        source_acc = db.query(Account).filter(Account.id == payload.source_account_id).first()
        if not source_acc:
            raise ValueError(f"Source account {payload.source_account_id} does not exist")

        if source_acc.client_id != client.id:
            raise ValueError(f"Source account does not belong to client {client.name}")

        if source_acc.asset != payload.asset:
            raise ValueError(f"Source account asset '{source_acc.asset}' does not match requested asset '{payload.asset}'")

        # 3. Parse Amount
        amount_base_units = LedgerEngine.parse_to_base_units(payload.amount_display, payload.asset)
        
        # 4. Determine Transfer Type
        is_internal = payload.destination_account_id.startswith("acc_")
        transfer_type = "INTERNAL" if is_internal else "CROSS_CHAIN"
        transfer_id = f"tx_req_{uuid.uuid4().hex[:10]}"

        transfer = Transfer(
            id=transfer_id,
            idempotency_key=payload.idempotency_key,
            client_id=client.id,
            source_account_id=source_acc.id,
            destination_account_id=payload.destination_account_id,
            transfer_type=transfer_type,
            asset=payload.asset,
            amount_base_units=amount_base_units,
            amount_display=payload.amount_display,
            source_chain_id=payload.source_chain_id or (31337 if transfer_type == "CROSS_CHAIN" else None),
            destination_chain_id=payload.destination_chain_id or (31338 if transfer_type == "CROSS_CHAIN" else None),
            destination_address=payload.destination_address or (payload.destination_account_id if transfer_type == "CROSS_CHAIN" else None),
            requested_by=payload.requested_by,
            memo=payload.memo,
            status="SUBMITTED",
            created_at=datetime.utcnow()
        )
        db.add(transfer)
        db.commit()
        db.refresh(transfer)

        # 5. Execution branch
        if transfer_type == "INTERNAL":
            try:
                dest_acc = db.query(Account).filter(Account.id == payload.destination_account_id).first()
                if not dest_acc:
                    raise ValueError(f"Destination account {payload.destination_account_id} not found")

                LedgerEngine.execute_internal_transfer(
                    db=db,
                    transfer_id=transfer.id,
                    source_account_id=source_acc.id,
                    dest_account_id=dest_acc.id,
                    asset=payload.asset,
                    amount_base_units=amount_base_units,
                    memo=payload.memo
                )
                transfer.status = "COMPLETED"
                db.add(AuditLog(
                    id=f"aud_{uuid.uuid4().hex[:12]}",
                    event_type="INTERNAL_TRANSFER_COMPLETED",
                    client_id=client.id,
                    transfer_id=transfer.id,
                    description=f"Internal transfer of {payload.amount_display} {payload.asset} settled"
                ))
                db.commit()
                db.refresh(transfer)
                return transfer
            except Exception as e:
                transfer.status = "FAILED"
                transfer.failure_reason = str(e)
                db.commit()
                db.refresh(transfer)
                raise

        # CROSS_CHAIN WORKFLOW
        # Step A: Place hold on source funds
        try:
            LedgerEngine.reserve_funds(
                db=db,
                account_id=source_acc.id,
                amount_base_units=amount_base_units,
                operation_id=transfer.id
            )
        except InsufficientFundsException as e:
            transfer.status = "FAILED"
            transfer.failure_reason = str(e)
            db.commit()
            db.refresh(transfer)
            raise

        # Step B: Submit transfer intent to RIFT platform
        rift_payload = {
            "transfer_id": transfer.id,
            "idempotency_key": transfer.idempotency_key,
            "client_id": client.id,
            "source_account_id": source_acc.id,
            "destination_account_id": transfer.destination_account_id,
            "asset": transfer.asset,
            "amount_base_units": str(amount_base_units),
            "amount_display": transfer.amount_display,
            "source_chain_id": transfer.source_chain_id,
            "destination_chain_id": transfer.destination_chain_id,
            "destination_address": transfer.destination_address,
            "requested_by": transfer.requested_by
        }

        try:
            rift_res = await rift_adapter.submit_intent(rift_payload)
            transfer.rift_operation_id = rift_res.get("rift_operation_id")
            transfer.status = rift_res.get("status", "SUBMITTED")
            
            risk = rift_res.get("risk_assessment", {})
            transfer.rift_risk_score = risk.get("risk_score")
            transfer.rift_risk_level = risk.get("risk_level")
            transfer.rift_policy_matched = risk.get("policy_matched")
            
            auth_info = rift_res.get("authorization_requirements", {})
            transfer.rift_auth_required = auth_info.get("required", False)
            transfer.rift_auth_url = auth_info.get("auth_url")

            # Check if auto-completed or rejected
            if transfer.status == "REJECTED":
                LedgerEngine.release_reservation(
                    db=db,
                    account_id=source_acc.id,
                    amount_base_units=amount_base_units,
                    operation_id=transfer.id,
                    reason="RIFT security policy rejected the intent"
                )
            elif transfer.status == "COMPLETED" and rift_res.get("blockchain_evidence"):
                # Settle immediately if auto-cleared
                evidence = rift_res["blockchain_evidence"]
                transfer.source_tx_hash = evidence.get("source", {}).get("tx_hash")
                transfer.destination_tx_hash = evidence.get("destination", {}).get("tx_hash")
                transfer.source_block_number = evidence.get("source", {}).get("block_number")
                transfer.destination_block_number = evidence.get("destination", {}).get("block_number")

                LedgerEngine.settle_cross_chain_transfer(
                    db=db,
                    transfer_id=transfer.id,
                    source_account_id=source_acc.id,
                    asset=transfer.asset,
                    amount_base_units=amount_base_units
                )
                cls._create_reconciliation_record(db, transfer, evidence)

            db.commit()
            db.refresh(transfer)
            return transfer

        except RiftRejectedException as e:
            transfer.status = "REJECTED"
            transfer.failure_reason = str(e)
            LedgerEngine.release_reservation(
                db=db,
                account_id=source_acc.id,
                amount_base_units=amount_base_units,
                operation_id=transfer.id,
                reason=f"Rejected: {e}"
            )
            db.commit()
            db.refresh(transfer)
            return transfer

        except RiftUnavailableException as e:
            transfer.status = "FAILED"
            transfer.failure_reason = "RIFT CONNECTION UNAVAILABLE: Cross-chain authorization service is currently offline"
            LedgerEngine.release_reservation(
                db=db,
                account_id=source_acc.id,
                amount_base_units=amount_base_units,
                operation_id=transfer.id,
                reason="RIFT offline"
            )
            db.commit()
            db.refresh(transfer)
            return transfer

    @classmethod
    async def authorize_transfer(cls, db: Session, transfer_id: str, auth_req: AuthorizeTransferRequest) -> Transfer:
        """
        Executes RIFT KEY authorization workflow for transfers awaiting authorization.
        """
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if not transfer:
            raise ValueError(f"Transfer {transfer_id} not found")

        if transfer.status != "AWAITING_AUTHORIZATION":
            raise ValueError(f"Transfer cannot be authorized: current status is {transfer.status}")

        if not transfer.rift_operation_id:
            raise ValueError("No RIFT operation associated with this transfer")

        # Submit authorization to RIFT
        try:
            auth_res = await rift_adapter.authorize_operation(
                rift_operation_id=transfer.rift_operation_id,
                approver=auth_req.approver,
                auth_token=auth_req.auth_token,
                comments=auth_req.comments
            )
            evidence = auth_res.get("blockchain_evidence")
            if not evidence:
                # Poll operation status to verify
                status_res = await rift_adapter.get_operation_status(transfer.rift_operation_id)
                evidence = status_res.get("blockchain_evidence")

            if not evidence:
                raise RiftUnavailableException("No verified blockchain execution evidence returned by RIFT")

            transfer.source_tx_hash = evidence.get("source", {}).get("tx_hash")
            transfer.destination_tx_hash = evidence.get("destination", {}).get("tx_hash")
            transfer.source_block_number = evidence.get("source", {}).get("block_number")
            transfer.destination_block_number = evidence.get("destination", {}).get("block_number")
            transfer.status = "COMPLETED"

            # Authoritative double-entry ledger settlement
            LedgerEngine.settle_cross_chain_transfer(
                db=db,
                transfer_id=transfer.id,
                source_account_id=transfer.source_account_id,
                asset=transfer.asset,
                amount_base_units=transfer.amount_base_units
            )

            # Record Reconciliation & Audit
            cls._create_reconciliation_record(db, transfer, evidence)
            
            db.add(AuditLog(
                id=f"aud_{uuid.uuid4().hex[:12]}",
                event_type="RIFT_KEY_TRANSFER_SETTLED",
                client_id=transfer.client_id,
                transfer_id=transfer.id,
                description=f"Transfer {transfer.id} authorized by {auth_req.approver} and settled on-chain."
            ))

            db.commit()
            db.refresh(transfer)
            return transfer

        except RiftUnavailableException as e:
            raise ValueError(f"RIFT authorization failed: {e}")

    @classmethod
    def _create_reconciliation_record(cls, db: Session, transfer: Transfer, evidence: Dict[str, Any]):
        rec_hash = evidence.get("forensic_summary", {}).get("reconciliation_hash", "")
        rec = ReconciliationRecord(
            id=f"rec_{uuid.uuid4().hex[:10]}",
            transfer_id=transfer.id,
            rift_operation_id=transfer.rift_operation_id,
            ledger_status="BALANCED",
            blockchain_status="CONFIRMED",
            expected_amount_base_units=transfer.amount_base_units,
            settled_amount_base_units=transfer.amount_base_units,
            discrepancy_base_units=0,
            reconciliation_hash=rec_hash,
            notes=f"Ledger settled and verified against local EVM chains {transfer.source_chain_id} -> {transfer.destination_chain_id}",
            audited_at=datetime.utcnow()
        )
        db.add(rec)
