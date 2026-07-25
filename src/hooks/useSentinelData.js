/**
 * React synchronization hook for Sentinel AI Sentiment and Quant Analytics.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSentiment, fetchBacktest } from '../services/sentinelService';

export function useSentinelData(ticker) {
  const [sentiment, setSentiment] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);

    try {
      const [sentRes, btRes] = await Promise.all([
        fetchSentiment(ticker),
        fetchBacktest(ticker),
      ]);
      setSentiment(sentRes);
      setBacktest(btRes);
    } catch (err) {
      console.error(`Error loading Sentinel data for ${ticker}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    sentiment,
    backtest,
    loading,
    error,
    refetch: loadData,
  };
}
