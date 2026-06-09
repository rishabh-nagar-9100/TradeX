from typing import List

from fastapi import APIRouter, HTTPException, status

from app.models.portfolio import (
    MarketPriceMap,
    PortfolioAnalyticsRead,
    PortfolioCreate,
    PortfolioRead,
    PortfolioUpdate,
    TransactionCreate,
    TransactionRead,
)
from app.repositories.portfolio_repository import portfolio_repository
from app.services.portfolio_service import build_portfolio_analytics

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=List[PortfolioRead])
def list_portfolios() -> List[PortfolioRead]:
    return portfolio_repository.list_portfolios()


@router.post("", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(payload: PortfolioCreate) -> PortfolioRead:
    return portfolio_repository.create_portfolio(payload)


@router.get("/{portfolio_id}", response_model=PortfolioRead)
def get_portfolio(portfolio_id: str) -> PortfolioRead:
    portfolio = portfolio_repository.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return portfolio


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio(portfolio_id: str, payload: PortfolioUpdate) -> PortfolioRead:
    portfolio = portfolio_repository.update_portfolio(portfolio_id, payload)
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return portfolio


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(portfolio_id: str) -> None:
    if not portfolio_repository.delete_portfolio(portfolio_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")


@router.get("/{portfolio_id}/transactions", response_model=List[TransactionRead])
def list_transactions(portfolio_id: str) -> List[TransactionRead]:
    if not portfolio_repository.get_portfolio(portfolio_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return portfolio_repository.list_transactions(portfolio_id)


@router.post("/{portfolio_id}/transactions", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def add_transaction(portfolio_id: str, payload: TransactionCreate) -> TransactionRead:
    try:
        transaction = portfolio_repository.add_transaction(portfolio_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return transaction


@router.post("/{portfolio_id}/analytics", response_model=PortfolioAnalyticsRead)
def get_portfolio_analytics(portfolio_id: str, prices: MarketPriceMap) -> PortfolioAnalyticsRead:
    if not portfolio_repository.get_portfolio(portfolio_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    transactions = portfolio_repository.list_transactions(portfolio_id)
    return build_portfolio_analytics(transactions, prices)
