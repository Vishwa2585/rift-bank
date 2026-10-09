from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.client import Client
from app.schemas.common import ClientOut, ClientProfileOut
from app.services.client_service import ClientService

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=List[ClientOut])
def list_clients(db: Session = Depends(get_db)):
    # Filter out internal bank system client for standard client directory
    return db.query(Client).filter(Client.status != "SYSTEM").all()

@router.get("/{client_id}", response_model=ClientProfileOut)
def get_client(client_id: str, db: Session = Depends(get_db)):
    profile = ClientService.get_client_profile(db, client_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Client not found")
    return profile
