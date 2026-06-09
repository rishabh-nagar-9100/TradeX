from typing import List

from app.models.portfolio import MarketPriceMap, PortfolioAnalyticsRead, TransactionRead
from app.services.portfolio_engine import calculate_holdings, calculate_performance_series, calculate_sector_allocation


def build_portfolio_analytics(
    transactions: List[TransactionRead],
    market_prices: MarketPriceMap,
) -> PortfolioAnalyticsRead:
    """Return portfolio value, returns, holdings, and sector allocation."""

    holdings = calculate_holdings(transactions, market_prices.prices)
    total_value = sum(holding.market_value for holding in holdings)
    invested_value = sum(holding.invested_value for holding in holdings)
    profit_loss = total_value - invested_value

    return PortfolioAnalyticsRead(
        total_value=total_value,
        invested_value=invested_value,
        profit_loss=profit_loss,
        return_percent=(profit_loss / invested_value * 100) if invested_value else 0.0,
        sector_allocation=calculate_sector_allocation(holdings),
        holdings=holdings,
        performance=calculate_performance_series(transactions, market_prices.prices),
    )
