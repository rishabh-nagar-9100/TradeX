/**
 * React synchronization hook for Sentinel AI Sentiment and Quant Analytics.
 *
 * Tracks signal status: 'loading' | 'queued' | 'ready' | 'fallback' | 'error'
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSentiment, fetchBacktest } from '../services/sentinelService';

export function useSentinelData(ticker) {
  const [sentiment, setSentiment] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signalStatus, setSignalStatus] = useState('loading'); // 'loading' | 'queued' | 'ready' | 'fallback' | 'error'

  const loadData = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setSignalStatus('loading');

    try {
      const [sentRes, btRes] = await Promise.all([
        fetchSentiment(ticker, (status) => {
          setSignalStatus(status);
        }),
        fetchBacktest(ticker),
      ]);
      setSentiment(sentRes);
      setBacktest(btRes);

      // Set final status based on response
      const finalStatus = sentRes?.status || (sentRes?.is_fallback ? 'fallback' : 'ready');
      setSignalStatus(finalStatus);
    } catch (err) {
      console.error(`Error loading Sentinel data for ${ticker}:`, err);
      setError(err.message);
      setSignalStatus('error');
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
    signalStatus,
    refetch: loadData,
  };
}
