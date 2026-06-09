from collections import defaultdict
from typing import Dict, Iterable, List, Optional, Union

from app.models.portfolio import AllocationRead, HoldingRead, PerformancePointRead, TransactionRead, TransactionType


def calculate_holdings(
    transactions: Iterable[TransactionRead],
    market_prices: Dict[str, float],
) -> List[HoldingRead]:
    """Build weighted-average holdings from ordered buy/sell transactions."""

    lots: Dict[str, Dict[str, Union[float, str, Optional[str]]]] = {}

    for transaction in sorted(transactions, key=lambda item: item.executed_at):
        symbol = transaction.symbol.upper()
        current = lots.setdefault(
            symbol,
            {
                "symbol": symbol,
                "company_name": transaction.company_name,
                "sector": transaction.sector,
                "quantity": 0.0,
                "cost_basis": 0.0,
            },
        )

        quantity = float(transaction.quantity)
        gross_value = quantity * float(transaction.price)
        fees = float(transaction.fees)

        if transaction.type == TransactionType.BUY:
            current["quantity"] = float(current["quantity"]) + quantity
            current["cost_basis"] = float(current["cost_basis"]) + gross_value + fees
            current["company_name"] = transaction.company_name or current["company_name"]
            current["sector"] = transaction.sector or str(current["sector"])
            continue

        held_quantity = float(current["quantity"])
        if held_quantity <= 0:
            continue

        sell_quantity = min(quantity, held_quantity)
        average_cost = float(current["cost_basis"]) / held_quantity
        current["quantity"] = held_quantity - sell_quantity
        current["cost_basis"] = max(0.0, float(current["cost_basis"]) - average_cost * sell_quantity)

    holdings: List[HoldingRead] = []
    for symbol, value in lots.items():
        quantity = float(value["quantity"])
        if quantity <= 0:
            continue

        invested_value = float(value["cost_basis"])
        average_cost = invested_value / quantity if quantity else 0.0
        current_price = float(market_prices.get(symbol, average_cost))
        market_value = quantity * current_price
        pnl = market_value - invested_value

        holdings.append(
            HoldingRead(
                symbol=symbol,
                company_name=value["company_name"],
                sector=str(value["sector"] or "Unclassified"),
                quantity=quantity,
                average_cost=average_cost,
                invested_value=invested_value,
                current_price=current_price,
                market_value=market_value,
                unrealized_pnl=pnl,
                return_percent=(pnl / invested_value * 100) if invested_value else 0.0,
            )
        )

    return sorted(holdings, key=lambda holding: holding.market_value, reverse=True)


def calculate_sector_allocation(holdings: Iterable[HoldingRead]) -> List[AllocationRead]:
    sector_values: Dict[str, float] = defaultdict(float)

    for holding in holdings:
        sector_values[holding.sector] += holding.market_value

    total_value = sum(sector_values.values())
    return [
        AllocationRead(
            sector=sector,
            value=value,
            percent=(value / total_value * 100) if total_value else 0.0,
        )
        for sector, value in sorted(sector_values.items(), key=lambda item: item[1], reverse=True)
    ]


def calculate_performance_series(
    transactions: List[TransactionRead],
    market_prices: Dict[str, float],
) -> List[PerformancePointRead]:
    """Return portfolio value after each transaction for dashboard charts."""

    ordered_transactions = sorted(transactions, key=lambda item: item.executed_at)
    points: List[PerformancePointRead] = []

    for index, transaction in enumerate(ordered_transactions):
        holdings = calculate_holdings(ordered_transactions[: index + 1], market_prices)
        points.append(
            PerformancePointRead(
                label=transaction.executed_at.strftime("%b %-d"),
                value=sum(holding.market_value for holding in holdings),
            )
        )

    return points
