import React from 'react';

export interface TickerItem {
    symbol: string;
    price: string;
    change: string;
    pctChange: string;
}

interface TickerProps {
    items: TickerItem[];
    speed?: number; // Duration in seconds
    className?: string;
    visible?: boolean;
}

const InfiniteTicker: React.FC<TickerProps> = ({
    items,
    speed = 40,
    className = '',
    visible = false,
}) => {
    // Duplicate for seamless loop
    // Ensure we have enough items to fill screen width
    const duplicatedItems = [...items, ...items, ...items, ...items];

    // Animation: scrollLeft (moves content to the left, so it looks like it's coming from right)
    const animationName = 'scrollLeft';

    return (
        <div
            className={`ticker-wrapper ${className}`}
            style={{
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 50,
                backgroundColor: 'transparent', // Ambient: No background
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                opacity: visible ? 1 : 0,
                transition: 'opacity 1s ease-out', // Slower fade for ambient feel
                pointerEvents: 'none',
                overflow: 'hidden',
                borderBottom: 'none',
                boxShadow: 'none',
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', // Soft edges
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            }}
        >
            <div
                className="ticker-track"
                style={{
                    display: 'flex',
                    gap: '4rem', // Generous spacing
                    width: 'max-content',
                    animation: `${animationName} ${speed}s linear infinite`,
                    willChange: 'transform',
                }}
            >
                {duplicatedItems.map((item, index) => (
                    <span
                        key={index}
                        style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.7)', // Muted primary text
                            whiteSpace: 'nowrap',
                            fontFamily: 'Inter, system-ui, sans-serif', // Modern sans-serif
                            fontWeight: 400,
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {/* No "@" symbol per requested "minimal" style implies we can drop it or keep it subtle. 
                 User said: "Text color hierarchy... Primary values: soft white / light gray". 
                 The example format in prompt was "@ SYM $Price", but later "Content remains on one single line... No hard separators". 
                 I'll keep the structure but mute the "@" even more or remove it if "minimal" implies it. 
                 Let's keep it very subtle. */}
                        <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5em' }}>@</span>
                        <span style={{ fontWeight: 500, marginRight: '0.5em', color: 'rgba(255, 255, 255, 0.8)' }}>{item.symbol}</span>
                        <span style={{ marginRight: '0.5em', fontWeight: 300 }}>{item.price}</span>
                        <span style={{ marginRight: '0.5em', color: item.change.startsWith('+') ? '#86efac' : item.change.startsWith('-') ? '#fca5a5' : '#e5e5e5', opacity: 0.8 }}>
                            {item.change}
                        </span>
                        <span style={{ opacity: 0.4, fontSize: '0.8em' }}>({item.pctChange})</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default InfiniteTicker;
