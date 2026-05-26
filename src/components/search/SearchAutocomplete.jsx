import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, CornerDownLeft, Loader2 } from 'lucide-react';
import { searchStocks } from '../../services/stockDataService';

export default function SearchAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const blurTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setIsSearching(false);
      return undefined;
    }

    const fetchResults = async () => {
      try {
        setIsSearching(true);
        const res = await searchStocks(trimmedQuery);

        if (!cancelled) {
          setResults(res);
          setHighlightedIndex(0);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
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

  const trimmedQuery = query.trim();
  const directSymbol = useMemo(() => {
    const normalized = trimmedQuery.toUpperCase();
    return /^[A-Z][A-Z0-9.-]{0,9}$/.test(normalized) ? normalized : null;
  }, [trimmedQuery]);

  const visibleResults = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const alreadyIncluded = directSymbol && results.some(item => item.symbol === directSymbol);
    const directResult = directSymbol && !alreadyIncluded
      ? [{ symbol: directSymbol, name: 'Use typed symbol' }]
      : [];

    return [...results, ...directResult].slice(0, 8);
  }, [directSymbol, results, trimmedQuery]);

  const showDropdown = isFocused && trimmedQuery;

  const selectStock = (symbol) => {
    onSelect(symbol);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  const handleQueryChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setResults([]);
      setHighlightedIndex(0);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && visibleResults.length > 0) {
      event.preventDefault();
      setHighlightedIndex(index => Math.min(index + 1, visibleResults.length - 1));
    }

    if (event.key === 'ArrowUp' && visibleResults.length > 0) {
      event.preventDefault();
      setHighlightedIndex(index => Math.max(index - 1, 0));
    }

    if (event.key === 'Enter') {
      const selected = visibleResults[highlightedIndex] ?? visibleResults[0];

      if (selected) {
        event.preventDefault();
        selectStock(selected.symbol);
      }
    }

    if (event.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => setIsFocused(false), 150);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }

    setIsFocused(true);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input 
        type="text" 
        value={query}
        onChange={handleQueryChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search stocks (e.g., AAPL) ..." 
        aria-label="Search stocks"
        aria-expanded={Boolean(showDropdown)}
        className="w-full bg-slate-100 dark:bg-slate-800 text-sm border-none rounded-full pl-10 pr-9 py-2 focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-shadow"
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setResults([]);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg overflow-hidden z-50">
          {isSearching && visibleResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : visibleResults.length > 0 ? (
            visibleResults.map((item, index) => (
              <button
                key={`${item.symbol}-${item.name}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectStock(item.symbol);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer border-b border-slate-100 dark:border-dark-border/50 last:border-0 ${
                  index === highlightedIndex
                    ? 'bg-slate-50 dark:bg-slate-800/70'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{item.symbol}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{item.name}</span>
                </div>
                {index === highlightedIndex && <CornerDownLeft className="w-4 h-4 flex-shrink-0 text-slate-400" />}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matching stocks found.
            </div>
          )}

          {visibleResults.length > 0 && (
            <div className="px-4 py-2 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900/40">
              Press Enter to open the highlighted symbol.
            </div>
          )}
              </div>
      )}
    </div>
  );
}
