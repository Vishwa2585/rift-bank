from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(64), primary_key=True, index=True)
    client_id = Column(String(64), ForeignKey("clients.id"), nullable=False, index=True)
    account_number = Column(String(64), unique=True, nullable=False)
    account_name = Column(String(128), nullable=False)
    account_type = Column(String(32), nullable=False)  # TREASURY, LIQUIDITY, ESCROW, SETTLEMENT, CUSTODY
    asset = Column(String(16), nullable=False)  # TEST_USD, TEST_EUR, TEST_ETH, TEST_BTC
    balance_base_units = Column(BigInteger, default=0, nullable=False)  # 1 USD = 100 cents
    reserved_base_units = Column(BigInteger, default=0, nullable=False)  # reserved in-flight
    is_active = Column(Boolean, default=True)
    chain_id = Column(Integer, nullable=True)  # 31337, 31338
    onchain_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="accounts")
    ledger_entries = relationship("LedgerEntry", back_populates="account")

    @property
    def available_balance_base_units(self) -> int:
        return max(0, self.balance_base_units - self.reserved_base_units)
