import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = 2000; // 2 seconds loading
        const startTime = Date.now();
        let animationFrame: number;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);

            // Easing function for smoother counter (easeOutExpo)
            const easeProgress = rawProgress === 1 ? 1 : 1 - Math.pow(2, -10 * rawProgress);

            setProgress(easeProgress * 100);

            if (rawProgress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Animation complete
                setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(onComplete, 800); // 800ms exit transition
                }, 200);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#050505', // Deep rich black
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)',
            transform: isExiting ? 'translateY(-100%)' : 'translateY(0)',
        }}>

            {/* Centered Logo */}
            <div style={{
                transition: 'opacity 0.4s ease',
                opacity: isExiting ? 0 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1, // Take up available space to center vertically
            }}>
                <img
                    src={logo}
                    alt="Nombre Logo"
                    style={{
                        width: '180px', // Significantly increased size
                        height: 'auto',
                        opacity: Math.max(0, (progress - 10) / 90), // Slow fade in
                        transform: `scale(${0.9 + (progress / 1000)})`, // Subtle scale up breathing
                        transition: 'opacity 0.1s linear, transform 0.1s linear',
                        filter: 'drop-shadow(0 0 30px rgba(234, 153, 153, 0.15))' // Subtle glow matching accent
                    }}
                />
            </div>

            {/* Bottom Number */}
            <div style={{
                marginBottom: '60px', // Position from bottom
                display: 'flex',
                alignItems: 'baseline',
                lineHeight: 1,
                transition: 'opacity 0.4s ease',
                opacity: isExiting ? 0 : 1,
            }}>
                <span style={{
                    fontSize: '4rem', // Smaller than before, but still readable
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {Math.floor(progress)}
                </span>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: 'var(--color-accent)',
                    marginLeft: '4px',
                }}>
                    %
                </span>
            </div>

            {/* Subtle Loading Bar at bottom */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                width: '100%',
                background: 'rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--color-accent)',
                    boxShadow: '0 0 10px var(--color-accent)',
                }} />
            </div>

            {/* Background Texture/Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                opacity: 0.05,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default LoadingScreen;
