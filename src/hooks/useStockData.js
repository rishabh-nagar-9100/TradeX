import { useState, useEffect, useRef } from 'react';
import { fetchStockSnapshot, subscribeToPriceUpdates } from '../services/stockDataService';

export function useStockData(symbol, range = '1D') {
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState({ value: 0, percent: 0 });
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Track previous close to calculate percent change properly
  const prevCloseRef = useRef(null);

  useEffect(() => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    let isMounted = true;
    const abortController = new AbortController();
    
    const timer = setTimeout(async () => {
      if (!isMounted) return;

      try {
        const snapshot = await fetchStockSnapshot(symbol, range, abortController.signal);
        const { history, quote, source } = snapshot;

        if (!isMounted) return;

        if (!history.length || quote.currentPrice === null) {
          throw new Error('No usable price data was returned');
        }

        setHistoricalData(history);
        setCurrentPrice(quote.currentPrice);
        setVolume(quote.volume);
        setPriceChange({
          value: quote.changeValue,
          percent: quote.changePercent
        });
        setDataSource(source);
        setLastUpdated(new Date());
        prevCloseRef.current = quote.previousClose;
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setHistoricalData([]);
          setCurrentPrice(null);
          setVolume(null);
          setPriceChange({ value: 0, percent: 0 });
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 250);
      
    return () => {
      isMounted = false;
      abortController.abort();
      clearTimeout(timer);
    };
  }, [symbol, range, refreshKey]);

  useEffect(() => {
    if (!symbol || !currentPrice || loading) return;
    
    const unsubscribe = subscribeToPriceUpdates(symbol, currentPrice, dataSource, (update) => {
      setCurrentPrice(update.price);
      setVolume(update.volume);
      setLastUpdated(new Date(update.timestamp));
      setHistoricalData(currentData => {
        const latestCandle = currentData.at(-1);

        if (!latestCandle) {
          return currentData;
        }

        return [
          ...currentData.slice(0, -1),
          {
            ...latestCandle,
            close: update.price,
            high: Math.max(latestCandle.high, update.price),
            low: Math.min(latestCandle.low, update.price),
            volume: update.volume ?? latestCandle.volume
          }
        ];
      });
      
      if (prevCloseRef.current) {
        const changeVal = update.price - prevCloseRef.current;
        setPriceChange({
          value: changeVal,
          percent: (changeVal / prevCloseRef.current) * 100
        });
      }
    });
    
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, loading, dataSource]); // Exclude currentPrice to avoid resubscribing constantly

  return {
    historicalData,
    currentPrice,
    priceChange,
    volume,
    loading,
    error,
    dataSource,
    lastUpdated,
    refresh: () => setRefreshKey(key => key + 1)
  };
}
