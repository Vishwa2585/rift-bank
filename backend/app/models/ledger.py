from datetime import datetime
from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class LedgerEntry(Base):
    """
    Immutable double-entry financial ledger record.
    Represents an atomic financial debit or credit movement.
    """
    __tablename__ = "ledger_entries"

    id = Column(String(64), primary_key=True, index=True)
    transaction_id = Column(String(64), nullable=False, index=True)  # Links debit and credit legs
    account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    asset = Column(String(16), nullable=False, index=True)
    direction = Column(String(8), nullable=False)  # DEBIT or CREDIT
    amount_base_units = Column(BigInteger, nullable=False)  # strictly positive integer
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    entry_type = Column(String(32), nullable=False)  # INITIAL_DEPOSIT, TRANSFER, SETTLEMENT, REVERSAL, CLEARING
    related_operation_id = Column(String(64), nullable=True, index=True)
    status = Column(String(24), default="POSTED", nullable=False)  # POSTED, PENDING_SETTLEMENT, REVERSED
    reversal_reference_id = Column(String(64), nullable=True)
    description = Column(String(255), nullable=False)

    account = relationship("Account", back_populates="ledger_entries")

    __table_args__ = (
        Index("idx_ledger_tx_asset", "transaction_id", "asset"),
    )
