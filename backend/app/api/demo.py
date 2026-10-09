import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.seeds.seed_data import seed_database
from app.schemas.common import TransferCreateInput, TransferOut
from app.services.transfer_service import TransferService

router = APIRouter(prefix="/demo", tags=["Demo Controls"])

@router.post("/reset")
def reset_database(db: Session = Depends(get_db)):
    seed_database(db, force=True)
    return {"status": "SUCCESS", "message": "RIFT Bank database reset and re-seeded with 6 clients and balanced double-entry accounts."}

@router.post("/scenario/alexander-veyron-250m", response_model=TransferOut)
async def launch_alexander_veyron_scenario(db: Session = Depends(get_db)):
    """
    Repeatable demonstration scenario for FUSION 2026 CSB-01:
    Alexander Veyron ($86.4B simulated net worth) requests a $250,000,000.00 transfer
    from Ethereum Local L1 (31337) to Base Local L2 (31338).
    Creates persisted intent, reserves funds, and routes to RIFT for policy assessment.
    """
    scenario_input = TransferCreateInput(
        idempotency_key=f"demo_veyron_250m_{uuid.uuid4().hex[:8]}",
        client_id="cli_alexander_veyron",
        source_account_id="acc_veyron_treasury_usd",
        destination_account_id="ext_vault_base_l2_clearing",
        asset="TEST_USD",
        amount_display="250000000.00",
        source_chain_id=31337,
        destination_chain_id=31338,
        destination_address="0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        requested_by="Alexander Veyron (Authorized Signatory)",
        memo="Strategic Interchain Liquidity Bridge Allocation - CSB-01 Demo"
    )
    
    try:
        transfer = await TransferService.create_transfer(db, scenario_input)
        return transfer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
