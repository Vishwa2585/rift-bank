from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.reconciliation import ReconciliationRecord
from app.schemas.common import ReconciliationRecordOut

router = APIRouter(prefix="/reconciliation", tags=["Reconciliation"])

@router.get("", response_model=List[ReconciliationRecordOut])
def list_reconciliations(db: Session = Depends(get_db)):
    return db.query(ReconciliationRecord).order_by(ReconciliationRecord.audited_at.desc()).all()
