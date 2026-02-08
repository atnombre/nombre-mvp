import React, { useEffect, useRef, useState } from 'react';

// Eager load all frames - they're small webp files and needed for animation
const frameModules = import.meta.glob('../assets/coin_frames/*.webp', { eager: true });
const framePaths = Object.keys(frameModules)
    .sort()
    .map((key) => (frameModules[key] as any).default);

const ScrollCoin: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isReady, setIsReady] = useState(false);

    // Load all frame images on mount
    useEffect(() => {
        const images = framePaths.map((src: string) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        imagesRef.current = images;

        // Wait for first few images to load before starting animation
        const checkReady = () => {
            const loadedCount = images.filter(img => img.complete).length;
            if (loadedCount >= 5) {
                // Initialize canvas with first image
                const canvas = canvasRef.current;
                const firstImg = images[0];
                if (canvas && firstImg && firstImg.complete) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.width = firstImg.naturalWidth || 500;
                        canvas.height = firstImg.naturalHeight || 500;
                        ctx.drawImage(firstImg, 0, 0);
                    }
                }
                setIsReady(true);
            } else {
                requestAnimationFrame(checkReady);
            }
        };

        checkReady();
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isReady) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const totalFrames = imagesRef.current.length;
        let requestId: number;
        let autoFrameIndex = 0;
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();

        const render = () => {
            const scrollY = window.scrollY;
            const now = Date.now();

            // Check if user is actively scrolling
            if (scrollY !== lastScrollY) {
                lastScrollY = scrollY;
                lastScrollTime = now;
            }

            // If not scrolled recently (500ms), auto-spin
            const timeSinceScroll = now - lastScrollTime;
            const shouldAutoSpin = timeSinceScroll > 500;

            let frameIndex: number;
            if (shouldAutoSpin) {
                autoFrameIndex = (autoFrameIndex + 0.5) % totalFrames;
                frameIndex = Math.floor(autoFrameIndex);
            } else {
                const speedFactor = 0.5;
                frameIndex = Math.floor(scrollY * speedFactor) % totalFrames;
                autoFrameIndex = frameIndex;
            }

            // Fade logic based on scroll
            const fadeStart = 200;
            const fadeEnd = 600;
            const opacity = Math.max(0, Math.min(1, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)));
            canvas.style.opacity = (opacity * 0.9).toString();

            const img = imagesRef.current[frameIndex];
            if (img && img.complete) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }

            requestId = requestAnimationFrame(render);
        };

        requestId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestId);
    }, [isReady]);

    return (
        <div
            style={{
                position: 'absolute',
                top: 'auto',
                bottom: '-45%',
                left: '50%',
                right: 'auto',
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 'auto',
                height: 'auto',
                zIndex: 1,
                pointerEvents: 'none',
                backgroundColor: '#050505',
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
            }}
            className="scroll-coin-container"
        >
            <style>{`
                @media (max-width: 768px) {
                    .scroll-coin-container {
                        position: fixed !important;
                        left: 50% !important;
                        right: auto !important;
                        bottom: 3% !important;
                        top: auto !important;
                        transform: translateX(-50%) scale(0.5) !important;
                        transform-origin: center center !important;
                        z-index: 1 !important;
                        opacity: 0.85 !important;
                    }
                }
            `}</style>

            <canvas
                ref={canvasRef}
                className="no-blend"
                style={{
                    width: '750px',
                    maxWidth: '100vw',
                    height: 'auto',
                    objectFit: 'contain',
                    mixBlendMode: 'screen',
                    opacity: isReady ? 0.9 : 0,
                    transition: 'opacity 0.3s ease-in',
                    filter: 'drop-shadow(0 0 40px rgba(234, 153, 153, 0.4)) contrast(1.2) brightness(1.2)',
                }}
            />
        </div>
    );
};

export default ScrollCoin;
