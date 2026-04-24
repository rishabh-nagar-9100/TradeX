import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchStocks } from '../../services/stockDataService';

export default function SearchAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return undefined;
    }

    const fetchResults = async () => {
      const res = await searchStocks(trimmedQuery);
      if (!cancelled) {
        setResults(res);
      }
    };
    
    // Debounce
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);
    
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const visibleResults = query.trim() ? results : [];

  return (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search stocks (e.g., AAPL) ..." 
        className="w-full bg-slate-100 dark:bg-slate-800 text-sm border-none rounded-full pl-10 pr-9 py-2 focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-shadow"
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {isFocused && visibleResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg overflow-hidden z-50">
          {visibleResults.map((item) => (
            <button
              key={item.symbol}
              onClick={() => {
                onSelect(item.symbol);
                setQuery('');
                setIsFocused(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors cursor-pointer border-b border-slate-100 dark:border-dark-border/50 last:border-0"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.symbol}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
