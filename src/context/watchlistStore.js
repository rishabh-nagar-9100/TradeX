import { createContext, useContext } from 'react';

export const WatchlistContext = createContext(null);

export function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }

  return context;
}
