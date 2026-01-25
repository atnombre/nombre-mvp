import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftElement,
    rightElement,
    style,
    ...props
}) => {
    const inputStyles: React.CSSProperties = {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: error ? '1px solid #fca5a5' : '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        paddingLeft: leftElement ? '2.75rem' : '1rem',
        paddingRight: rightElement ? '2.75rem' : '1rem',
        color: '#fff',
        fontSize: '0.9rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        outline: 'none',
        transition: 'all 0.2s ease',
        ...style,
    };

    return (
        <div style={{ width: '100%' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {leftElement && (
                    <div style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {leftElement}
                    </div>
                )}
                <input
                    style={inputStyles}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(234, 153, 153, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = error ? '#fca5a5' : 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    {...props}
                />
                {rightElement && (
                    <div style={{
                        position: 'absolute',
                        right: '1rem',
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
                    color: '#fca5a5',
                }}>
                    {error}
                </p>
            )}
        </div>
    );
};
