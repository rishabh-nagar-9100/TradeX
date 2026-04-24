function hashString(value) {
  return Array.from(value).reduce((hash, char) => {
    return Math.imul(31, hash) + char.charCodeAt(0) | 0;
  }, 7);
}

function createSeededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6D2B79F5;
    let result = state;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

// Generate reproducible random-walk historical data for a symbol.
export function generateHistoricalData(symbol, days = 100) {
  const data = [];
  const random = createSeededRandom(hashString(`${symbol}:${days}`));
  const symbolHash = Math.abs(hashString(symbol));
  let currentPrice = symbol.length * 50 + symbolHash % 100;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Skip weekends for daily chart reality
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const volatility = currentPrice * 0.02;
    
    const open = currentPrice + (random() - 0.5) * volatility;
    const high = Math.max(open + random() * volatility, open);
    const low = Math.min(open - random() * volatility, open);
    const close = low + random() * (high - low);
    
    currentPrice = close;
    
    data.push({
      time: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor((random() * 2_000_000) + 250_000)
    });
  }
  return data;
}

export function generateIntradayData(symbol, points = 78) {
  const data = [];
  const random = createSeededRandom(hashString(`${symbol}:intraday:${points}`));
  const symbolHash = Math.abs(hashString(symbol));
  let currentPrice = symbol.length * 50 + symbolHash % 100;
  const now = new Date();
  const intervalSeconds = 5 * 60;
  const startTime = Math.floor(now.getTime() / 1000) - (points - 1) * intervalSeconds;

  for (let i = 0; i < points; i++) {
    const volatility = currentPrice * 0.004;
    const open = currentPrice;
    const high = open + random() * volatility;
    const low = open - random() * volatility;
    const close = low + random() * (high - low);

    currentPrice = close;

    data.push({
      time: startTime + i * intervalSeconds,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor((random() * 120_000) + 15_000)
    });
  }

  return data;
}

// Subscribe to real-time mock updates
export function subscribeToRealTime(symbol, currentPrice, callback) {
  let price = currentPrice;
  
  const interval = setInterval(() => {
    const volatility = price * 0.001; // Small movements
    const change = (Math.random() - 0.48) * volatility; // slightly higher chance to go up
    price = price + change;
    
    const now = new Date();
    
    callback({
      symbol,
      price: Number(price.toFixed(2)),
      timestamp: now.getTime(),
      volume: Math.floor((Math.random() * 120_000) + 15_000)
    });
  }, 2000); 
  
  return () => clearInterval(interval);
}

export const STOCK_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
];

export async function searchStocks(query) {
  if (!query) return [];
  
  return new Promise(resolve => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      resolve(STOCK_SYMBOLS.filter(s => 
        s.symbol.toLowerCase().includes(lowerQuery) || 
        s.name.toLowerCase().includes(lowerQuery)
      ));
    }, 300); // Fake network delay
  });
}
