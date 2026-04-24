# 🚀 TradeX: Real-Time Stock Market Dashboard

TradeX is a production-grade, real-time stock market dashboard built with React. It simulates a modern trading platform (like Zerodha, Groww, or TradingView) featuring advanced interactive charts, smooth animations, and a premium Glassmorphism UI.

## ✨ Features

- **Real-Time Mock Data Engine**: Simulates live tick-by-tick market fluctuations natively, without hitting API rate limits.
- **Advanced Interactive Charting**: Uses TradingView's `lightweight-charts` to provide highly optimized candlestick charts with time scales.
- **Watchlist Management**: Add or remove favorite stocks, managed globally using Context API and persisted via `localStorage`.
- **Search Autocomplete**: Debounced search input that queries available assets in real-time.
- **Premium UI / UX**: A highly responsive layout built with Tailwind CSS, supporting seamless Dark/Light Mode toggling and micro-animations (fade-ins, hover states).
- **Graceful Loading States**: Beautiful skeleton loaders for async data resolution to maintain layout stability.

## 🧠 Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v3
- **Icons**: `lucide-react`
- **Charting**: `lightweight-charts`
- **State Management**: React Context + Hooks (`useState`, `useEffect`, `useRef`)

## ⚙️ Setup Instructions

To run this project locally:

1. **Navigate to the directory**:
   ```bash
   cd stock-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔑 Optional Real Market Data

The dashboard works without credentials by using deterministic mock data. To fetch live provider data, create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then choose one provider:

```bash
VITE_STOCK_API_PROVIDER=finnhub
VITE_FINNHUB_API_KEY=your_key_here
```

or:

```bash
VITE_STOCK_API_PROVIDER=alphavantage
VITE_ALPHA_VANTAGE_API_KEY=your_key_here
```

Restart `npm run dev` after changing `.env`.

> Production note: Vite environment variables are bundled into the browser. For real production use, call these APIs through a backend or serverless proxy so API keys are not exposed to users.

## 📡 API Details

This project uses a provider-aware data service (`src/services/stockDataService.js`). It supports Finnhub, Alpha Vantage, and a Custom **Mock Data Engine** (`src/services/mockDataEngine.js`) fallback to prevent free-tier rate limits from breaking the app.

- **Historical Data Simulation**: Calculates a stable random-walk based on the stock symbol hash, outputting 200 days of history on initial load.
- **Real-Time Streaming**: Dispatches Web-Socket-style updates via `setInterval` every 2 seconds to simulate live ticker changes.
- **Debounced Searching**: Fakes network latency for autocomplete searches to simulate a real REST endpoint.

## 🏗 Directory Structure

- `src/components/charts/` - Interactive chart wrappers.
- `src/components/dashboard/` - Main views (Watchlist, Stats).
- `src/components/layout/` - Sidebar, Topbar, Main template.
- `src/components/search/` - Search autocomplete.
- `src/context/` - Global Theme and Watchlist providers.
- `src/hooks/` - `useStockData` for real-time synchronization.

> Designed with ❤️ to showcase advanced frontend engineering.
