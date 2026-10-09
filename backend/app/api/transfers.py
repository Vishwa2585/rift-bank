from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.transfer import Transfer
from app.schemas.common import TransferCreateInput, TransferOut, AuthorizeTransferRequest
from app.services.transfer_service import TransferService

router = APIRouter(prefix="/transfers", tags=["Transfers"])

@router.post("", response_model=TransferOut)
async def create_transfer(payload: TransferCreateInput, db: Session = Depends(get_db)):
    try:
        transfer = await TransferService.create_transfer(db, payload)
        return transfer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[TransferOut])
def list_transfers(
    client_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    transfer_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Transfer)
    if client_id:
        query = query.filter(Transfer.client_id == client_id)
    if status:
        query = query.filter(Transfer.status == status)
    if transfer_type:
        query = query.filter(Transfer.transfer_type == transfer_type)
    return query.order_by(Transfer.created_at.desc()).all()

@router.get("/{transfer_id}", response_model=TransferOut)
def get_transfer(transfer_id: str, db: Session = Depends(get_db)):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer

@router.post("/{transfer_id}/authorize", response_model=TransferOut)
async def authorize_transfer(
    transfer_id: str,
    payload: AuthorizeTransferRequest,
    db: Session = Depends(get_db)
):
    try:
        transfer = await TransferService.authorize_transfer(db, transfer_id, payload)
        return transfer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
