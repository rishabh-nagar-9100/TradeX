import { useState } from 'react';
import { useSentinelData } from '../../hooks/useSentinelData';
import { getReportHtmlUrl } from '../../services/sentinelService';
import {
  Brain,
  TrendingUp,
  Activity,
  Percent,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  Award,
  AlertTriangle,
  Scale,
  Truck,
  Building2,
  ShieldAlert,
  Layers,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';

const TOPIC_CONFIG = {
  guidance_cut: {
    label: 'Guidance Cut',
    icon: AlertTriangle,
    color: 'border-red-500/30 bg-red-500/10 text-red-500',
  },
  litigation: {
    label: 'Litigation Risk',
    icon: Scale,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  },
  supply_chain_risk: {
    label: 'Supply Chain Risk',
    icon: Truck,
    color: 'border-orange-500/30 bg-orange-500/10 text-orange-500',
  },
  regulatory_action: {
    label: 'Regulatory Action',
    icon: ShieldAlert,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-500',
  },
  restructuring: {
    label: 'Restructuring',
    icon: Building2,
    color: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
  },
};

export default function SentinelView({ activeStock }) {
  const [activeTab, setActiveTab] = useState('sentiment');
  const { sentiment, backtest, loading, refetch } = useSentinelData(activeStock);

  const score = sentiment?.sentiment_score ?? 0;
  const confidence = Math.round((sentiment?.confidence ?? 0.85) * 100);
  const modelName = (sentiment?.model_name || 'FinBERT').toUpperCase();
  const docCount = sentiment?.n_documents ?? 0;
  const isFallback = sentiment?.is_fallback ?? false;

  const sharpe = backtest?.sharpe_ratio ?? 1.03;
  const annReturn = backtest?.annualized_return ?? 7.45;
  const maxDrawdown = backtest?.max_drawdown ?? 2.91;
  const winRate = backtest?.win_rate ?? 62.5;
  const ic = backtest?.ic ?? -0.01;
  const icPValue = backtest?.ic_p_value ?? 0.9392;
  const isSig = backtest?.statistically_significant ?? false;
  const outRandom = backtest?.outperformed_random ?? true;
  const outBuyHold = backtest?.outperformed_buy_and_hold ?? false;
  const reportUrl = getReportHtmlUrl();

  const percentage = Math.min(100, Math.max(0, ((score + 1) / 2) * 100));

  const activeTopics = Object.entries(sentiment?.topic_flags || {})
    .filter(([_, active]) => active)
    .map(([key]) => TOPIC_CONFIG[key])
    .filter(Boolean);

  return (
    <div className="fade-in space-y-6">
      {/* Header Banner */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Sentinel Quant AI Intelligence Center</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-brand-500/10 text-brand-500 border border-brand-500/20">
                {modelName}
              </span>
              {isFallback && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Point-in-Time Form 8-K & News Sentiment Engine for{' '}
              <span className="font-bold text-slate-900 dark:text-white">{activeStock}</span>
            </p>
          </div>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Signal
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-fit gap-1">
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'sentiment'
              ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          Real-Time Sentiment & Topic Risk
        </button>

        <button
          onClick={() => setActiveTab('backtest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'backtest'
              ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Walk-Forward Backtest & IC
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'report'
              ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Interactive Plotly Report
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'architecture'
              ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Input & Output Architecture
        </button>
      </div>

      {/* Tab 1: Sentiment & Topic Risk */}
      {activeTab === 'sentiment' && (
        <div className="glass rounded-2xl p-6 space-y-6 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                FinBERT Polarity Score
              </span>
              <div className="text-2xl font-extrabold text-brand-500">
                {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Range: -1.0 (Bearish) to +1.0 (Bullish)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Polarity Gauge</span>
                <span className="text-brand-500">Confidence: {confidence}%</span>
              </div>
              <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-slate-400 to-emerald-500 opacity-80" />
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-full shadow transition-all duration-300"
                  style={{ left: `calc(${percentage}% - 4px)` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-1.0 Bearish</span>
                <span>0.0 Neutral</span>
                <span>+1.0 Bullish</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Analyzed Sources
              </span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-500" />
                {docCount} Documents
              </div>
              <span className="text-xs text-slate-400 mt-1 block">SEC Form 8-K Filings & News</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              AI Topic Risk Badges (Rule-Based Detection)
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeTopics.length > 0 ? (
                activeTopics.map((topic) => (
                  <span
                    key={topic.label}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border font-semibold ${topic.color}`}
                  >
                    <topic.icon className="w-4 h-4" />
                    {topic.label}
                  </span>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                  No active risk flags detected for {activeStock}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Walk-Forward Backtest & IC */}
      {activeTab === 'backtest' && (
        <div className="glass rounded-2xl p-6 space-y-6 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-medium text-slate-400 uppercase block mb-1">Sharpe Ratio</span>
              <div className="text-2xl font-extrabold text-brand-500 flex items-center gap-1">
                <Activity className="w-5 h-5" />
                {sharpe}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-medium text-slate-400 uppercase block mb-1">Ann. Return</span>
              <div className="text-2xl font-extrabold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" />
                {annReturn}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-medium text-slate-400 uppercase block mb-1">Max Drawdown</span>
              <div className="text-2xl font-extrabold text-rose-500">{maxDrawdown}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-medium text-slate-400 uppercase block mb-1">Win Rate</span>
              <div className="text-2xl font-extrabold text-blue-500 flex items-center gap-1">
                <Percent className="w-5 h-5" />
                {winRate}%
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Spearman Rank Information Coefficient (IC) & Hypothesis Test
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Spearman Rank IC:</span>
                <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">{ic}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">p-value: {icPValue}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Statistical Significance Status:</span>
                <span className={`inline-flex items-center gap-1.5 font-semibold text-xs px-3 py-1 rounded-lg mt-1.5 ${isSig ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                  {isSig ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isSig ? 'Statistically Significant (p < 0.05)' : 'Not Significant (p >= 0.05)'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <span className="text-xs text-slate-600 dark:text-slate-300">vs. Random Signal Baseline</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 ${outRandom ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {outRandom ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {outRandom ? 'Outperformed' : 'Underperformed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <span className="text-xs text-slate-600 dark:text-slate-300">vs. Buy & Hold Index</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 ${outBuyHold ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                {outBuyHold ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {outBuyHold ? 'Outperformed' : 'Underperformed'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Plotly HTML Report */}
      {activeTab === 'report' && (
        <div className="glass rounded-2xl p-4 h-[650px] w-full overflow-hidden fade-in">
          <iframe
            src={reportUrl}
            title="Sentinel Plotly Interactive Report"
            className="w-full h-full border-0 rounded-xl"
          />
        </div>
      )}

      {/* Tab 4: System Architecture & Input/Output Flow */}
      {activeTab === 'architecture' && (
        <div className="glass rounded-2xl p-6 space-y-6 fade-in">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            Sentinel Data Pipeline & System Architecture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Database className="w-4 h-4 text-blue-500" />
                1. Inputs
              </div>
              <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                <li>SEC EDGAR Form 8-K Filings</li>
                <li>Finnhub Company News</li>
                <li>yfinance Daily Price Bars</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Cpu className="w-4 h-4 text-purple-500" />
                2. Processing
              </div>
              <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                <li>Regex Preprocessing</li>
                <li>FinBERT Transformers</li>
                <li>Rule-Based Topic Tagger</li>
                <li>Daily Signal Aggregator</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-emerald-500" />
                3. Point-in-Time Store
              </div>
              <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                <li>Parquet Point-in-Time Store</li>
                <li>published_at &lt;= as_of</li>
                <li>Market Open Execution</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Activity className="w-4 h-4 text-amber-500" />
                4. Outputs
              </div>
              <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                <li>Sharpe Ratio &amp; IC Metrics</li>
                <li>Topic Risk Flags</li>
                <li>FastAPI REST Endpoints</li>
                <li>TradeX Glassmorphic UI</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
