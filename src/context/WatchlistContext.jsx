import { useCallback, useEffect, useMemo, useState } from 'react';
import { WatchlistContext } from './watchlistStore';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT'];

function readSavedWatchlist() {
  try {
    const saved = localStorage.getItem('watchlist');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(readSavedWatchlist);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((symbol) => {
    setWatchlist(current => current.includes(symbol) ? current : [...current, symbol]);
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist(current => current.filter((s) => s !== symbol));
  }, []);

  const isInWatchlist = useCallback((symbol) => watchlist.includes(symbol), [watchlist]);
  const value = useMemo(() => ({
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  }), [watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
