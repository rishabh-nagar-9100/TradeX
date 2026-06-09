import type {
  Holding,
  PerformancePoint,
  PortfolioAnalytics,
  PortfolioTransaction,
  SectorAllocation
} from './types';

export type MarketPriceMap = Record<string, number>;

function toSymbol(value: string) {
  return value.trim().toUpperCase();
}

export function buildHoldings(
  transactions: PortfolioTransaction[],
  marketPrices: MarketPriceMap
): Holding[] {
  const lots = new Map<string, {
    symbol: string;
    companyName?: string;
    sector: string;
    quantity: number;
    costBasis: number;
  }>();

  [...transactions]
    .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime())
    .forEach((transaction) => {
      const symbol = toSymbol(transaction.symbol);
      const current = lots.get(symbol) ?? {
        symbol,
        companyName: transaction.companyName,
        sector: transaction.sector || 'Unclassified',
        quantity: 0,
        costBasis: 0
      };
      const grossValue = transaction.quantity * transaction.price;

      if (transaction.type === 'BUY') {
        current.quantity += transaction.quantity;
        current.costBasis += grossValue + transaction.fees;
        current.companyName = transaction.companyName || current.companyName;
        current.sector = transaction.sector || current.sector;
      } else if (current.quantity > 0) {
        if (transaction.quantity > current.quantity) {
          throw new Error(`Sell quantity exceeds current ${symbol} holding`);
        }

        const soldQuantity = Math.min(transaction.quantity, current.quantity);
        const averageCost = current.costBasis / current.quantity;
        current.quantity -= soldQuantity;
        current.costBasis = Math.max(0, current.costBasis - averageCost * soldQuantity);
      }

      lots.set(symbol, current);
    });

  return Array.from(lots.values())
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const averageCost = item.costBasis / item.quantity;
      const currentPrice = marketPrices[item.symbol] ?? averageCost;
      const marketValue = item.quantity * currentPrice;
      const unrealizedPnl = marketValue - item.costBasis;

      return {
        symbol: item.symbol,
        companyName: item.companyName,
        sector: item.sector,
        quantity: item.quantity,
        averageCost,
        investedValue: item.costBasis,
        currentPrice,
        marketValue,
        unrealizedPnl,
        returnPercent: item.costBasis ? unrealizedPnl / item.costBasis * 100 : 0
      };
    })
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function calculateSectorAllocation(holdings: Holding[]): SectorAllocation[] {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const sectorValue = holdings.reduce<Record<string, number>>((accumulator, holding) => {
    accumulator[holding.sector] = (accumulator[holding.sector] ?? 0) + holding.marketValue;
    return accumulator;
  }, {});

  return Object.entries(sectorValue)
    .map(([sector, value]) => ({
      sector,
      value,
      percent: totalValue ? value / totalValue * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildPerformanceSeries(
  transactions: PortfolioTransaction[],
  marketPrices: MarketPriceMap
): PerformancePoint[] {
  const orderedTransactions = [...transactions]
    .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime());

  return orderedTransactions.map((transaction, index) => {
    const history = orderedTransactions.slice(0, index + 1);
    const holdings = buildHoldings(history, marketPrices);
    return {
      label: new Date(transaction.executedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
    };
  });
}

export function calculatePortfolioAnalytics(
  transactions: PortfolioTransaction[],
  marketPrices: MarketPriceMap
): PortfolioAnalytics {
  const holdings = buildHoldings(transactions, marketPrices);
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const investedValue = holdings.reduce((sum, holding) => sum + holding.investedValue, 0);
  const profitLoss = totalValue - investedValue;

  return {
    totalValue,
    investedValue,
    profitLoss,
    returnPercent: investedValue ? profitLoss / investedValue * 100 : 0,
    sectorAllocation: calculateSectorAllocation(holdings),
    holdings,
    performance: buildPerformanceSeries(transactions, marketPrices)
  };
}
