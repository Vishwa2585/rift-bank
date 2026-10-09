from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.ledger import LedgerEntry
from app.schemas.common import LedgerEntryOut

router = APIRouter(prefix="/ledger", tags=["Ledger"])

@router.get("", response_model=List[LedgerEntryOut])
def list_ledger_entries(
    account_id: Optional[str] = Query(None),
    transaction_id: Optional[str] = Query(None),
    asset: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(LedgerEntry)
    if account_id:
        query = query.filter(LedgerEntry.account_id == account_id)
    if transaction_id:
        query = query.filter(LedgerEntry.transaction_id == transaction_id)
    if asset:
        query = query.filter(LedgerEntry.asset == asset)
    return query.order_by(LedgerEntry.timestamp.desc()).all()

@router.get("/balance-check")
def verify_ledger_balance(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Audits the global double-entry financial ledger.
    Calculates total debits vs credits for every asset.
    """
    assets = db.query(LedgerEntry.asset).distinct().all()
    results = []
    overall_balanced = True

    for (asset,) in assets:
        debits = db.query(func.coalesce(func.sum(LedgerEntry.amount_base_units), 0)).filter(
            LedgerEntry.asset == asset,
            LedgerEntry.direction == "DEBIT"
        ).scalar()

        credits = db.query(func.coalesce(func.sum(LedgerEntry.amount_base_units), 0)).filter(
            LedgerEntry.asset == asset,
            LedgerEntry.direction == "CREDIT"
        ).scalar()

        diff = debits - credits
        is_balanced = (diff == 0)
        if not is_balanced:
            overall_balanced = False

        results.append({
            "asset": asset,
            "total_debits_base_units": debits,
            "total_credits_base_units": credits,
            "discrepancy_base_units": diff,
            "is_balanced": is_balanced
        })

    return {
        "status": "BALANCED" if overall_balanced else "UNBALANCED_WARNING",
        "double_entry_integrity_verified": overall_balanced,
        "assets_audited": results
    }
