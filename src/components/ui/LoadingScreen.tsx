import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

interface LoadingScreenProps {
    onComplete: () => void;
    autoHide?: boolean; // If true, automatically slides up when animation finishes
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, autoHide = true }) => {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = 2000;
        const startTime = Date.now();
        let animationFrame: number;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;

            // If onComplete is provided, we simulate progress up to 100%
            // If we want it to hang (for real loading), we might want to approach 90% and wait.
            // But for now, let's stick to the visual request: "nicer up to down loading screen"
            // The existing logic is a fake loader. 

            const rawProgress = Math.min(elapsed / duration, 1);
            const easeProgress = rawProgress === 1 ? 1 : 1 - Math.pow(2, -10 * rawProgress);

            setProgress(easeProgress * 100);

            if (rawProgress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Animation complete
                if (autoHide) {
                    setTimeout(() => {
                        setIsExiting(true);
                        setTimeout(onComplete, 800);
                    }, 200);
                }
                // If autoHide is false, we just stay at 100%
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [onComplete]);

    // Disable scrolling while loading screen is visible
    useEffect(() => {
        // Save original body styles
        const originalOverflow = document.body.style.overflow;
        const originalHeight = document.body.style.height;

        // Lock scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';

        // Re-enable scrolling when exiting
        if (isExiting) {
            document.body.style.overflow = originalOverflow || '';
            document.body.style.height = originalHeight || '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = originalOverflow || '';
            document.body.style.height = originalHeight || '';
        };
    }, [isExiting]);

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
            zIndex: 10000,
            transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)',
            transform: isExiting ? 'translateY(-100%)' : 'translateY(0)',
        }}>

            {/* Centered Content Container */}
            <div style={{
                transition: 'opacity 0.4s ease',
                opacity: isExiting ? 0 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: '24px', // Space between logo and percent
            }}>
                <img
                    src={logo}
                    alt="Nombre Logo"
                    style={{
                        width: '120px', // Slightly smaller
                        height: 'auto',
                        opacity: Math.max(0, (progress - 10) / 90), // Slow fade in
                        transform: `scale(${0.9 + (progress / 1000)})`,
                        transition: 'opacity 0.1s linear, transform 0.1s linear',
                        filter: 'drop-shadow(0 0 30px rgba(234, 153, 153, 0.15))'
                    }}
                />

                {/* Number below logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    lineHeight: 1,
                    marginTop: '4px', // Tighter coupling with logo
                }}>
                    <span style={{
                        fontSize: '1.25rem', // More understated
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.6)', // Softer white
                        fontFamily: "'Geist Mono', 'SF Mono', 'Roboto Mono', monospace", // Technical/Clean feel
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {Math.floor(progress).toString().padStart(3, '0')}
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginLeft: '3px',
                    }}>
                        %
                    </span>
                </div>
            </div>

            {/* Subtle Loading Bar at bottom - Ultra minimalist */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px', // Thinner
                width: '100%',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: '#fff', // Pure white for cleanliness
                    opacity: 0.2,
                    transition: 'width 0.1s linear'
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
