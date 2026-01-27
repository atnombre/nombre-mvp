import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    glow?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    glow = false,
    children,
    disabled,
    style,
    ...props
}) => {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: '10px',
        border: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled || isLoading ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '0.01em',
        position: 'relative',
        overflow: 'hidden',
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.75rem' },
        md: { padding: '0.65rem 1.5rem', fontSize: '0.85rem' },
        lg: { padding: '0.85rem 2rem', fontSize: '0.95rem' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
            color: '#fff',
            boxShadow: glow
                ? '0 4px 16px rgba(234, 153, 153, 0.35), 0 0 30px rgba(234, 153, 153, 0.2)'
                : '0 4px 16px rgba(234, 153, 153, 0.25)',
        },
        secondary: {
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
        },
        danger: {
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        },
    };

    const hoverStyles: Record<string, Partial<CSSStyleDeclaration>> = {
        primary: {
            transform: 'translateY(-2px)',
            boxShadow: glow
                ? '0 6px 24px rgba(234, 153, 153, 0.45), 0 0 40px rgba(234, 153, 153, 0.3)'
                : '0 6px 24px rgba(234, 153, 153, 0.35)',
        },
        secondary: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-1px)',
        },
        ghost: {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.9)',
        },
        danger: {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(239, 68, 68, 0.35)',
        },
        glass: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.18)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
        },
    };

    const combinedStyles: React.CSSProperties = {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
    };

    return (
        <button
            style={combinedStyles}
            disabled={disabled || isLoading}
            onMouseEnter={(e) => {
                if (!disabled && !isLoading) {
                    const hover = hoverStyles[variant];
                    if (hover.transform) e.currentTarget.style.transform = hover.transform;
                    if (hover.boxShadow) e.currentTarget.style.boxShadow = hover.boxShadow;
                    if (hover.backgroundColor) e.currentTarget.style.backgroundColor = hover.backgroundColor;
                    if (hover.borderColor) e.currentTarget.style.borderColor = hover.borderColor;
                    if (hover.color) e.currentTarget.style.color = hover.color;
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    const original = variantStyles[variant];
                    e.currentTarget.style.boxShadow = original.boxShadow as string || '';
                    e.currentTarget.style.backgroundColor = original.backgroundColor as string || '';
                    e.currentTarget.style.borderColor = (original.border as string)?.includes('solid')
                        ? 'rgba(255, 255, 255, 0.1)' : '';
                    if (original.color) e.currentTarget.style.color = original.color;
                }
            }}
            onMouseDown={(e) => {
                if (!disabled && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
            }}
            {...props}
        >
            {isLoading ? (
                <>
                    <span style={{
                        width: '1em',
                        height: '1em',
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                    }} />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
