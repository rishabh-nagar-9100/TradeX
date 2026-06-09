from app.models.portfolio import MarketPriceMap
from app.repositories.portfolio_repository import DEFAULT_PORTFOLIO_ID, portfolio_repository
from app.services.portfolio_service import build_portfolio_analytics


def assert_close(label: str, actual: float, expected: float) -> None:
    if abs(actual - expected) > 0.01:
        raise AssertionError(f"{label}: expected {expected}, received {actual}")


transactions = portfolio_repository.list_transactions(DEFAULT_PORTFOLIO_ID)
analytics = build_portfolio_analytics(
    transactions,
    MarketPriceMap(prices={"AAPL": 287.06, "MSFT": 268.61, "NVDA": 189.43}),
)

assert_close("total value", analytics.total_value, 5228.32)
assert_close("invested value", analytics.invested_value, 4146.85)
assert_close("profit/loss", analytics.profit_loss, 1081.47)
assert_close("return percent", analytics.return_percent, 26.08)
assert_close(
    "AAPL weighted average",
    next(holding.average_cost for holding in analytics.holdings if holding.symbol == "AAPL"),
    212.53,
)

print("Portfolio engine calculations verified.")
