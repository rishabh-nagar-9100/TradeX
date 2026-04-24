import { useWatchlist } from '../../context/watchlistStore';
import { useStockData } from '../../hooks/useStockData';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

function WatchlistItem({ symbol, onRemove, onSelect, selected }) {
  const { currentPrice, priceChange, loading } = useStockData(symbol, '1D');
  
  if (loading || currentPrice === null) {
    return (
      <div className="flex items-center justify-between p-3 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
      </div>
    );
  }

  const isPositive = priceChange.value >= 0;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg group transition-colors ${selected ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => onRemove(symbol)}
          aria-label={`Remove ${symbol}`}
          className="text-slate-400 md:opacity-0 group-hover:opacity-100 transition-opacity hover:text-trade-red"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelect(symbol)}
          className="font-bold text-slate-900 dark:text-slate-100 truncate hover:text-brand-600 dark:hover:text-brand-500"
        >
          {symbol}
        </button>
      </div>
      <div className="text-right">
        <div className="font-medium text-slate-900 dark:text-slate-100">${currentPrice}</div>
        <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-trade-green' : 'text-trade-red'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(priceChange.percent).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist({ selectedSymbol, onSelect }) {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Watchlist</h2>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
          {watchlist.length} items
        </span>
      </div>
      
      {watchlist.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No stocks in watchlist. Search to add some!
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-1">
          {watchlist.map(symbol => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              selected={symbol === selectedSymbol}
              onSelect={onSelect}
              onRemove={removeFromWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
