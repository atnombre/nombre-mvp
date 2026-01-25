import React from 'react';

interface CardProps {
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    hover = false,
    onClick,
    style,
    className = '',
}) => {
    const paddingValues: Record<string, string> = {
        none: '0',
        sm: '0.75rem',
        md: '1.25rem',
        lg: '1.75rem',
    };

    const baseStyles: React.CSSProperties = {
        backgroundColor: 'rgba(17, 17, 17, 0.8)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: paddingValues[padding],
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        backdropFilter: 'blur(10px)',
        ...style,
    };

    return (
        <div
            className={className}
            style={baseStyles}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (hover || onClick) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                if (hover || onClick) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            {children}
        </div>
    );
};

// Card Header component
interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
            paddingBottom: '0.875rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}>
            <div>
                <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                }}>
                    {title}
                </h3>
                {subtitle && (
                    <p style={{
                        margin: '0.35rem 0 0 0',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};
