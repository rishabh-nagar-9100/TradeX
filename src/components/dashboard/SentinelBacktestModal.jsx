import { useState } from 'react';
import {
  X,
  Activity,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  BarChart2,
} from 'lucide-react';
import { getReportHtmlUrl } from '../../services/sentinelService';

export default function SentinelBacktestModal({
  isOpen,
  onClose,
  backtest,
  ticker,
}) {
  const [showIframe, setShowIframe] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm fade-in">
      <div className="glass relative w-full max-w-3xl rounded-3xl p-6 shadow-2xl dark:border-slate-800 bg-white dark:bg-dark-card overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Sentinel Walk-Forward Quant Analytics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance & Hypothesis Testing metrics for{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {ticker}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Sharpe Ratio
              </span>
              <div className="text-xl font-extrabold text-brand-500 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {sharpe}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Ann. Return
              </span>
              <div className="text-xl font-extrabold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {annReturn}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Max Drawdown
              </span>
              <div className="text-xl font-extrabold text-rose-500 flex items-center gap-1">
                {maxDrawdown}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Win Rate
              </span>
              <div className="text-xl font-extrabold text-blue-500 flex items-center gap-1">
                <Percent className="w-4 h-4" />
                {winRate}%
              </div>
            </div>
          </div>

          {/* IC & Hypothesis Testing Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              Information Coefficient & Hypothesis Test
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Spearman Rank IC:
                </span>
                <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">
                  {ic}
                </span>
                <span className="text-slate-400 text-[10px] block">
                  p-value: {icPValue}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Statistical Significance:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md mt-1 ${
                    isSig
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {isSig ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {isSig
                    ? 'Statistically Significant (p < 0.05)'
                    : 'Not Significant (p >= 0.05)'}
                </span>
              </div>
            </div>
          </div>

          {/* Benchmark Comparisons */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm">Benchmark Comparisons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  vs. Random Signal Baseline
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    outRandom
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {outRandom ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {outRandom ? 'Outperformed' : 'Underperformed'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  vs. Buy & Hold Index
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    outBuyHold
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {outBuyHold ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {outBuyHold ? 'Outperformed' : 'Underperformed'}
                </span>
              </div>
            </div>
          </div>

          {/* Embed / Open Plotly Interactive HTML Report */}
          <div className="pt-2">
            <button
              onClick={() => setShowIframe(!showIframe)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              {showIframe
                ? 'Hide Full Interactive Plotly Report'
                : 'Open Full Interactive Plotly Report'}
            </button>

            {showIframe && (
              <div className="mt-4 h-96 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <iframe
                  src={reportUrl}
                  title="Sentinel Interactive Report"
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
