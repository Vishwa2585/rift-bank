"""
RIFT Bank - Financial Simulator & Double-Entry Ledger Backend
FUSION 2026, CSB-01
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_database

# Routers
from app.api.clients import router as clients_router
from app.api.accounts import router as accounts_router
from app.api.transfers import router as transfers_router
from app.api.ledger import router as ledger_router
from app.api.reconciliation import router as reconciliation_router
from app.api.audit import router as audit_router
from app.api.rift import router as rift_router
from app.api.demo import router as demo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and tables
    Base.metadata.create_all(bind=engine)
    # Seed clients, accounts and initial double-entry ledger if empty
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Fictional Financial Institution & Persistent Double-Entry Ledger Backend integrating with RIFT Security Platform.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all v1 routes
api_prefix = settings.API_V1_STR
app.include_router(clients_router, prefix=api_prefix)
app.include_router(accounts_router, prefix=api_prefix)
app.include_router(transfers_router, prefix=api_prefix)
app.include_router(ledger_router, prefix=api_prefix)
app.include_router(reconciliation_router, prefix=api_prefix)
app.include_router(audit_router, prefix=api_prefix)
app.include_router(rift_router, prefix=api_prefix)
app.include_router(demo_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "institution": "RIFT Bank",
        "category": "Fictional Financial Institution & Cross-Chain Ledger",
        "notice": settings.SIMULATION_NOTICE,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "HEALTHY",
        "service": "RIFT Bank Core Backend",
        "ledger_engine": "ONLINE",
        "simulation_mode": True
    }
