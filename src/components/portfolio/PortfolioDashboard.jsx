import { Trash2, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calculatePortfolioAnalytics } from '../../features/portfolio/portfolioEngine';
import { MARKET_PRICE_BY_SYMBOL } from '../../features/portfolio/portfolioSeedData';
import {
  addTransaction,
  createPortfolio,
  deletePortfolio,
  listPortfolios,
  listTransactions
} from '../../features/portfolio/portfolioRepository';
import AllocationDonut from './AllocationDonut';
import PerformanceChart from './PerformanceChart';
import TransactionForm from './TransactionForm';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export default function PortfolioDashboard() {
  const [portfolios, setPortfolios] = useState(() => listPortfolios());
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(() => portfolios[0]?.id);
  const [transactions, setTransactions] = useState(() => listTransactions(selectedPortfolioId));
  const [portfolioName, setPortfolioName] = useState('');
  const [formError, setFormError] = useState('');

  const selectedPortfolio = portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ?? portfolios[0];
  const analytics = useMemo(() => {
    return calculatePortfolioAnalytics(transactions, MARKET_PRICE_BY_SYMBOL);
  }, [transactions]);

  const refreshPortfolioState = (portfolioId = selectedPortfolioId) => {
    const nextPortfolios = listPortfolios();
    setPortfolios(nextPortfolios);
    setSelectedPortfolioId(portfolioId);
    setTransactions(listTransactions(portfolioId));
  };

  const addPortfolio = (event) => {
    event.preventDefault();
    if (!portfolioName.trim()) return;

    const portfolio = createPortfolio(portfolioName.trim());
    setPortfolioName('');
    refreshPortfolioState(portfolio.id);
  };

  const removeSelectedPortfolio = () => {
    if (!selectedPortfolio) return;

    deletePortfolio(selectedPortfolio.id);
    const nextPortfolios = listPortfolios();
    refreshPortfolioState(nextPortfolios[0]?.id);
  };

  const submitTransaction = (payload) => {
    if (!selectedPortfolio) return;

    try {
      addTransaction({ ...payload, portfolioId: selectedPortfolio.id });
      setFormError('');
      setTransactions(listTransactions(selectedPortfolio.id));
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Transactions, holdings, allocation, and returns.</p>
        </div>
        <form onSubmit={addPortfolio} className="flex gap-2">
          <input value={portfolioName} onChange={(event) => setPortfolioName(event.target.value)} className="rounded-lg bg-white px-3 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 dark:bg-dark-card dark:ring-dark-border" placeholder="New portfolio" />
          <button className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600">Create</button>
        </form>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WalletCards className="h-5 w-5 text-brand-500" />
            <select value={selectedPortfolio?.id ?? ''} onChange={(event) => refreshPortfolioState(event.target.value)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold outline-none dark:bg-slate-800">
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
              ))}
            </select>
          </div>
          <button onClick={removeSelectedPortfolio} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-trade-red dark:hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Total Value" value={currencyFormatter.format(analytics.totalValue)} />
        <MetricCard label="Invested" value={currencyFormatter.format(analytics.investedValue)} />
        <MetricCard label="Profit / Loss" value={currencyFormatter.format(analytics.profitLoss)} tone={analytics.profitLoss >= 0 ? 'positive' : 'negative'} />
        <MetricCard label="Return" value={`${analytics.returnPercent.toFixed(2)}%`} tone={analytics.returnPercent >= 0 ? 'positive' : 'negative'} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="glass rounded-2xl p-5 xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Performance</h2>
          <PerformanceChart data={analytics.performance} />
        </section>
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-lg font-bold">Sector Allocation</h2>
          <AllocationDonut allocation={analytics.sectorAllocation} />
        </section>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-bold">Add Buy / Sell Transaction</h2>
        {formError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {formError}
          </div>
        )}
        <TransactionForm onSubmit={submitTransaction} />
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-bold">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3">Symbol</th>
                <th>Sector</th>
                <th>Qty</th>
                <th>Avg Cost</th>
                <th>Price</th>
                <th>Value</th>
                <th>P/L</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {analytics.holdings.map((holding) => (
                <tr key={holding.symbol} className="border-t border-slate-100 dark:border-dark-border">
                  <td className="py-3 font-bold">{holding.symbol}</td>
                  <td>{holding.sector}</td>
                  <td>{numberFormatter.format(holding.quantity)}</td>
                  <td>{currencyFormatter.format(holding.averageCost)}</td>
                  <td>{currencyFormatter.format(holding.currentPrice)}</td>
                  <td>{currencyFormatter.format(holding.marketValue)}</td>
                  <td className={holding.unrealizedPnl >= 0 ? 'text-trade-green' : 'text-trade-red'}>{currencyFormatter.format(holding.unrealizedPnl)}</td>
                  <td className={holding.returnPercent >= 0 ? 'text-trade-green' : 'text-trade-red'}>{holding.returnPercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const toneClass = tone === 'positive'
    ? 'text-trade-green'
    : tone === 'negative'
      ? 'text-trade-red'
      : 'text-slate-900 dark:text-slate-100';

  return (
    <div className="glass rounded-2xl p-5">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
