"""
Client calculation and portfolio analytics service
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.client import Client
from app.models.account import Account
from app.services.ledger_engine import LedgerEngine

class ClientService:
    ASSET_RATES_USD = {
        "TEST_USD": 1.0,
        "TEST_EUR": 1.08,
        "TEST_ETH": 3450.00,
        "TEST_BTC": 88500.00
    }

    @classmethod
    def get_client_profile(cls, db: Session, client_id: str) -> Dict[str, Any]:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            return None

        accounts = db.query(Account).filter(Account.client_id == client_id).all()
        
        total_usd = 0.0
        total_reserved = 0.0
        asset_breakdown: Dict[str, float] = {}

        for acc in accounts:
            rate = cls.ASSET_RATES_USD.get(acc.asset, 1.0)
            decimals = LedgerEngine.ASSET_DECIMALS.get(acc.asset, 2)
            acc_val = (acc.balance_base_units / (10 ** decimals)) * rate
            res_val = (acc.reserved_base_units / (10 ** decimals)) * rate
            
            total_usd += acc_val
            total_reserved += res_val
            asset_breakdown[acc.asset] = asset_breakdown.get(acc.asset, 0.0) + acc_val

        allocations = []
        for asset, val in asset_breakdown.items():
            pct = (val / total_usd * 100.0) if total_usd > 0 else 0.0
            allocations.append({
                "asset": asset,
                "value_usd": round(val, 2),
                "percentage": round(pct, 1)
            })

        return {
            "id": client.id,
            "name": client.name,
            "category": client.category,
            "headline": client.headline,
            "simulated_net_worth_display": client.simulated_net_worth_display,
            "simulated_net_worth_units": client.simulated_net_worth_units,
            "avatar_url": client.avatar_url,
            "status": client.status,
            "created_at": client.created_at,
            "accounts": accounts,
            "total_calculated_usd": round(total_usd, 2),
            "total_reserved_usd": round(total_reserved, 2),
            "total_available_usd": round(total_usd - total_reserved, 2),
            "asset_allocation": allocations
        }
