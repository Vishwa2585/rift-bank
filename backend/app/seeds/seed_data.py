"""
Seed data generator for RIFT Bank.
Populates the 6 fictional high-net-worth clients, institutional accounts,
and initializes authoritative double-entry ledger records.
"""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.client import Client
from app.models.account import Account
from app.models.ledger import LedgerEntry
from app.models.audit import AuditLog
from app.services.ledger_engine import LedgerEngine

def seed_database(db: Session, force: bool = False):
    if not force and db.query(Client).count() > 0:
        return

    # Clear existing if force
    if force:
        db.query(LedgerEntry).delete()
        db.query(Account).delete()
        db.query(Client).delete()
        db.query(AuditLog).delete()
        db.commit()

    # 1. Bank Institutional System Client & Accounts (Counterparties for double-entry ledger balancing)
    bank_system_client = Client(
        id="cli_rift_bank_institutional",
        name="RIFT Bank System Reserve",
        category="Central Clearing & Reserve",
        headline="Institutional Treasury & Interchain Clearing Facility",
        simulated_net_worth_display="$250.0 billion",
        simulated_net_worth_units=250_000_000_000_00,
        status="SYSTEM",
        created_at=datetime.utcnow()
    )
    db.add(bank_system_client)
    db.commit()

    system_accounts = [
        Account(
            id="acc_bank_capital_reserve_usd",
            client_id=bank_system_client.id,
            account_number="SYS-CAPITAL-USD-001",
            account_name="RIFT Bank Master Capital Reserve USD",
            account_type="SETTLEMENT",
            asset="TEST_USD",
            balance_base_units=0,
            reserved_base_units=0,
            is_active=True
        ),
        Account(
            id="acc_bank_crosschain_clearing_usd",
            client_id=bank_system_client.id,
            account_number="SYS-CLEARING-USD-002",
            account_name="RIFT Interchain Transit Clearing USD",
            account_type="SETTLEMENT",
            asset="TEST_USD",
            balance_base_units=0,
            reserved_base_units=0,
            is_active=True
        ),
        Account(
            id="acc_bank_capital_reserve_eth",
            client_id=bank_system_client.id,
            account_number="SYS-CAPITAL-ETH-003",
            account_name="RIFT Bank Master Capital Reserve ETH",
            account_type="SETTLEMENT",
            asset="TEST_ETH",
            balance_base_units=0,
            reserved_base_units=0,
            is_active=True
        ),
        Account(
            id="acc_bank_capital_reserve_eur",
            client_id=bank_system_client.id,
            account_number="SYS-CAPITAL-EUR-004",
            account_name="RIFT Bank Master Capital Reserve EUR",
            account_type="SETTLEMENT",
            asset="TEST_EUR",
            balance_base_units=0,
            reserved_base_units=0,
            is_active=True
        ),
        Account(
            id="acc_bank_capital_reserve_btc",
            client_id=bank_system_client.id,
            account_number="SYS-CAPITAL-BTC-005",
            account_name="RIFT Bank Master Capital Reserve BTC",
            account_type="SETTLEMENT",
            asset="TEST_BTC",
            balance_base_units=0,
            reserved_base_units=0,
            is_active=True
        ),
    ]
    for sa in system_accounts:
        db.add(sa)
    db.commit()

    # 2. The 6 Fictional High-Net-Worth Clients
    clients_data = [
        {
            "id": "cli_alexander_veyron",
            "name": "Alexander Veyron",
            "category": "Technology Founder",
            "headline": "Founder & Principal Shareholder, Veyron Aerospace & Quantum Systems",
            "net_worth_display": "$86.4 billion",
            "net_worth_units": 86_400_000_000_00,
            "accounts": [
                {
                    "id": "acc_veyron_treasury_usd",
                    "account_number": "RF-8821-USD",
                    "account_name": "Veyron Holdings Master Treasury",
                    "account_type": "TREASURY",
                    "asset": "TEST_USD",
                    "amount_display": "4850000000.00",
                    "chain_id": 31337,
                    "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
                },
                {
                    "id": "acc_veyron_liquidity_usd",
                    "account_number": "RF-8822-USD",
                    "account_name": "Prime Liquid Operational Reserve",
                    "account_type": "LIQUIDITY",
                    "asset": "TEST_USD",
                    "amount_display": "750000000.00",
                    "chain_id": None,
                    "address": None
                },
                {
                    "id": "acc_veyron_l2_bridge_usd",
                    "account_number": "RF-8823-L2",
                    "account_name": "Arbitrum Base Strategic Bridge Vault",
                    "account_type": "ESCROW",
                    "asset": "TEST_USD",
                    "amount_display": "320000000.00",
                    "chain_id": 31338,
                    "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
                },
                {
                    "id": "acc_veyron_eth_vault",
                    "account_number": "RF-8824-ETH",
                    "account_name": "Ethereum Core Custody Vault",
                    "account_type": "CUSTODY",
                    "asset": "TEST_ETH",
                    "amount_display": "150000.000000",
                    "chain_id": 31337,
                    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                }
            ]
        },
        {
            "id": "cli_isabella_laurent",
            "name": "Isabella Laurent",
            "category": "Global Investment Principal",
            "headline": "Managing Principal, Laurent Sovereign Equity & Infrastructure",
            "net_worth_display": "$52.8 billion",
            "net_worth_units": 52_800_000_000_00,
            "accounts": [
                {
                    "id": "acc_laurent_treasury_usd",
                    "account_number": "RF-7101-USD",
                    "account_name": "Laurent Sovereign Global Treasury",
                    "account_type": "TREASURY",
                    "asset": "TEST_USD",
                    "amount_display": "2900000000.00",
                    "chain_id": 31337,
                    "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                },
                {
                    "id": "acc_laurent_eur_vault",
                    "account_number": "RF-7102-EUR",
                    "account_name": "European Sovereign Settlement Account",
                    "account_type": "SETTLEMENT",
                    "asset": "TEST_EUR",
                    "amount_display": "1450000000.00",
                    "chain_id": None,
                    "address": None
                }
            ]
        },
        {
            "id": "cli_cassian_wolfe",
            "name": "Cassian Wolfe",
            "category": "Digital Asset Fund Manager",
            "headline": "Chief Investment Officer, Hyperion Interchain Arbitrage Fund",
            "net_worth_display": "$34.2 billion",
            "net_worth_units": 34_200_000_000_00,
            "accounts": [
                {
                    "id": "acc_wolfe_liquidity_usd",
                    "account_number": "RF-6201-USD",
                    "account_name": "Hyperion High-Frequency Bridge Liquidity",
                    "account_type": "LIQUIDITY",
                    "asset": "TEST_USD",
                    "amount_display": "1850000000.00",
                    "chain_id": 31337,
                    "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
                },
                {
                    "id": "acc_wolfe_btc_vault",
                    "account_number": "RF-6202-BTC",
                    "account_name": "Hyperion Institutional Bitcoin Escrow",
                    "account_type": "CUSTODY",
                    "asset": "TEST_BTC",
                    "amount_display": "12500.00000000",
                    "chain_id": None,
                    "address": None
                }
            ]
        },
        {
            "id": "cli_zara_ellington",
            "name": "Zara Ellington",
            "category": "Private Equity Investor",
            "headline": "Senior Partner, Ellington Capital Global Buyout Fund VII",
            "net_worth_display": "$19.6 billion",
            "net_worth_units": 19_600_000_000_00,
            "accounts": [
                {
                    "id": "acc_ellington_treasury_usd",
                    "account_number": "RF-5301-USD",
                    "account_name": "Ellington Buyout Special Purpose Treasury",
                    "account_type": "TREASURY",
                    "asset": "TEST_USD",
                    "amount_display": "940000000.00",
                    "chain_id": 31337,
                    "address": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                }
            ]
        },
        {
            "id": "cli_adrian_blackwell",
            "name": "Adrian Blackwell",
            "category": "Family Office Principal",
            "headline": "Blackwell Dynasty Multi-Generational Trust & Family Office",
            "net_worth_display": "$12.7 billion",
            "net_worth_units": 12_700_000_000_00,
            "accounts": [
                {
                    "id": "acc_blackwell_liquidity_usd",
                    "account_number": "RF-4401-USD",
                    "account_name": "Blackwell Dynasty Liquid Family Reserve",
                    "account_type": "LIQUIDITY",
                    "asset": "TEST_USD",
                    "amount_display": "620000000.00",
                    "chain_id": 31338,
                    "address": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
                }
            ]
        },
        {
            "id": "cli_helena_ashford",
            "name": "Helena Ashford",
            "category": "Corporate Treasury Executive",
            "headline": "Executive Vice President & Group Treasurer, Ashford Global Logistics",
            "net_worth_display": "$8.9 billion",
            "net_worth_units": 8_900_000_000_00,
            "accounts": [
                {
                    "id": "acc_ashford_treasury_usd",
                    "account_number": "RF-3101-USD",
                    "account_name": "Ashford Logistics Interchain Supply Treasury",
                    "account_type": "TREASURY",
                    "asset": "TEST_USD",
                    "amount_display": "480000000.00",
                    "chain_id": 31337,
                    "address": "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
                }
            ]
        }
    ]

    for cdata in clients_data:
        client = Client(
            id=cdata["id"],
            name=cdata["name"],
            category=cdata["category"],
            headline=cdata["headline"],
            simulated_net_worth_display=cdata["net_worth_display"],
            simulated_net_worth_units=cdata["net_worth_units"],
            status="ACTIVE",
            created_at=datetime.utcnow()
        )
        db.add(client)
        db.commit()

        for acc_spec in cdata["accounts"]:
            asset = acc_spec["asset"]
            base_units = LedgerEngine.parse_to_base_units(acc_spec["amount_display"], asset)

            account = Account(
                id=acc_spec["id"],
                client_id=client.id,
                account_number=acc_spec["account_number"],
                account_name=acc_spec["account_name"],
                account_type=acc_spec["account_type"],
                asset=asset,
                balance_base_units=0,  # Will be populated by balanced ledger entry!
                reserved_base_units=0,
                is_active=True,
                chain_id=acc_spec["chain_id"],
                onchain_address=acc_spec["address"]
            )
            db.add(account)
            db.commit()

            # Determine counterpart system account
            system_acc_id = f"acc_bank_capital_reserve_{asset.replace('TEST_', '').lower()}"

            # Post balanced initial capitalization double-entry ledger entry
            tx_id = f"init_deposit_{account.id}"
            entries = [
                {
                    "account_id": system_acc_id,
                    "direction": "DEBIT",
                    "amount_base_units": base_units,
                    "description": f"Initial Capital Allocation for {client.name} ({account.account_number})"
                },
                {
                    "account_id": account.id,
                    "direction": "CREDIT",
                    "amount_base_units": base_units,
                    "description": f"Initial Deposit Credit ({account.account_number})"
                }
            ]

            LedgerEngine.post_balanced_transaction(
                db=db,
                transaction_id=tx_id,
                asset=asset,
                entry_type="INITIAL_DEPOSIT",
                entries=entries,
                related_operation_id=f"op_init_{account.id}",
                description=f"Initial capital allocation for {account.account_name}"
            )

    db.commit()
