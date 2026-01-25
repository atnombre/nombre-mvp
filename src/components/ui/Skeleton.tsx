import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    style,
}) => {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: '#1a1a1a',
                background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                ...style,
            }}
        />
    );
};

// Add shimmer animation to global styles
const shimmerKeyframes = `
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;

// Inject keyframes if not already present
if (typeof document !== 'undefined') {
    const styleId = 'skeleton-keyframes';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = shimmerKeyframes;
        document.head.appendChild(styleSheet);
    }
}

// Card Skeleton - for loading states
export const CardSkeleton: React.FC = () => {
    return (
        <div style={{
            backgroundColor: '#111111',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Skeleton width={48} height={48} borderRadius="50%" />
                <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="40%" height="0.75rem" />
                </div>
            </div>
            <Skeleton width="100%" height="2rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="70%" height="0.875rem" />
        </div>
    );
};
