import React from 'react';
import './HeroCTAButton.css';

interface HeroCTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

const HeroCTAButton: React.FC<HeroCTAButtonProps> = ({
    label,
    href,
    onClick,
    className = '',
    ...props
}) => {
    return (
        <div className={`hero-cta-wrapper ${className}`}>
            {href ? (
                <a
                    className="shimmer-button"
                    href={href}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    <span className="cta-label">{label}</span>
                    <span className="cta-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M21 12L13 4M21 12L13 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </a>
            ) : (
                <button
                    className="shimmer-button"
                    onClick={onClick}
                    {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                >
                    <span className="cta-label">{label}</span>
                    <span className="cta-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M21 12L13 4M21 12L13 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
};

export default HeroCTAButton;
