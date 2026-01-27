import React from 'react';

interface CardProps {
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'solid' | 'light';
    hover?: boolean;
    glow?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    variant = 'default',
    hover = false,
    glow = false,
    onClick,
    style,
    className = '',
}) => {
    const paddingValues: Record<string, string> = {
        none: '0',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        solid: {
            background: 'rgba(17, 17, 17, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        light: {
            background: 'rgba(30, 30, 30, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        },
    };

    const baseStyles: React.CSSProperties = {
        borderRadius: '14px',
        padding: paddingValues[padding],
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...variantStyles[variant],
        ...style,
    };

    // Add glow effect if enabled
    if (glow) {
        baseStyles.boxShadow = `${variantStyles[variant].boxShadow}, 0 0 30px rgba(234, 153, 153, 0.1)`;
    }

    return (
        <div
            className={className}
            style={baseStyles}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (hover || onClick) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                    if (glow) {
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(234, 153, 153, 0.15)';
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (hover || onClick) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = glow
                        ? `${variantStyles[variant].boxShadow}, 0 0 30px rgba(234, 153, 153, 0.1)`
                        : variantStyles[variant].boxShadow as string;
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
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
            <div>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 1)',
                    letterSpacing: '-0.01em',
                }}>
                    {title}
                </h3>
                {subtitle && (
                    <p style={{
                        margin: '0.4rem 0 0 0',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.45)',
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};
