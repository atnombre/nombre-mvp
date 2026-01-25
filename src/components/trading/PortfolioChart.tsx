import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle, AreaSeries, Time } from 'lightweight-charts';

interface ChartDataPoint {
  time: string;
  value: number;
}

interface PortfolioChartProps {
  data?: ChartDataPoint[];
  height?: number;
  showTimeControls?: boolean;
  onPeriodChange?: (period: string) => void;
  currentValue?: number;
  valueChange?: number;
  valueChangePercent?: number;
}

const TIME_PERIODS = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '3M', value: '90d' },
  { label: '1Y', value: '365d' },
  { label: 'ALL', value: 'all' },
];

// Generate mock data for demonstration (replace with real API data)
const generateMockData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  let value = 10000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const change = (Math.random() - 0.48) * 200;
    value = Math.max(value + change, 5000);
    
    data.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }
  
  return data;
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  data,
  height = 300,
  showTimeControls = true,
  onPeriodChange,
  currentValue,
  valueChange,
  valueChangePercent,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [hoveredValue, setHoveredValue] = useState<{ value: number; time: string } | null>(null);

  // Use provided data or generate mock data
  const chartData = data || generateMockData(
    selectedPeriod === '1d' ? 1 :
    selectedPeriod === '7d' ? 7 :
    selectedPeriod === '30d' ? 30 :
    selectedPeriod === '90d' ? 90 :
    selectedPeriod === '365d' ? 365 : 730
  );

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.5)',
        fontFamily: 'var(--font-mono)',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)', style: LineStyle.Dotted },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(234, 153, 153, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#EA9999',
        },
        horzLine: {
          color: 'rgba(234, 153, 153, 0.5)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#EA9999',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    // Create area series with gradient (v5 API)
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#EA9999',
      topColor: 'rgba(234, 153, 153, 0.4)',
      bottomColor: 'rgba(234, 153, 153, 0.0)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Set data
    areaSeries.setData(chartData.map(d => ({ time: d.time as Time, value: d.value })));

    // Fit content
    chart.timeScale().fitContent();

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.size > 0) {
        const data = param.seriesData.get(areaSeries);
        if (data && 'value' in data) {
          setHoveredValue({
            value: data.value as number,
            time: param.time as string,
          });
        }
      } else {
        setHoveredValue(null);
      }
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData, height]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const displayValue = hoveredValue?.value ?? currentValue ?? chartData[chartData.length - 1]?.value ?? 0;
  const isProfit = (valueChangePercent ?? 0) >= 0;

  return (
    <div style={{
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '20px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}>
            Portfolio Performance
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
          }}>
            {displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ fontSize: '0.875rem', marginLeft: '4px', color: 'var(--text-muted)' }}>NMBR</span>
          </div>
          {valueChange !== undefined && valueChangePercent !== undefined && (
            <div style={{
              fontSize: '0.875rem',
              color: isProfit ? 'var(--color-positive)' : 'var(--color-negative)',
              marginTop: '4px',
            }}>
              {isProfit ? '+' : ''}{valueChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span style={{ marginLeft: '8px' }}>
                ({isProfit ? '+' : ''}{valueChangePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Time Period Controls */}
        {showTimeControls && (
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
          }}>
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  backgroundColor: selectedPeriod === period.value ? 'var(--color-accent)' : 'transparent',
                  color: selectedPeriod === period.value ? '#000' : 'var(--text-muted)',
                }}
              >
                {period.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: height,
        }}
      />

      {/* Hover info */}
      {hoveredValue && (
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          {new Date(hoveredValue.time).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}
    </div>
  );
};
