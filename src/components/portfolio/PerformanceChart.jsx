export default function PerformanceChart({ data }) {
  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400 dark:bg-slate-800/40">
        Add transactions to build performance history.
      </div>
    );
  }

  const min = Math.min(...data.map((point) => point.value));
  const max = Math.max(...data.map((point) => point.value));
  const range = Math.max(max - min, 1);
  const points = data.map((point, index) => {
    const x = data.length === 1 ? 50 : index / (data.length - 1) * 100;
    const y = 90 - ((point.value - min) / range) * 75;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-56">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" vectorEffect="non-scaling-stroke" points={points} />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </div>
    </div>
  );
}
