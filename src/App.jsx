import { useState } from 'react';
import { BarChart3, CandlestickChart, CircleDollarSign, RefreshCw, ShieldCheck } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider } from './context/WatchlistContext';
import DashboardLayout from './components/layout/DashboardLayout';
import StockQuickStats from './components/dashboard/StockQuickStats';
import Watchlist from './components/dashboard/Watchlist';
import StockChart from './components/charts/StockChart';
import { useStockData } from './hooks/useStockData';
import { TIME_RANGES, getKnownStocks } from './services/stockDataService';
import { useWatchlist } from './context/watchlistStore';

const CHART_TYPES = [
  { id: 'candlestick', label: 'Candles', icon: CandlestickChart },
  { id: 'line', label: 'Line', icon: BarChart3 }
];

function DashboardContent({ activeStock, onSelectStock }) {
  const [timeRange, setTimeRange] = useState('1D');
  const [chartType, setChartType] = useState('candlestick');
  const {
    historicalData,
    currentPrice,
    priceChange,
    volume,
    loading,
    error,
    dataSource,
    lastUpdated,
    refresh
  } = useStockData(activeStock, timeRange);

  return (
    <div className="flex flex-col h-full fade-in">
      <StockQuickStats 
        symbol={activeStock} 
        currentPrice={currentPrice} 
        priceChange={priceChange} 
        volume={volume}
        dataSource={dataSource}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        loading={loading} 
      />

      {dataSource?.fallbackReason && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {dataSource.attemptedProvider} did not return usable data, so the dashboard is showing mock market data. Reason: {dataSource.fallbackReason}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        <div className="lg:col-span-3 glass rounded-2xl p-4 flex flex-col relative h-[500px] lg:h-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
             <h3 className="font-bold text-lg">Price Chart</h3>
             <div className="flex flex-wrap items-center gap-2">
               <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   {Object.keys(TIME_RANGES).map(t => (
                     <button
                       key={t}
                       onClick={() => setTimeRange(t)}
                       className={`px-3 py-1 text-sm rounded-md font-medium ${t === timeRange ? 'bg-white dark:bg-dark-card shadow-sm' : 'text-slate-500'}`}
                     >
                       {t}
                     </button>
                   ))}
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                 {CHART_TYPES.map(type => (
                   <button
                     key={type.id}
                     onClick={() => setChartType(type.id)}
                     className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-md font-medium ${type.id === chartType ? 'bg-white dark:bg-dark-card shadow-sm' : 'text-slate-500'}`}
                   >
                     <type.icon className="w-4 h-4" />
                     {type.label}
                   </button>
                 ))}
               </div>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {loading ? (
               <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-xl"></div>
            ) : (
               <StockChart data={historicalData} type={chartType} />
            )}
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4 flex flex-col h-[500px] lg:h-auto">
          <Watchlist selectedSymbol={activeStock} onSelect={onSelectStock} />
        </div>
      </div>
    </div>
  );
}

function PortfolioView({ onSelectStock }) {
  const { watchlist } = useWatchlist();
  const symbols = watchlist.length ? watchlist : ['AAPL', 'MSFT'];

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track watched assets and jump back into analysis.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <span className="text-sm text-slate-500 dark:text-slate-400">Tracked Symbols</span>
          <div className="mt-2 text-3xl font-semibold">{symbols.length}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <span className="text-sm text-slate-500 dark:text-slate-400">Data Mode</span>
          <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            Auto fallback
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <span className="text-sm text-slate-500 dark:text-slate-400">Refresh</span>
          <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <RefreshCw className="w-5 h-5 text-brand-500" />
            Manual + mock ticks
          </div>
        </div>
      </div>
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Holdings Watch</h2>
          <CircleDollarSign className="w-5 h-5 text-brand-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {symbols.map(symbol => (
            <button
              key={symbol}
              onClick={() => onSelectStock(symbol)}
              className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-brand-500 dark:border-dark-border dark:bg-dark-card"
            >
              <span className="font-bold">{symbol}</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Open dashboard analysis</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WatchlistView({ activeStock, onSelectStock }) {
  return (
    <div className="fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search any supported symbol from the top bar, star it, and manage it here.</p>
      </div>
      <div className="glass rounded-2xl p-4 h-[600px] lg:col-span-3">
        <Watchlist selectedSymbol={activeStock} onSelect={onSelectStock} />
      </div>
    </div>
  );
}

function MarketsView({ onSelectStock }) {
  const stocks = getKnownStocks();

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Quick access to the default market universe. Real provider search expands this list.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {stocks.map(stock => (
          <button
            key={stock.symbol}
            onClick={() => onSelectStock(stock.symbol)}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-brand-500 dark:border-dark-border dark:bg-dark-card"
          >
            <span className="font-bold">{stock.symbol}</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400">{stock.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="fade-in max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure market data through Vite environment variables.</p>
      </div>
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-bold">Real data setup</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add one provider key to a local .env file, then restart the dev server.
          </p>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">{`VITE_STOCK_API_PROVIDER=finnhub
VITE_FINNHUB_API_KEY=your_key_here

# or
VITE_STOCK_API_PROVIDER=alphavantage
VITE_ALPHA_VANTAGE_API_KEY=your_key_here`}</pre>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Frontend VITE variables are visible in the browser. For a production deployment, put keys behind a serverless proxy or backend API.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [activeStock, setActiveStock] = useState('AAPL');
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSelectStock = (symbol) => {
    setActiveStock(symbol);
    setActiveView('dashboard');
    setMobileNavOpen(false);
  };

  const renderView = () => {
    if (activeView === 'portfolio') {
      return <PortfolioView onSelectStock={handleSelectStock} />;
    }

    if (activeView === 'watchlist') {
      return <WatchlistView activeStock={activeStock} onSelectStock={handleSelectStock} />;
    }

    if (activeView === 'markets') {
      return <MarketsView onSelectStock={handleSelectStock} />;
    }

    if (activeView === 'settings') {
      return <SettingsView />;
    }

    return <DashboardContent activeStock={activeStock} onSelectStock={handleSelectStock} />;
  };

  return (
    <ThemeProvider>
      <WatchlistProvider>
        <DashboardLayout
          activeView={activeView}
          onViewChange={setActiveView}
          onSearch={handleSelectStock}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen(open => !open)}
          onCloseMobileNav={() => setMobileNavOpen(false)}
        >
          {renderView()}
        </DashboardLayout>
      </WatchlistProvider>
    </ThemeProvider>
  );
}

export default App;
