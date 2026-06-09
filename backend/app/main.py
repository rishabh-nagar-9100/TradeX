from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.portfolio import router as portfolio_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="TradeX Portfolio API",
    version="0.2.0",
    description="Phase 2 portfolio CRUD, transactions, holdings, and analytics endpoints.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router, prefix="/api/v1")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}
