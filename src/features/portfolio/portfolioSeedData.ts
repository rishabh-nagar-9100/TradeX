import type { MarketPriceMap } from './portfolioEngine';
import type { Portfolio, PortfolioTransaction } from './types';

export const MARKET_PRICE_BY_SYMBOL: MarketPriceMap = {
  AAPL: 287.06,
  MSFT: 268.61,
  NVDA: 189.43,
  TSLA: 272.57,
  GOOGL: 176.22
};

export const DEFAULT_PORTFOLIO: Portfolio = {
  id: 'core-growth',
  name: 'Core Growth',
  description: 'Phase 2 sample portfolio for local analytics.',
  baseCurrency: 'USD',
  createdAt: '2026-01-02T09:30:00.000Z',
  updatedAt: '2026-01-02T09:30:00.000Z'
};

export const DEFAULT_TRANSACTIONS: PortfolioTransaction[] = [
  {
    id: 'tx-aapl-1',
    portfolioId: DEFAULT_PORTFOLIO.id,
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology',
    type: 'BUY',
    quantity: 8,
    price: 212.4,
    fees: 1,
    executedAt: '2026-01-08T14:30:00.000Z'
  },
  {
    id: 'tx-msft-1',
    portfolioId: DEFAULT_PORTFOLIO.id,
    symbol: 'MSFT',
    companyName: 'Microsoft Corp.',
    sector: 'Technology',
    type: 'BUY',
    quantity: 6,
    price: 235.2,
    fees: 1,
    executedAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'tx-nvda-1',
    portfolioId: DEFAULT_PORTFOLIO.id,
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    sector: 'Semiconductors',
    type: 'BUY',
    quantity: 10,
    price: 145.8,
    fees: 1.5,
    executedAt: '2026-03-11T14:30:00.000Z'
  },
  {
    id: 'tx-aapl-sell-1',
    portfolioId: DEFAULT_PORTFOLIO.id,
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology',
    type: 'SELL',
    quantity: 2,
    price: 260.1,
    fees: 1,
    executedAt: '2026-04-15T14:30:00.000Z'
  }
];
