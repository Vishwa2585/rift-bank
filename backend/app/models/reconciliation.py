from datetime import datetime
from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReconciliationRecord(Base):
    __tablename__ = "reconciliation_records"

    id = Column(String(64), primary_key=True, index=True)
    transfer_id = Column(String(64), ForeignKey("transfers.id"), unique=True, nullable=False)
    rift_operation_id = Column(String(64), nullable=True)
    ledger_status = Column(String(32), default="BALANCED", nullable=False)  # BALANCED, DISCREPANCY, PENDING
    blockchain_status = Column(String(32), default="CONFIRMED", nullable=False)  # CONFIRMED, UNCONFIRMED, FAILED
    expected_amount_base_units = Column(BigInteger, nullable=False)
    settled_amount_base_units = Column(BigInteger, nullable=False)
    discrepancy_base_units = Column(BigInteger, default=0, nullable=False)
    reconciliation_hash = Column(String(128), nullable=True)
    notes = Column(Text, nullable=True)
    audited_at = Column(DateTime, default=datetime.utcnow)

    transfer = relationship("Transfer", back_populates="reconciliation_record")
