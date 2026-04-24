import { useEffect, useRef } from 'react';
import { CandlestickSeries, ColorType, LineSeries, createChart } from 'lightweight-charts';
import { useTheme } from '../../context/themeStore';

export default function StockChart({ data, type = 'candlestick' }) {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart;
    try {
      const isDark = theme === 'dark';
      const chartOptions = {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isDark ? '#94a3b8' : '#475569',
        },
        grid: {
          vertLines: { color: isDark ? '#334155' : '#e2e8f0' },
          horzLines: { color: isDark ? '#334155' : '#e2e8f0' },
        },
        width: chartContainerRef.current.clientWidth || 400,
        height: chartContainerRef.current.clientHeight || 300,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      };

      chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      if (type === 'candlestick') {
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        seriesRef.current = candlestickSeries;
      } else {
        const lineSeries = chart.addSeries(LineSeries, {
          color: '#0ea5e9',
          lineWidth: 2,
        });
        seriesRef.current = lineSeries;
      }

    } catch (e) {
      console.error("Error creating chart:", e);
      return;
    }

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      if (chart && newRect.width > 0 && newRect.height > 0) {
        chart.applyOptions({ 
          width: newRect.width,
          height: newRect.height
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chart) chart.remove();
    };
  }, [theme, type]);

  // Update data when it changes
  useEffect(() => {
    try {
      if (seriesRef.current && data?.length) {
        const seriesData = type === 'line'
          ? data.map(item => ({ time: item.time, value: item.close }))
          : data;
        seriesRef.current.setData(seriesData);
      }
    } catch(e) {
      console.error("Error updating data:", e);
    }
  }, [data, type]);

  return (
    <div className="w-full h-full min-h-[350px]" ref={chartContainerRef} />
  );
}
