import {
  STOCK_SYMBOLS,
  generateHistoricalData,
  generateIntradayData,
  searchStocks as searchMockStocks,
  subscribeToRealTime
} from './mockDataEngine';

export const TIME_RANGES = {
  '1D': { label: '1D', days: 1, finnhubResolution: '5', alphaInterval: '5min' },
  '1W': { label: '1W', days: 7, finnhubResolution: '30', alphaInterval: '30min' },
  '1M': { label: '1M', days: 30, finnhubResolution: 'D' },
  '1Y': { label: '1Y', days: 365, finnhubResolution: 'D' }
};

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

function getApiConfig() {
  const finnhubKey = import.meta.env.VITE_FINNHUB_API_KEY?.trim();
  const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY?.trim();
  const requestedProvider = import.meta.env.VITE_STOCK_API_PROVIDER?.trim().toLowerCase();

  if (requestedProvider === 'finnhub' && finnhubKey) {
    return { provider: 'finnhub', apiKey: finnhubKey, label: 'Finnhub' };
  }

  if (requestedProvider === 'alphavantage' && alphaVantageKey) {
    return { provider: 'alphavantage', apiKey: alphaVantageKey, label: 'Alpha Vantage' };
  }

  if (!requestedProvider && finnhubKey) {
    return { provider: 'finnhub', apiKey: finnhubKey, label: 'Finnhub' };
  }

  if (!requestedProvider && alphaVantageKey) {
    return { provider: 'alphavantage', apiKey: alphaVantageKey, label: 'Alpha Vantage' };
  }

  return { provider: 'mock', apiKey: null, label: 'Mock market data' };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDailyTime(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function getMockHistory(symbol, range) {
  if (range === '1D') {
    return generateIntradayData(symbol, 78);
  }

  return generateHistoricalData(symbol, TIME_RANGES[range]?.days ?? 200);
}

function getMockSnapshot(symbol, range) {
  const history = getMockHistory(symbol, range);
  const latest = history.at(-1);
  const previous = history.at(-2);
  const previousClose = previous?.close ?? latest?.close ?? 0;
  const currentPrice = latest?.close ?? null;
  const changeValue = currentPrice === null ? 0 : currentPrice - previousClose;

  return {
    history,
    quote: {
      currentPrice,
      previousClose,
      changeValue,
      changePercent: previousClose ? changeValue / previousClose * 100 : 0,
      volume: latest?.volume ?? null
    },
    source: {
      provider: 'mock',
      label: 'Mock market data',
      isMock: true
    }
  };
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchFinnhubHistory(symbol, range, apiKey, signal) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - (TIME_RANGES[range]?.days ?? 365) * 24 * 60 * 60;
  const resolution = TIME_RANGES[range]?.finnhubResolution ?? 'D';
  const params = new URLSearchParams({
    symbol,
    resolution,
    from: String(from),
    to: String(now),
    token: apiKey
  });
  const payload = await fetchJson(`${FINNHUB_BASE_URL}/stock/candle?${params}`, signal);

  if (payload.s !== 'ok' || !Array.isArray(payload.t)) {
    throw new Error(payload.s === 'no_data' ? 'No candle data returned' : 'Invalid candle response');
  }

  return payload.t.map((time, index) => ({
    time: resolution === 'D' ? normalizeDailyTime(time) : time,
    open: toNumber(payload.o[index]),
    high: toNumber(payload.h[index]),
    low: toNumber(payload.l[index]),
    close: toNumber(payload.c[index]),
    volume: toNumber(payload.v[index])
  })).filter(item => {
    return item.open !== null && item.high !== null && item.low !== null && item.close !== null;
  });
}

async function fetchFinnhubQuote(symbol, apiKey, signal) {
  const params = new URLSearchParams({ symbol, token: apiKey });
  const quote = await fetchJson(`${FINNHUB_BASE_URL}/quote?${params}`, signal);
  const currentPrice = toNumber(quote.c);
  const previousClose = toNumber(quote.pc);
  const changeValue = toNumber(quote.d);
  const changePercent = toNumber(quote.dp);

  if (currentPrice === null) {
    throw new Error('Invalid quote response');
  }

  return {
    currentPrice,
    previousClose,
    changeValue: changeValue ?? currentPrice - (previousClose ?? currentPrice),
    changePercent: changePercent ?? 0,
    volume: null
  };
}

function parseAlphaSeries(payload, range) {
  const timeSeriesKey = Object.keys(payload).find(key => key.startsWith('Time Series'));
  const series = timeSeriesKey ? payload[timeSeriesKey] : null;

  if (!series) {
    throw new Error(payload.Note || payload.Information || payload['Error Message'] || 'Invalid Alpha Vantage response');
  }

  return Object.entries(series)
    .slice(0, range === '1D' ? 78 : 260)
    .map(([time, values]) => ({
      time: time.includes(' ') ? Math.floor(new Date(`${time}Z`).getTime() / 1000) : time,
      open: toNumber(values['1. open']),
      high: toNumber(values['2. high']),
      low: toNumber(values['3. low']),
      close: toNumber(values['4. close']),
      volume: toNumber(values['5. volume'])
    }))
    .filter(item => item.open !== null && item.high !== null && item.low !== null && item.close !== null)
    .reverse();
}

async function fetchAlphaHistory(symbol, range, apiKey, signal) {
  const params = new URLSearchParams({
    symbol,
    apikey: apiKey,
    outputsize: range === '1Y' ? 'full' : 'compact'
  });

  if (range === '1D' || range === '1W') {
    params.set('function', 'TIME_SERIES_INTRADAY');
    params.set('interval', TIME_RANGES[range]?.alphaInterval ?? '5min');
  } else {
    params.set('function', 'TIME_SERIES_DAILY');
  }

  const payload = await fetchJson(`${ALPHA_VANTAGE_BASE_URL}?${params}`, signal);
  return parseAlphaSeries(payload, range);
}

async function fetchAlphaQuote(symbol, apiKey, signal) {
  const params = new URLSearchParams({
    function: 'GLOBAL_QUOTE',
    symbol,
    apikey: apiKey
  });
  const payload = await fetchJson(`${ALPHA_VANTAGE_BASE_URL}?${params}`, signal);
  const quote = payload['Global Quote'];

  if (!quote || Object.keys(quote).length === 0) {
    throw new Error(payload.Note || payload.Information || payload['Error Message'] || 'Invalid quote response');
  }

  const currentPrice = toNumber(quote['05. price']);
  const previousClose = toNumber(quote['08. previous close']);
  const changeValue = toNumber(quote['09. change']);
  const changePercent = toNumber(String(quote['10. change percent']).replace('%', ''));

  return {
    currentPrice,
    previousClose,
    changeValue: changeValue ?? currentPrice - (previousClose ?? currentPrice),
    changePercent: changePercent ?? 0,
    volume: toNumber(quote['06. volume'])
  };
}

function mergeSnapshot(history, quote, source) {
  const latest = history.at(-1);
  const previous = history.at(-2);
  const currentPrice = quote?.currentPrice ?? latest?.close ?? null;
  const previousClose = quote?.previousClose ?? previous?.close ?? latest?.close ?? 0;
  const changeValue = quote?.changeValue ?? (currentPrice === null ? 0 : currentPrice - previousClose);
  const changePercent = quote?.changePercent ?? (previousClose ? changeValue / previousClose * 100 : 0);

  return {
    history,
    quote: {
      currentPrice,
      previousClose,
      changeValue,
      changePercent,
      volume: quote?.volume ?? latest?.volume ?? null
    },
    source
  };
}

export async function fetchStockSnapshot(symbol, range = '1D', signal) {
  const config = getApiConfig();

  if (config.provider === 'mock') {
    return getMockSnapshot(symbol, range);
  }

  try {
    if (config.provider === 'finnhub') {
      const [history, quote] = await Promise.all([
        fetchFinnhubHistory(symbol, range, config.apiKey, signal),
        fetchFinnhubQuote(symbol, config.apiKey, signal)
      ]);
      return mergeSnapshot(history, quote, { ...config, isMock: false });
    }

    const [history, quote] = await Promise.all([
      fetchAlphaHistory(symbol, range, config.apiKey, signal),
      fetchAlphaQuote(symbol, config.apiKey, signal)
    ]);
    return mergeSnapshot(history, quote, { ...config, isMock: false });
  } catch (error) {
    const fallback = getMockSnapshot(symbol, range);
    return {
      ...fallback,
      source: {
        ...fallback.source,
        fallbackReason: error.message,
        attemptedProvider: config.label
      }
    };
  }
}

export async function searchStocks(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const config = getApiConfig();

  try {
    if (config.provider === 'finnhub') {
      const params = new URLSearchParams({ q: trimmedQuery, token: config.apiKey });
      const payload = await fetchJson(`${FINNHUB_BASE_URL}/search?${params}`);
      return (payload.result ?? []).slice(0, 8).map(item => ({
        symbol: item.symbol,
        name: item.description || item.displaySymbol || item.symbol
      }));
    }

    if (config.provider === 'alphavantage') {
      const params = new URLSearchParams({
        function: 'SYMBOL_SEARCH',
        keywords: trimmedQuery,
        apikey: config.apiKey
      });
      const payload = await fetchJson(`${ALPHA_VANTAGE_BASE_URL}?${params}`);
      return (payload.bestMatches ?? []).slice(0, 8).map(item => ({
        symbol: item['1. symbol'],
        name: item['2. name']
      }));
    }
  } catch {
    return searchMockStocks(trimmedQuery);
  }

  return searchMockStocks(trimmedQuery);
}

export function subscribeToPriceUpdates(symbol, currentPrice, source, callback) {
  if (!symbol || !currentPrice) {
    return () => {};
  }

  if (source?.provider !== 'mock') {
    return () => {};
  }

  return subscribeToRealTime(symbol, currentPrice, callback);
}

export function getKnownStocks() {
  return STOCK_SYMBOLS;
}
