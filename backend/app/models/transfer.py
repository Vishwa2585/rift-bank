from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Float, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(64), primary_key=True, index=True)
    idempotency_key = Column(String(64), unique=True, index=True, nullable=False)
    client_id = Column(String(64), ForeignKey("clients.id"), nullable=False, index=True)
    source_account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    destination_account_id = Column(String(64), nullable=False)
    transfer_type = Column(String(24), nullable=False)  # INTERNAL, CROSS_CHAIN
    asset = Column(String(16), nullable=False)
    amount_base_units = Column(BigInteger, nullable=False)
    amount_display = Column(String(64), nullable=False)
    source_chain_id = Column(Integer, nullable=True)
    destination_chain_id = Column(Integer, nullable=True)
    destination_address = Column(String(128), nullable=True)
    requested_by = Column(String(128), nullable=False)
    memo = Column(String(255), nullable=True)
    
    # Operation lifecycle status
    status = Column(String(32), default="DRAFT", nullable=False, index=True)
    
    # RIFT Integration fields
    rift_operation_id = Column(String(64), nullable=True, index=True)
    rift_risk_score = Column(Float, nullable=True)
    rift_risk_level = Column(String(32), nullable=True)
    rift_policy_matched = Column(String(128), nullable=True)
    rift_auth_required = Column(Boolean, default=False)
    rift_auth_url = Column(String(255), nullable=True)
    
    # Real / Verified Local Blockchain evidence
    source_tx_hash = Column(String(128), nullable=True)
    destination_tx_hash = Column(String(128), nullable=True)
    source_block_number = Column(Integer, nullable=True)
    destination_block_number = Column(Integer, nullable=True)
    
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="transfers")
    reconciliation_record = relationship("ReconciliationRecord", back_populates="transfer", uselist=False)
