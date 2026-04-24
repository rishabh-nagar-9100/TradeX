import { useWatchlist } from '../../context/watchlistStore';
import { Star, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

export default function StockQuickStats({
  symbol,
  currentPrice,
  priceChange,
  volume,
  loading,
  dataSource,
  lastUpdated,
  onRefresh
}) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  if (loading || currentPrice === null) {
    return (
      <div className="glass rounded-2xl p-6 mb-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
      </div>
    );
  }

  const isPositive = priceChange.value >= 0;
  const inWatchlist = isInWatchlist(symbol);
  const formattedVolume = volume === null ? 'N/A' : `${(volume / 1_000_000).toFixed(1)}M`;
  const providerLabel = dataSource?.attemptedProvider
    ? `${dataSource.label} fallback from ${dataSource.attemptedProvider}`
    : dataSource?.label ?? 'Loading';

  return (
    <div className="glass rounded-2xl p-6 mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{symbol}</h1>
          <button 
            onClick={() => inWatchlist ? removeFromWatchlist(symbol) : addToWatchlist(symbol)}
            aria-label={inWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
            className={`p-1.5 rounded-full transition-colors ${inWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Star className="w-5 h-5" fill={inWatchlist ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="flex items-end gap-3">
          <span className="text-4xl font-light tracking-tight">${currentPrice}</span>
          <div className={`flex items-center gap-1.5 text-lg font-medium pb-1 ${isPositive ? 'text-trade-green' : 'text-trade-red'}`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{isPositive ? '+' : ''}{priceChange.value.toFixed(2)} ({isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-end justify-end gap-6 text-sm">
        <div className="flex flex-col items-end">
          <span className="text-slate-500 dark:text-slate-400 mb-1">Volume</span>
          <span className="font-semibold flex items-center gap-1">
            <Activity className="w-4 h-4 text-brand-500" />
            {formattedVolume}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-500 dark:text-slate-400 mb-1">Source</span>
          <span className="font-semibold">{providerLabel}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-500 dark:text-slate-400 mb-1">Updated</span>
          <span className="font-semibold">{lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh market data"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
