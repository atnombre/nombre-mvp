import React from 'react';
import { FinancialChart } from './FinancialChart';
import { PricePoint } from '../../services/api';

interface PriceChartProps {
    data: PricePoint[];
    period?: '1h' | '24h' | '7d' | '30d';
    height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, period: _period, height = 280 }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: height,
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

    // Map PricePoint to ChartDataPoint
    const chartData = data.map(p => ({
        time: new Date(p.timestamp).getTime(),
        value: p.price
    }));

    // Calculate trend for color
    const startPrice = chartData[0]?.value || 0;
    const endPrice = chartData[chartData.length - 1]?.value || 0;
    const isPositive = endPrice >= startPrice;

    return (
        <FinancialChart
            data={chartData}
            variant="price"
            height={height}
            color={isPositive ? '#4ade80' : '#f87171'}
        />
    );
};
