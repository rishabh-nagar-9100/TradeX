import { DEFAULT_PORTFOLIO, DEFAULT_TRANSACTIONS } from './portfolioSeedData';
import { buildHoldings } from './portfolioEngine';
import type { Portfolio, PortfolioTransaction, TransactionType } from './types';

const PORTFOLIOS_KEY = 'tradex.portfolios';
const TRANSACTIONS_KEY = 'tradex.portfolio.transactions';

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listPortfolios(): Portfolio[] {
  return readJson<Portfolio[]>(PORTFOLIOS_KEY, [DEFAULT_PORTFOLIO]);
}

export function createPortfolio(name: string): Portfolio {
  const now = new Date().toISOString();
  const portfolio: Portfolio = {
    id: createId('portfolio'),
    name,
    baseCurrency: 'USD',
    createdAt: now,
    updatedAt: now
  };
  writeJson(PORTFOLIOS_KEY, [...listPortfolios(), portfolio]);
  return portfolio;
}

export function deletePortfolio(portfolioId: string) {
  const portfolios = listPortfolios().filter((portfolio) => portfolio.id !== portfolioId);
  const transactions = listTransactions().filter((transaction) => transaction.portfolioId !== portfolioId);

  writeJson(PORTFOLIOS_KEY, portfolios.length ? portfolios : [DEFAULT_PORTFOLIO]);
  writeJson(TRANSACTIONS_KEY, transactions);
}

export function listTransactions(portfolioId?: string): PortfolioTransaction[] {
  const transactions = readJson<PortfolioTransaction[]>(TRANSACTIONS_KEY, DEFAULT_TRANSACTIONS);
  return portfolioId ? transactions.filter((transaction) => transaction.portfolioId === portfolioId) : transactions;
}

export function addTransaction(payload: {
  portfolioId: string;
  symbol: string;
  companyName?: string;
  sector: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
}) {
  if (payload.type === 'SELL') {
    const holdings = buildHoldings(listTransactions(payload.portfolioId), {});
    const holding = holdings.find((item) => item.symbol === payload.symbol.trim().toUpperCase());

    if (!holding || payload.quantity > holding.quantity) {
      throw new Error('Sell quantity exceeds current holding');
    }
  }

  const transaction: PortfolioTransaction = {
    id: createId('tx'),
    portfolioId: payload.portfolioId,
    symbol: payload.symbol.trim().toUpperCase(),
    companyName: payload.companyName,
    sector: payload.sector || 'Unclassified',
    type: payload.type,
    quantity: payload.quantity,
    price: payload.price,
    fees: payload.fees,
    executedAt: new Date().toISOString()
  };

  writeJson(TRANSACTIONS_KEY, [...listTransactions(), transaction]);
  return transaction;
}
