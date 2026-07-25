import { useSentinelData } from '../../hooks/useSentinelData';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Scale,
  Truck,
  Building2,
  ShieldAlert,
  FileText,
  RefreshCw,
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

export default function SentinelSentimentWidget({ activeStock }) {
  const { sentiment, loading, refetch } = useSentinelData(activeStock);

  if (loading) {
    return (
      <div className="glass mb-6 rounded-2xl p-4 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700/50 rounded mb-3"></div>
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  const score = sentiment?.sentiment_score ?? 0;
  const confidence = Math.round((sentiment?.confidence ?? 0.85) * 100);
  const modelName = (sentiment?.model_name || 'FinBERT').toUpperCase();
  const docCount = sentiment?.n_documents ?? 0;
  const isFallback = sentiment?.is_fallback ?? false;

  let badgeColor = 'bg-slate-500/10 text-slate-500 border-slate-500/30';
  let badgeLabel = 'Neutral';
  let ScoreIcon = Minus;

  if (score > 0.1) {
    badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    badgeLabel = `Bullish (+${score.toFixed(2)})`;
    ScoreIcon = TrendingUp;
  } else if (score < -0.1) {
    badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    badgeLabel = `Bearish (${score.toFixed(2)})`;
    ScoreIcon = TrendingDown;
  }

  // Calculate percentage offset for slider indicator (-1 to 1 -> 0% to 100%)
  const percentage = Math.min(100, Math.max(0, ((score + 1) / 2) * 100));

  const activeTopics = Object.entries(sentiment?.topic_flags || {})
    .filter(([_, active]) => active)
    .map(([key]) => TOPIC_CONFIG[key])
    .filter(Boolean);

  return (
    <div className="glass mb-6 rounded-2xl p-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Sentinel AI Quant Intelligence</h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {modelName}
              </span>
              {isFallback && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Point-in-Time Form 8-K & News Sentiment for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {activeStock}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={refetch}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Re-fetch Sentinel Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Sentiment Gauge Pill */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Sentiment Score
          </span>
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-sm ${badgeColor}`}
          >
            <ScoreIcon className="w-4 h-4" />
            <span>{badgeLabel}</span>
          </div>
        </div>

        {/* Polarity Slider & Confidence */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Polarity Gauge</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Confidence: {confidence}%
            </span>
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

        {/* Ingestion & Topic Badges */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Analyzed Sources ({docCount} docs)
          </span>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
            {activeTopics.length > 0 ? (
              activeTopics.map((topic) => (
                <span
                  key={topic.label}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-medium ${topic.color}`}
                >
                  <topic.icon className="w-3 h-3" />
                  {topic.label}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                No topic risk flags detected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
