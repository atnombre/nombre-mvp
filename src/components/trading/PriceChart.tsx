import React from 'react';
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

import { PricePoint } from '../../services/api';

interface PriceChartProps {
    data: PricePoint[];
    period: '1h' | '24h' | '7d' | '30d';
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, period }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.85rem',
            }}>
                No price data available
            </div>
        );
    }

    // Format data for chart - calculate cumulative volume
    let cumulativeVolume = 0;
    const chartData = data.map((point) => {
        cumulativeVolume += point.volume;
        return {
            time: new Date(point.timestamp).getTime(),
            price: point.price,
            volume: point.volume,
            cumulativeVolume: cumulativeVolume,
        };
    });

    // Determine if price is up or down
    const firstPrice = chartData[0]?.price || 0;
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    const isUp = lastPrice >= firstPrice;
    const lineColor = isUp ? '#4ade80' : '#f87171';
    const gradientId = isUp ? 'priceGradientUp' : 'priceGradientDown';

    // Format timestamp based on period
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        switch (period) {
            case '1h':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '24h':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '7d':
                return date.toLocaleDateString([], { weekday: 'short' });
            case '30d':
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            default:
                return date.toLocaleDateString();
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'rgba(15, 15, 15, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}>
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '6px',
                    }}>
                        {new Date(data.time).toLocaleString()}
                    </div>
                    <div style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {data.price.toFixed(6)}
                        <span style={{
                            color: 'var(--color-accent)',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            marginLeft: '4px',
                        }}>NMBR</span>
                    </div>
                    {data.cumulativeVolume > 0 && (
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.35)',
                            fontSize: '0.7rem',
                            marginTop: '6px',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            Vol: {data.cumulativeVolume.toFixed(2)} NMBR
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="priceGradientUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EA9999" stopOpacity={0.35} />
                            <stop offset="50%" stopColor="#4ade80" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="priceGradientDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EA9999" stopOpacity={0.35} />
                            <stop offset="50%" stopColor="#f87171" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255, 255, 255, 0.35)', fontSize: 10 }}
                        tickFormatter={formatTime}
                        minTickGap={50}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255, 255, 255, 0.35)', fontSize: 10 }}
                        tickFormatter={(value) => value.toFixed(4)}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={lineColor}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: lineColor,
                            stroke: '#0a0a0a',
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
