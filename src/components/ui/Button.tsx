import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
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
        transition: 'all 0.15s ease',
        opacity: disabled || isLoading ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '0.01em',
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '0.4rem 0.875rem', fontSize: '0.75rem' },
        md: { padding: '0.55rem 1.25rem', fontSize: '0.85rem' },
        lg: { padding: '0.75rem 1.75rem', fontSize: '0.95rem' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(234, 153, 153, 0.25)',
        },
        secondary: {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
        },
        danger: {
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
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
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    if (variant === 'primary') {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 153, 153, 0.35)';
                    } else if (variant === 'secondary') {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    } else if (variant === 'ghost') {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    } else if (variant === 'danger') {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.35)';
                    }
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (variant === 'primary') {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 153, 153, 0.25)';
                } else if (variant === 'secondary') {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                } else if (variant === 'ghost') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                } else if (variant === 'danger') {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.25)';
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

