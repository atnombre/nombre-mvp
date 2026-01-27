import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    size = 'md',
    showCloseButton = true,
}) => {
    // Handle escape key
    const handleEscapeKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscapeKey]);

    if (!isOpen) return null;

    const sizeStyles: Record<string, string> = {
        sm: '400px',
        md: '550px',
        lg: '700px',
        xl: '900px',
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1.5rem',
                animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: 'rgba(17, 17, 17, 0.9)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    maxWidth: sizeStyles[size],
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
                    animation: 'scaleIn 0.2s ease',
                }}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div
                        style={{
                            padding: '1.5rem 1.75rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            {icon && (
                                <div
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.2) 0%, rgba(234, 153, 153, 0.1) 100%)',
                                        border: '1px solid rgba(234, 153, 153, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {icon}
                                </div>
                            )}
                            <div>
                                {title && (
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: '1.15rem',
                                        fontWeight: 600,
                                        color: 'rgba(255, 255, 255, 1)',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        fontSize: '0.8rem',
                                        color: 'rgba(255, 255, 255, 0.45)',
                                    }}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '1.5rem 1.75rem',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

// Modal Footer component for action buttons
interface ModalFooterProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right' | 'space-between';
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    align = 'right'
}) => {
    const alignStyles: Record<string, string> = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end',
        'space-between': 'space-between',
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: alignStyles[align],
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
        >
            {children}
        </div>
    );
};
