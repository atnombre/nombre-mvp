import React, { useState } from 'react';

// Brand pink color contrasts for allocation bar
// Harmonious pink shades based on #EA9999
const COLOR_PALETTE = [
  '#EA9999', // Brand Pink (base)
  '#E88A8A', // Warm Rose
  '#F5AAAA', // Light Coral
  '#D98888', // Dusty Rose
  '#F0C0C0', // Blush Pink
  '#CC7777', // Mauve
  '#EDA5A5', // Salmon Pink
  '#DFA0A0', // Rose Quartz
];

interface AllocationBarProps {
  items: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  showLabels?: boolean;
  totalValue?: number;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  items,
  height = 8,
  showLabels = false,
  totalValue,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = totalValue || items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || items.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          backgroundColor: 'var(--bg-hover)',
          borderRadius: `${height / 2}px`,
        }}
      />
    );
  }

  const itemsWithPercent = items.map((item, index) => ({
    ...item,
    percent: (item.value / total) * 100,
    color: item.color || COLOR_PALETTE[index % COLOR_PALETTE.length],
  }));

  return (
    <div>
      {/* Bar */}
      <div
        style={{
          display: 'flex',
          height: `${height}px`,
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-hover)',
        }}
      >
        {itemsWithPercent.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            title={`${item.label}: ${item.percent.toFixed(1)}%`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              width: `${item.percent}%`,
              backgroundColor: item.color,
              transition: 'all 0.2s ease',
              minWidth: item.percent > 0 ? '2px' : '0',
              opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Labels */}
      {showLabels && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '12px',
          }}
        >
          {itemsWithPercent.map((item, index) => (
            <div
              key={`label-${item.label}-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: item.color,
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {item.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Portfolio specific allocation bar with pink monochromatic colors
interface PortfolioAllocationProps {
  holdings: {
    name: string;
    symbol: string;
    value: number;
  }[];
  totalValue: number;
  maxItems?: number;
}

export const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({
  holdings,
  totalValue,
  maxItems = 5,
}) => {
  // Sort by value and take top N
  const sorted = [...holdings].sort((a, b) => b.value - a.value);
  const topItems = sorted.slice(0, maxItems);
  const otherValue = sorted.slice(maxItems).reduce((sum, h) => sum + h.value, 0);

  const items = topItems.map((h, i) => ({
    label: h.symbol,
    value: h.value,
    color: COLOR_PALETTE[i % COLOR_PALETTE.length],
  }));

  if (otherValue > 0) {
    items.push({
      label: 'Others',
      value: otherValue,
      color: '#F0D0D0', // Light pink for Others
    });
  }

  return <AllocationBar items={items} height={56} showLabels totalValue={totalValue} />;
};
