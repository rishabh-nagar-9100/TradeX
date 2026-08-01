/**
 * Sentinel AI Quantitative API Client Service for TradeX.
 * Connects to Sentinel REST server (http://localhost:8000) with fallback resilience.
 *
 * Supports three signal states:
 * - "ready": Pre-computed signal fetched from Supabase (<50ms).
 * - "queued": Background ingestion dispatched; polls until ready.
 * - "fallback": Sentinel backend offline; uses deterministic mock.
 */

const BASE_URL =
  import.meta.env.VITE_SENTINEL_API_URL || 'http://127.0.0.1:8000';

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds when queued
const MAX_POLL_ATTEMPTS = 20;  // Give up after ~60 seconds

/**
 * Deterministic mock fallback sentiment when Sentinel backend is offline.
 */
function getMockSentiment(ticker) {
  const symbol = (ticker || 'AAPL').toUpperCase();
  const hash = symbol
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = ((hash % 100) - 40) / 100; // score between -0.40 and +0.60

  return {
    ticker: symbol,
    date: new Date().toISOString().split('T')[0],
    sentiment_score: Number(score.toFixed(2)),
    confidence: 0.88,
    topic_flags: {
      guidance_cut: score < 0,
      litigation: false,
      supply_chain_risk: hash % 2 === 0,
      regulatory_action: false,
      restructuring: false,
    },
    n_documents: 3,
    model_name: 'finbert',
    status: 'fallback',
    is_fallback: true,
  };
}

/**
 * Internal: single fetch to the sentiment API.
 */
async function _fetchSentimentOnce(symbol) {
  const res = await fetch(`${BASE_URL}/api/sentiment/${symbol}`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.json();
}

/**
 * Fetch latest point-in-time sentiment signal for a ticker.
 * Automatically polls when status is "queued" (background ingestion in progress).
 *
 * @param {string} ticker - Stock ticker symbol
 * @param {function} [onStatusChange] - Optional callback fired with status updates ("queued", "ready")
 * @returns {Promise<object>} Sentiment signal data
 */
export async function fetchSentiment(ticker, onStatusChange) {
  const symbol = (ticker || 'AAPL').toUpperCase();

  try {
    let data = await _fetchSentimentOnce(symbol);

    // If signal is queued, poll until ready
    if (data.status === 'queued') {
      if (onStatusChange) onStatusChange('queued');

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        data = await _fetchSentimentOnce(symbol);

        if (data.status !== 'queued') {
          break;
        }
      }
    }

    if (onStatusChange) onStatusChange(data.status || 'ready');
    return { ...data, is_fallback: data.status === 'fallback' };
  } catch (err) {
    console.warn(
      `Sentinel API offline for ${symbol}, using fallback sentiment:`,
      err.message
    );
    if (onStatusChange) onStatusChange('fallback');
    return getMockSentiment(symbol);
  }
}

/**
 * Request walk-forward backtest analytics from Sentinel backend.
 */
export async function fetchBacktest(ticker, options = {}) {
  const symbol = (ticker || 'AAPL').toUpperCase();
  const payload = {
    tickers: [symbol],
    start_date: options.startDate || '2024-01-01',
    end_date: options.endDate || '2024-01-31',
    model: options.model || 'vader',
    horizon: options.horizon || '1d',
    n_folds: options.folds || 3,
  };

  try {
    const res = await fetch(`${BASE_URL}/api/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(
      `Sentinel Backtest API offline for ${symbol}, using mock payload:`,
      err.message
    );
    return {
      sharpe_ratio: 1.03,
      annualized_return: 7.45,
      max_drawdown: 2.91,
      win_rate: 62.5,
      ic: -0.01,
      ic_p_value: 0.9392,
      statistically_significant: false,
      outperformed_buy_and_hold: false,
      outperformed_random: true,
      report_html_path: `${BASE_URL}/api/report/html`,
      is_fallback: true,
    };
  }
}

/**
 * Get interactive HTML report URL.
 */
export function getReportHtmlUrl() {
  return `${BASE_URL}/api/report/html`;
}
