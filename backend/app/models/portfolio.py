from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(word.capitalize() for word in rest)


class ApiModel(BaseModel):
    """Shared API model config keeps FastAPI responses aligned with frontend types."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, serialize_by_alias=True)


class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class PortfolioCreate(ApiModel):
    name: str = Field(min_length=1, max_length=80)
    description: Optional[str] = None
    base_currency: str = Field(default="USD", min_length=3, max_length=3)


class PortfolioUpdate(ApiModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = None


class PortfolioRead(ApiModel):
    id: str
    name: str
    description: Optional[str] = None
    base_currency: str
    created_at: datetime
    updated_at: datetime


class TransactionCreate(ApiModel):
    symbol: str = Field(min_length=1, max_length=16)
    company_name: Optional[str] = None
    sector: str = "Unclassified"
    type: TransactionType
    quantity: float = Field(gt=0)
    price: float = Field(ge=0)
    fees: float = Field(default=0, ge=0)
    executed_at: datetime
    notes: Optional[str] = None


class TransactionRead(TransactionCreate):
    id: str
    portfolio_id: str
    created_at: datetime
    updated_at: datetime


class HoldingRead(ApiModel):
    symbol: str
    company_name: Optional[str] = None
    sector: str
    quantity: float
    average_cost: float
    invested_value: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    return_percent: float


class AllocationRead(ApiModel):
    sector: str
    value: float
    percent: float


class PerformancePointRead(ApiModel):
    label: str
    value: float


class PortfolioAnalyticsRead(ApiModel):
    total_value: float
    invested_value: float
    profit_loss: float
    return_percent: float
    sector_allocation: List[AllocationRead]
    holdings: List[HoldingRead]
    performance: List[PerformancePointRead] = Field(default_factory=list)


class MarketPriceMap(ApiModel):
    prices: Dict[str, float] = Field(default_factory=dict)
