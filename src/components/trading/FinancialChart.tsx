import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface ChartDataPoint {
    time: number; // Ms timestamp
    value: number;
}

interface FinancialChartProps {
    data: ChartDataPoint[];
    variant?: 'price' | 'portfolio';
    height?: number;
    color?: string; // Optional override
}

// --------------------------------------------------------------------------
// Smart Price Formatter
// --------------------------------------------------------------------------

const formatSmartPrice = (value: number): string => {
    if (value === 0) return '0.00';
    if (Math.abs(value) < 0.0001) return value.toFixed(8);
    if (Math.abs(value) < 0.01) return value.toFixed(6);
    if (Math.abs(value) < 1.0) return value.toFixed(4);
    if (Math.abs(value) < 100) return value.toFixed(2);
    if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(2) + 'M';
    if (Math.abs(value) >= 1000) return (value / 1000).toFixed(2) + 'k';
    return value.toFixed(2);
};

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export const FinancialChart: React.FC<FinancialChartProps> = ({
    data,
    variant = 'price',
    height = 300,
    color,
}) => {
    // Determine chart color dynamically
    const mainColor = useMemo(() => {
        if (color) return color;
        if (variant === 'portfolio') return '#EA9999'; // Brand Pink

        if (data && data.length > 0) {
            const first = data[0].value;
            const last = data[data.length - 1].value;
            return last >= first ? '#4ade80' : '#f87171'; // Green : Red
        }
        return '#4ade80';
    }, [color, variant, data]);

    // Parse RGB for gradient
    const parseColor = (hex: string): [number, number, number] => {
        const clean = hex.replace('#', '');
        return [
            parseInt(clean.substring(0, 2), 16),
            parseInt(clean.substring(2, 4), 16),
            parseInt(clean.substring(4, 6), 16),
        ];
    };

    // Prepare series data with deduplication
    const seriesData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const sorted = [...data]
            .filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value))
            .sort((a, b) => a.time - b.time);

        // Deduplicate by timestamp
        const unique: [number, number][] = [];
        let lastTime = -1;
        for (const d of sorted) {
            if (d.time !== lastTime) {
                unique.push([d.time, d.value]);
                lastTime = d.time;
            }
        }
        return unique;
    }, [data]);

    // Calculate softMin/softMax for better Y-axis scaling
    const yAxisBounds = useMemo(() => {
        if (seriesData.length === 0) return { softMin: undefined, softMax: undefined };

        const values = seriesData.map(d => d[1]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        // Add 15% padding for breathing room
        const padding = range === 0 ? Math.max(min * 0.1, 1) : range * 0.15;

        return {
            softMin: Math.max(0, min - padding),
            softMax: max + padding,
        };
    }, [seriesData]);

    const [r, g, b] = parseColor(mainColor);

    const chartOptions: Highcharts.Options = useMemo(() => ({
        chart: {
            type: 'area',
            height: height,
            backgroundColor: 'transparent',
            margin: [10, 50, 30, 10],
            spacing: [10, 10, 10, 10],
            // Enable zooming with mouse drag
            zooming: {
                type: 'x',
                mouseWheel: {
                    enabled: true,
                },
            },
            // Smooth panning
            panning: {
                enabled: true,
                type: 'x',
            },
            panKey: 'shift',
            animation: {
                duration: 500,
            },
            style: {
                fontFamily: 'var(--font-mono), monospace',
            },
        },
        title: {
            text: undefined,
        },
        credits: {
            enabled: false,
        },
        legend: {
            enabled: false,
        },
        xAxis: {
            type: 'datetime',
            lineColor: 'rgba(255, 255, 255, 0.1)',
            tickColor: 'rgba(255, 255, 255, 0.1)',
            gridLineColor: 'rgba(255, 255, 255, 0.03)',
            gridLineWidth: 0,
            labels: {
                format: '{value:%b %d}',
                style: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '10px',
                },
            },
            crosshair: {
                color: 'rgba(255, 255, 255, 0.2)',
                width: 1,
                dashStyle: 'ShortDash',
            },
        },
        yAxis: {
            ...yAxisBounds,
            opposite: true,
            title: {
                text: undefined,
            },
            gridLineColor: 'rgba(255, 255, 255, 0.04)',
            lineColor: 'rgba(255, 255, 255, 0.1)',
            labels: {
                style: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '10px',
                },
                formatter: function (this: Highcharts.AxisLabelsFormatterContextObject): string {
                    return formatSmartPrice(Number(this.value));
                },
            },
            crosshair: {
                color: 'rgba(255, 255, 255, 0.2)',
                width: 1,
                dashStyle: 'ShortDash',
            },
        },
        tooltip: {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 12,
            borderWidth: 1,
            shadow: {
                color: 'rgba(0, 0, 0, 0.3)',
                offsetX: 0,
                offsetY: 4,
                width: 8,
            },
            style: {
                color: '#ffffff',
                fontSize: '12px',
            },
            useHTML: true,
            formatter: function (this: any): string {
                const timestamp = this.x as number;
                const date = new Date(timestamp);
                const formattedDate = date.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const value = this.y as number;
                const isPositive = variant === 'portfolio' ? true : (seriesData.length > 0 && value >= seriesData[0][1]);
                const changeColor = isPositive ? '#4ade80' : '#f87171';

                return `
                    <div style="padding: 10px; backdrop-filter: blur(10px);">
                        <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 6px;">
                            ${formattedDate}
                        </div>
                        <div style="font-weight: 700; font-size: 16px; color: ${changeColor};">
                            ${formatSmartPrice(value)} NMBR
                        </div>
                    </div>
                `;
            },
        },
        plotOptions: {
            series: {
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart',
                },
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 3,
                    },
                    inactive: {
                        opacity: 0.7,
                    },
                },
            },
            area: {
                fillOpacity: 0.4,
                lineWidth: 2.5,
                marker: {
                    enabled: false,
                    radius: 3,
                    fillColor: mainColor,
                    lineWidth: 2,
                    lineColor: '#ffffff',
                    states: {
                        hover: {
                            enabled: true,
                            radius: 6,
                            lineWidth: 2,
                        },
                    },
                },
                threshold: null,
            },
        },
        series: [{
            type: 'area',
            data: seriesData,
            color: mainColor,
            fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, `rgba(${r}, ${g}, ${b}, 0.6)`],
                    [0.5, `rgba(${r}, ${g}, ${b}, 0.2)`],
                    [1, `rgba(${r}, ${g}, ${b}, 0.02)`],
                ],
            },
            lineWidth: 2.5,
            name: variant === 'portfolio' ? 'Portfolio Value' : 'Price',
            states: {
                hover: {
                    lineWidth: 3,
                },
            },
            // Enable point tracking for better interactivity
            stickyTracking: true,
            // Turbo threshold for performance with large datasets
            turboThreshold: 5000,
        }],
        // Reset zoom button styling
        exporting: {
            enabled: false,
        },
    }), [seriesData, mainColor, height, r, g, b, variant, yAxisBounds]);

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div
                style={{
                    width: '100%',
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.8rem',
                    flexDirection: 'column',
                    gap: '8px',
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    📈
                </div>
                No data available
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: height,
            position: 'relative',
            cursor: 'crosshair',
        }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                containerProps={{
                    style: { width: '100%', height: '100%' }
                }}
            />
            {/* Zoom hint */}
            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.25)',
                pointerEvents: 'none',
            }}>
                Drag to zoom • Shift+drag to pan
            </div>
        </div>
    );
};
