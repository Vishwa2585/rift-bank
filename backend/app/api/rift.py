from fastapi import APIRouter, HTTPException
from app.adapters.rift_adapter import rift_adapter, RiftUnavailableException

router = APIRouter(prefix="/rift", tags=["RIFT Security Integration"])

@router.get("/status")
async def get_rift_connection_status():
    health = await rift_adapter.check_health()
    return health

@router.get("/investigation/{rift_operation_id}")
async def get_investigation_evidence(rift_operation_id: str):
    try:
        case = await rift_adapter.get_investigation_case(rift_operation_id)
        return case
    except RiftUnavailableException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
