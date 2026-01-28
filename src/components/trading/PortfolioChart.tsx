import React, { useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Holding } from '../../services/api';
import { usePortfolioPnLHistory } from '../../hooks/usePortfolioPnLHistory';

interface PortfolioChartProps {
  holdings?: Holding[];
  height?: number;
  showTimeControls?: boolean;
  onPeriodChange?: (period: string) => void;
  valueChangePercent?: number;
  totalPnL?: number;
}

const TIME_PERIODS = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '7d' },
  { label: '1M', value: '30d' },
  { label: 'ALL', value: 'all' },
];

// Smart price formatter
const formatSmartPrice = (value: number): string => {
  if (value === 0) return '0';
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return (value / 1000000).toFixed(2) + 'M';
  if (absValue >= 1000) return (value / 1000).toFixed(2) + 'k';
  if (absValue < 1) return value.toFixed(4);
  return value.toFixed(2);
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  holdings,
  height = 200,
  showTimeControls = true,
  onPeriodChange,
  valueChangePercent,
  totalPnL,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Fetch P&L history from aggregated price data
  const { pnlHistory, isLoading } = usePortfolioPnLHistory(holdings);

  // Convert to Highcharts format
  const seriesData = useMemo(() => {
    return pnlHistory.map(point => [point.time, point.pnl] as [number, number]);
  }, [pnlHistory]);

  // Calculate current P&L (last value or prop)
  const displayPnL = totalPnL ?? (seriesData.length > 0 ? seriesData[seriesData.length - 1][1] : 0);
  const isProfit = displayPnL >= 0;

  // Determine chart color based on overall profit/loss
  const mainColor = isProfit ? '#4ade80' : '#f87171';
  const [r, g, b] = mainColor === '#4ade80' ? [74, 222, 128] : [248, 113, 113];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  // Highcharts configuration for P&L time-series
  const chartOptions: Highcharts.Options = useMemo(() => ({
    chart: {
      type: 'area',
      height: height,
      backgroundColor: 'transparent',
      margin: [10, 50, 30, 50],
      animation: { duration: 600 },
      style: { fontFamily: 'var(--font-mono), monospace' },
      zooming: {
        type: 'x',
        mouseWheel: { enabled: true },
      },
      panning: { enabled: true, type: 'x' },
      panKey: 'shift',
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      type: 'datetime',
      lineColor: 'rgba(255, 255, 255, 0.1)',
      tickColor: 'rgba(255, 255, 255, 0.1)',
      gridLineWidth: 0,
      labels: {
        format: '{value:%b %d}',
        style: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px' },
      },
      crosshair: { color: 'rgba(255, 255, 255, 0.2)', width: 1, dashStyle: 'ShortDash' },
    },
    yAxis: {
      title: { text: undefined },
      gridLineColor: 'rgba(255, 255, 255, 0.04)',
      lineColor: 'rgba(255, 255, 255, 0.1)',
      // Zero line for P&L reference
      plotLines: [{
        value: 0,
        color: 'rgba(255, 255, 255, 0.3)',
        width: 1,
        zIndex: 3,
        dashStyle: 'Dash',
      }],
      labels: {
        style: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px' },
        formatter: function (this: any): string {
          const val = Number(this.value);
          return (val >= 0 ? '+' : '') + formatSmartPrice(val);
        },
      },
      crosshair: { color: 'rgba(255, 255, 255, 0.2)', width: 1, dashStyle: 'ShortDash' },
    },
    tooltip: {
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      borderWidth: 1,
      style: { color: '#ffffff', fontSize: '12px' },
      useHTML: true,
      formatter: function (this: any): string {
        const timestamp = this.x as number;
        const pnl = this.y as number;
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString([], {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const isProfitPoint = pnl >= 0;

        return `
          <div style="padding: 10px;">
            <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 6px;">
              ${formattedDate}
            </div>
            <div style="font-weight: 700; font-size: 16px; color: ${isProfitPoint ? '#4ade80' : '#f87171'};">
              ${isProfitPoint ? '+' : ''}${formatSmartPrice(pnl)} NMBR
            </div>
            <div style="color: rgba(255,255,255,0.4); font-size: 10px; margin-top: 4px;">
              Portfolio P&L
            </div>
          </div>
        `;
      },
    },
    plotOptions: {
      area: {
        fillOpacity: 0.4,
        lineWidth: 2.5,
        marker: {
          enabled: false,
          states: { hover: { enabled: true, radius: 5 } },
        },
        threshold: 0, // Area fills from zero line
        negativeFillColor: {
          linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
          stops: [
            [0, 'rgba(248, 113, 113, 0.02)'],
            [1, 'rgba(248, 113, 113, 0.4)'],
          ],
        },
      },
      series: {
        animation: { duration: 800 },
        states: { hover: { lineWidth: 3 } },
      },
    },
    series: [{
      type: 'area',
      data: seriesData,
      color: mainColor,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, `rgba(${r}, ${g}, ${b}, 0.5)`],
          [0.5, `rgba(${r}, ${g}, ${b}, 0.15)`],
          [1, `rgba(${r}, ${g}, ${b}, 0.02)`],
        ],
      },
      lineWidth: 2.5,
      name: 'Portfolio P&L',
      turboThreshold: 5000,
    }],
    exporting: { enabled: false },
  }), [seriesData, height, mainColor, r, g, b]);

  const hasData = seriesData.length > 0;

  return (
    <div style={{ backgroundColor: 'transparent', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}>
            Portfolio P&L
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: isProfit ? '#4ade80' : '#f87171',
          }}>
            {isProfit ? '+' : ''}{formatSmartPrice(displayPnL)}
            <span style={{ fontSize: '0.75rem', marginLeft: '4px', color: 'var(--text-muted)' }}>NMBR</span>
          </div>
          {valueChangePercent !== undefined && (
            <div style={{
              fontSize: '0.8rem',
              color: isProfit ? '#4ade80' : '#f87171',
              marginTop: '2px',
            }}>
              {isProfit ? '+' : ''}{valueChangePercent.toFixed(2)}% ROI
            </div>
          )}
        </div>

        {/* Time Period Controls */}
        {showTimeControls && (
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
          }}>
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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

      {/* Chart */}
      <div style={{ height: height, width: '100%' }}>
        {isLoading ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.3)',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(234, 153, 153, 0.2)',
              borderTopColor: '#EA9999',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : hasData ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.3)',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              📈
            </div>
            <span style={{ fontSize: '0.8rem' }}>No P&L history yet</span>
          </div>
        )}
      </div>

      {/* Zoom hint */}
      {hasData && (
        <div style={{
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          Drag to zoom • Shift+drag to pan
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
