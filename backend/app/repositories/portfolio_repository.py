from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from app.models.portfolio import (
    PortfolioCreate,
    PortfolioRead,
    PortfolioUpdate,
    TransactionCreate,
    TransactionRead,
    TransactionType,
)
from app.services.portfolio_engine import calculate_holdings

DEFAULT_PORTFOLIO_ID = "core-growth"
DEFAULT_PORTFOLIOS = [
    {
        "id": DEFAULT_PORTFOLIO_ID,
        "name": "Core Growth",
        "description": "Phase 2 sample portfolio for local analytics.",
        "base_currency": "USD",
        "created_at": datetime(2026, 1, 2, 9, 30, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 1, 2, 9, 30, tzinfo=timezone.utc),
    }
]
DEFAULT_TRANSACTIONS = [
    {
        "id": "tx-aapl-1",
        "portfolio_id": DEFAULT_PORTFOLIO_ID,
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "sector": "Technology",
        "type": TransactionType.BUY,
        "quantity": 8,
        "price": 212.4,
        "fees": 1,
        "executed_at": datetime(2026, 1, 8, 14, 30, tzinfo=timezone.utc),
    },
    {
        "id": "tx-msft-1",
        "portfolio_id": DEFAULT_PORTFOLIO_ID,
        "symbol": "MSFT",
        "company_name": "Microsoft Corp.",
        "sector": "Technology",
        "type": TransactionType.BUY,
        "quantity": 6,
        "price": 235.2,
        "fees": 1,
        "executed_at": datetime(2026, 2, 10, 14, 30, tzinfo=timezone.utc),
    },
    {
        "id": "tx-nvda-1",
        "portfolio_id": DEFAULT_PORTFOLIO_ID,
        "symbol": "NVDA",
        "company_name": "NVIDIA Corp.",
        "sector": "Semiconductors",
        "type": TransactionType.BUY,
        "quantity": 10,
        "price": 145.8,
        "fees": 1.5,
        "executed_at": datetime(2026, 3, 11, 14, 30, tzinfo=timezone.utc),
    },
    {
        "id": "tx-aapl-sell-1",
        "portfolio_id": DEFAULT_PORTFOLIO_ID,
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "sector": "Technology",
        "type": TransactionType.SELL,
        "quantity": 2,
        "price": 260.1,
        "fees": 1,
        "executed_at": datetime(2026, 4, 15, 14, 30, tzinfo=timezone.utc),
    },
]

for transaction in DEFAULT_TRANSACTIONS:
    transaction["created_at"] = transaction["executed_at"]
    transaction["updated_at"] = transaction["executed_at"]


class PortfolioRepository:
    """Development repository.

    Replace this adapter with a Prisma-backed implementation when the
    Supabase DATABASE_URL is configured in deployment.
    """

    def __init__(self) -> None:
        self._portfolios: Dict[str, PortfolioRead] = {
            item["id"]: PortfolioRead(**item) for item in DEFAULT_PORTFOLIOS
        }
        self._transactions: Dict[str, List[TransactionRead]] = {
            DEFAULT_PORTFOLIO_ID: [TransactionRead(**item) for item in DEFAULT_TRANSACTIONS]
        }

    def list_portfolios(self) -> List[PortfolioRead]:
        return sorted(self._portfolios.values(), key=lambda item: item.created_at)

    def create_portfolio(self, payload: PortfolioCreate) -> PortfolioRead:
        now = datetime.now(timezone.utc)
        portfolio = PortfolioRead(
            id=str(uuid4()),
            name=payload.name,
            description=payload.description,
            base_currency=payload.base_currency.upper(),
            created_at=now,
            updated_at=now,
        )
        self._portfolios[portfolio.id] = portfolio
        self._transactions[portfolio.id] = []
        return portfolio

    def get_portfolio(self, portfolio_id: str) -> Optional[PortfolioRead]:
        return self._portfolios.get(portfolio_id)

    def update_portfolio(self, portfolio_id: str, payload: PortfolioUpdate) -> Optional[PortfolioRead]:
        portfolio = self._portfolios.get(portfolio_id)
        if not portfolio:
            return None

        updated = portfolio.model_copy(
            update={
                "name": payload.name if payload.name is not None else portfolio.name,
                "description": payload.description if payload.description is not None else portfolio.description,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self._portfolios[portfolio_id] = updated
        return updated

    def delete_portfolio(self, portfolio_id: str) -> bool:
        self._transactions.pop(portfolio_id, None)
        return self._portfolios.pop(portfolio_id, None) is not None

    def list_transactions(self, portfolio_id: str) -> List[TransactionRead]:
        return sorted(self._transactions.get(portfolio_id, []), key=lambda item: item.executed_at)

    def add_transaction(self, portfolio_id: str, payload: TransactionCreate) -> Optional[TransactionRead]:
        if portfolio_id not in self._portfolios:
            return None

        if payload.type == TransactionType.SELL:
            holdings = calculate_holdings(self.list_transactions(portfolio_id), {})
            current_holding = next((holding for holding in holdings if holding.symbol == payload.symbol.upper()), None)
            if not current_holding or payload.quantity > current_holding.quantity:
                raise ValueError("Sell quantity exceeds current holding")

        now = datetime.now(timezone.utc)
        transaction = TransactionRead(
            id=str(uuid4()),
            portfolio_id=portfolio_id,
            symbol=payload.symbol.upper(),
            company_name=payload.company_name,
            sector=payload.sector,
            type=payload.type,
            quantity=payload.quantity,
            price=payload.price,
            fees=payload.fees,
            executed_at=payload.executed_at,
            notes=payload.notes,
            created_at=now,
            updated_at=now,
        )
        self._transactions[portfolio_id].append(transaction)
        return transaction


portfolio_repository = PortfolioRepository()
