import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'glass';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftElement,
    rightElement,
    variant = 'default',
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const baseInputStyles: React.CSSProperties = {
        width: '100%',
        backgroundColor: variant === 'glass'
            ? 'rgba(255, 255, 255, 0.04)'
            : 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: error
            ? '1px solid rgba(255, 82, 82, 0.5)'
            : isFocused
                ? '1px solid rgba(234, 153, 153, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        paddingLeft: leftElement ? '3rem' : '1.25rem',
        paddingRight: rightElement ? '3rem' : '1.25rem',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '0.9rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFocused
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 20px rgba(234, 153, 153, 0.1)'
            : 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        ...style,
    };

    return (
        <div style={{ width: '100%' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.02em',
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {leftElement && (
                    <div style={{
                        position: 'absolute',
                        left: '1.1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isFocused ? 'rgba(234, 153, 153, 0.8)' : 'rgba(255, 255, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s ease',
                        pointerEvents: 'none',
                    }}>
                        {leftElement}
                    </div>
                )}
                <input
                    style={baseInputStyles}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
                {rightElement && (
                    <div style={{
                        position: 'absolute',
                        right: '1.1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#FF5252',
                }}>
                    {error}
                </p>
            )}
        </div>
    );
};

// TextArea variant with glass styling
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <div style={{ width: '100%' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.02em',
                }}>
                    {label}
                </label>
            )}
            <textarea
                style={{
                    width: '100%',
                    backgroundColor: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: error
                        ? '1px solid rgba(255, 82, 82, 0.5)'
                        : isFocused
                            ? '1px solid rgba(234, 153, 153, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.25rem',
                    color: 'rgba(255, 255, 255, 1)',
                    fontSize: '0.9rem',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '100px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isFocused
                        ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 20px rgba(234, 153, 153, 0.1)'
                        : 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
                    ...style,
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && (
                <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#FF5252',
                }}>
                    {error}
                </p>
            )}
        </div>
    );
};
