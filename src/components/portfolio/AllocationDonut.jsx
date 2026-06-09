const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AllocationDonut({ allocation }) {
  const segments = allocation.reduce((accumulator, item, index) => {
    const previousOffset = accumulator[index - 1]?.nextOffset ?? 25;

    return [
      ...accumulator,
      {
      ...item,
      color: COLORS[index % COLORS.length],
        offset: previousOffset,
        nextOffset: previousOffset - item.percent
      }
    ];
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="5" />
          {segments.map((segment) => (
            <circle
              key={segment.sector}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="5"
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={segment.offset}
            />
          ))}
        </svg>
      </div>
      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.sector} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="truncate text-slate-600 dark:text-slate-300">{segment.sector}</span>
            </span>
            <span className="font-semibold">{segment.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
