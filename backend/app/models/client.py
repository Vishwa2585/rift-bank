from datetime import datetime
from sqlalchemy import Column, String, BigInteger, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)  # Technology Founder, Family Office Principal, etc.
    headline = Column(String(255), nullable=True)
    simulated_net_worth_display = Column(String(64), nullable=False)
    simulated_net_worth_units = Column(BigInteger, nullable=False)  # in base units / cents
    avatar_url = Column(String(255), nullable=True)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="client", cascade="all, delete-orphan")
    transfers = relationship("Transfer", back_populates="client")
