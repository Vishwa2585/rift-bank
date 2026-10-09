"""
Authoritative Double-Entry Financial Ledger Engine for RIFT Bank.
Enforces:
1. Strict integer base unit calculations (Zero floating-point inaccuracies).
2. Balanced debit and credit equality per asset transaction.
3. Explicit fund reservation, release, settlement, and reversal mechanics.
4. Idempotent posting.
"""

import uuid
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.ledger import LedgerEntry
from app.models.audit import AuditLog

class LedgerException(Exception):
    pass

class InsufficientFundsException(LedgerException):
    pass

class UnbalancedLedgerException(LedgerException):
    pass

class DuplicateTransactionException(LedgerException):
    pass


class LedgerEngine:
    ASSET_DECIMALS = {
        "TEST_USD": 2,
        "TEST_EUR": 2,
        "TEST_ETH": 6,
        "TEST_BTC": 8
    }

    @classmethod
    def parse_to_base_units(cls, amount_display: str, asset: str) -> int:
        """Converts user-entered string to exact integer base units using Decimal."""
        try:
            dec = Decimal(str(amount_display).strip().replace(",", ""))
            if dec <= Decimal("0"):
                raise ValueError("Amount must be strictly positive")
            decimals = cls.ASSET_DECIMALS.get(asset, 2)
            multiplier = Decimal(10 ** decimals)
            base_units = int((dec * multiplier).to_integral_value(rounding=ROUND_HALF_UP))
            return base_units
        except Exception as e:
            raise LedgerException(f"Invalid monetary amount '{amount_display}' for asset {asset}: {e}")

    @classmethod
    def format_base_units(cls, base_units: int, asset: str) -> str:
        decimals = cls.ASSET_DECIMALS.get(asset, 2)
        dec = Decimal(base_units) / Decimal(10 ** decimals)
        return f"{dec:,.{decimals}f}"

    @classmethod
    def reserve_funds(cls, db: Session, account_id: str, amount_base_units: int, operation_id: str) -> Account:
        """
        Puts an authoritative hold on funds prior to cross-chain submission.
        Does not mutate balance, but reduces available balance.
        """
        account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
        if not account:
            raise LedgerException(f"Account {account_id} not found")

        available = account.balance_base_units - account.reserved_base_units
        if available < amount_base_units:
            raise InsufficientFundsException(
                f"Insufficient available funds in account {account.account_number}. "
                f"Available: {cls.format_base_units(available, account.asset)} {account.asset}, "
                f"Required: {cls.format_base_units(amount_base_units, account.asset)} {account.asset}"
            )

        account.reserved_base_units += amount_base_units
        
        # Log audit entry
        db.add(AuditLog(
            id=f"aud_{uuid.uuid4().hex[:12]}",
            event_type="FUNDS_RESERVED",
            client_id=account.client_id,
            transfer_id=operation_id,
            description=f"Reserved {cls.format_base_units(amount_base_units, account.asset)} {account.asset} on account {account.account_number}"
        ))
        
        db.commit()
        db.refresh(account)
        return account

    @classmethod
    def release_reservation(cls, db: Session, account_id: str, amount_base_units: int, operation_id: str, reason: str = ""):
        """
        Releases hold when a transaction is rejected or fails before execution.
        """
        account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
        if not account:
            return

        account.reserved_base_units = max(0, account.reserved_base_units - amount_base_units)
        
        db.add(AuditLog(
            id=f"aud_{uuid.uuid4().hex[:12]}",
            event_type="RESERVATION_RELEASED",
            client_id=account.client_id,
            transfer_id=operation_id,
            description=f"Released reservation of {cls.format_base_units(amount_base_units, account.asset)} {account.asset}. Reason: {reason}"
        ))
        
        db.commit()
        db.refresh(account)

    @classmethod
    def post_balanced_transaction(
        cls,
        db: Session,
        transaction_id: str,
        asset: str,
        entry_type: str,
        entries: List[Dict[str, Any]],
        related_operation_id: Optional[str] = None,
        description: str = ""
    ) -> List[LedgerEntry]:
        """
        Posts an atomic double-entry transaction.
        Enforces that Total Debits == Total Credits for the asset.
        """
        # Idempotency check: verify transaction_id doesn't already exist
        existing = db.query(LedgerEntry).filter(LedgerEntry.transaction_id == transaction_id).first()
        if existing:
            return db.query(LedgerEntry).filter(LedgerEntry.transaction_id == transaction_id).all()

        total_debits = 0
        total_credits = 0
        ledger_objects: List[LedgerEntry] = []

        for item in entries:
            acc_id = item["account_id"]
            direction = item["direction"].upper()
            amount = item["amount_base_units"]
            if amount <= 0:
                raise LedgerException("Ledger entry amount must be strictly positive")

            if direction == "DEBIT":
                total_debits += amount
            elif direction == "CREDIT":
                total_credits += amount
            else:
                raise LedgerException(f"Invalid ledger direction: {direction}")

            account = db.query(Account).filter(Account.id == acc_id).with_for_update().first()
            if not account:
                raise LedgerException(f"Account {acc_id} does not exist")
            if account.asset != asset:
                raise LedgerException(f"Account {acc_id} asset {account.asset} mismatch with transaction asset {asset}")

            # Apply accounting impact to account balance
            # For banking assets:
            # When an internal customer transfers funds out, customer account is DEBITED (balance decreases),
            # or in standard liability accounting: debit decreases liability balance.
            # Here: DEBIT = account balance decreases; CREDIT = account balance increases.
            if direction == "DEBIT":
                account.balance_base_units -= amount
            else:
                account.balance_base_units += amount

            entry_obj = LedgerEntry(
                id=f"led_{uuid.uuid4().hex[:12]}",
                transaction_id=transaction_id,
                account_id=acc_id,
                asset=asset,
                direction=direction,
                amount_base_units=amount,
                entry_type=entry_type,
                related_operation_id=related_operation_id,
                status="POSTED",
                description=item.get("description", description),
                timestamp=datetime.utcnow()
            )
            ledger_objects.append(entry_obj)
            db.add(entry_obj)

        if total_debits != total_credits:
            db.rollback()
            raise UnbalancedLedgerException(
                f"Double-entry ledger imbalance! Debits={total_debits}, Credits={total_credits}, Diff={abs(total_debits - total_credits)}"
            )

        db.commit()
        return ledger_objects

    @classmethod
    def execute_internal_transfer(
        cls,
        db: Session,
        transfer_id: str,
        source_account_id: str,
        dest_account_id: str,
        asset: str,
        amount_base_units: int,
        memo: Optional[str] = None
    ) -> List[LedgerEntry]:
        """Executes balanced transfer between two internal accounts."""
        src = db.query(Account).filter(Account.id == source_account_id).first()
        dst = db.query(Account).filter(Account.id == dest_account_id).first()
        if not src or not dst:
            raise LedgerException("Source or destination account does not exist")

        if src.available_balance_base_units < amount_base_units:
            raise InsufficientFundsException("Insufficient available balance for internal transfer")

        entries = [
            {
                "account_id": source_account_id,
                "direction": "DEBIT",
                "amount_base_units": amount_base_units,
                "description": f"Internal Transfer to {dst.account_number} ({memo or 'Transfer'})"
            },
            {
                "account_id": dest_account_id,
                "direction": "CREDIT",
                "amount_base_units": amount_base_units,
                "description": f"Internal Transfer from {src.account_number} ({memo or 'Transfer'})"
            }
        ]

        return cls.post_balanced_transaction(
            db=db,
            transaction_id=f"tx_led_{transfer_id}",
            asset=asset,
            entry_type="TRANSFER",
            entries=entries,
            related_operation_id=transfer_id,
            description=f"Internal transfer: {src.account_number} -> {dst.account_number}"
        )

    @classmethod
    def settle_cross_chain_transfer(
        cls,
        db: Session,
        transfer_id: str,
        source_account_id: str,
        asset: str,
        amount_base_units: int,
        transit_account_id: str = "acc_bank_crosschain_clearing_usd"
    ) -> List[LedgerEntry]:
        """
        Authoritative settlement of cross-chain transfer following confirmed blockchain execution.
        Clears the reservation on the source account and posts balanced double-entry settlement.
        """
        src = db.query(Account).filter(Account.id == source_account_id).with_for_update().first()
        transit = db.query(Account).filter(Account.id == transit_account_id).with_for_update().first()
        
        if not src or not transit:
            raise LedgerException("Source or transit clearing account not found")

        # Clear reservation
        src.reserved_base_units = max(0, src.reserved_base_units - amount_base_units)

        entries = [
            {
                "account_id": source_account_id,
                "direction": "DEBIT",
                "amount_base_units": amount_base_units,
                "description": f"Cross-Chain Bridge Settlement ({transfer_id})"
            },
            {
                "account_id": transit_account_id,
                "direction": "CREDIT",
                "amount_base_units": amount_base_units,
                "description": f"Transit Clearing settlement for {src.account_number}"
            }
        ]

        return cls.post_balanced_transaction(
            db=db,
            transaction_id=f"tx_settle_{transfer_id}",
            asset=asset,
            entry_type="SETTLEMENT",
            entries=entries,
            related_operation_id=transfer_id,
            description=f"Settled cross-chain transfer {transfer_id}"
        )
