export type TransactionType = 'BUY' | 'SELL';

export type Portfolio = {
  id: string;
  name: string;
  description?: string;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioTransaction = {
  id: string;
  portfolioId: string;
  symbol: string;
  companyName?: string;
  sector: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  executedAt: string;
  notes?: string;
};

export type Holding = {
  symbol: string;
  companyName?: string;
  sector: string;
  quantity: number;
  averageCost: number;
  investedValue: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  returnPercent: number;
};

export type SectorAllocation = {
  sector: string;
  value: number;
  percent: number;
};

export type PerformancePoint = {
  label: string;
  value: number;
};

export type PortfolioAnalytics = {
  totalValue: number;
  investedValue: number;
  profitLoss: number;
  returnPercent: number;
  sectorAllocation: SectorAllocation[];
  holdings: Holding[];
  performance: PerformancePoint[];
};
