"""
Application configuration for RIFT Bank
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "RIFT Bank Financial Simulator"
    VERSION: str = "2026.1-CSB01"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rift_bank.db")
    RIFT_API_BASE_URL: str = os.getenv("RIFT_API_BASE_URL", "http://localhost:8001/api/v1/rift")
    RIFT_API_KEY: str = os.getenv("RIFT_API_KEY", "dev_csb01_rift_key_simulation")
    RIFT_TIMEOUT_SECONDS: float = float(os.getenv("RIFT_TIMEOUT_SECONDS", "4.0"))
    SIMULATION_NOTICE: str = "RIFT BANK SIMULATION ENVIRONMENT · FICTIONAL CLIENTS · TEST ASSETS · NO REAL BANK CONNECTION"

settings = Settings()
