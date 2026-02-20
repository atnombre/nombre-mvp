import React, { useEffect, useRef } from 'react';

// Use standard glob import to get module paths or modules
// In Vite, eager: true returns { 'path': module }
const frameModules = import.meta.glob('../assets/coin_frames/*.webp', { eager: true });

// Extract the default exports (the image paths) and sort them
// Sorting is critical: frame_000, frame_001 etc.
const frameKeys = Object.keys(frameModules).sort();
const framePaths = frameKeys.map(key => (frameModules[key] as any).default);

const ScrollCoin: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const totalFrames = framePaths.length;
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Preload images into memory (Required for both modes now)
    useEffect(() => {
        // Create full image set
        imagesRef.current = framePaths.map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        // Initial draw after first image loads
        const firstImg = imagesRef.current[0];
        if (firstImg) {
            firstImg.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = firstImg.naturalWidth || 500;
                canvas.height = firstImg.naturalHeight || 500;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(firstImg, 0, 0);
            };
        }
    }, []);

    // Mobile Auto-Play Loop
    useEffect(() => {
        if (!isMobile) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let requestId: number;
        let lastTime = 0;
        let frameIndex = 0;
        const fps = 24; // Cinematic 24fps
        const interval = 1000 / fps;

        canvas.style.opacity = '0.9';

        const render = (time: number) => {
            const deltaTime = time - lastTime;

            if (deltaTime >= interval) {
                lastTime = time - (deltaTime % interval);

                const img = imagesRef.current[frameIndex];
                if (img && img.complete) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }

                frameIndex = (frameIndex + 1) % totalFrames;
            }

            requestId = requestAnimationFrame(render);
        };

        requestId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(requestId);
    }, [isMobile, totalFrames]);

    // Desktop Scroll Loop
    useEffect(() => {
        if (isMobile) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let requestId: number;

        const render = () => {
            const scrollY = window.scrollY;
            const speedFactor = 0.5;
            const frameIndex = Math.floor(scrollY * speedFactor) % totalFrames;

            const fadeStart = 200;
            const fadeEnd = 600;
            const opacity = Math.max(0, Math.min(1, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)));

            if (canvas) {
                canvas.style.opacity = (opacity * 0.9).toString();
            }

            const img = imagesRef.current[frameIndex];

            if (img && img.complete) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }

            requestId = requestAnimationFrame(render);
        };

        requestId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(requestId);
    }, [isMobile, totalFrames]);

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
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
            }}
            className="scroll-coin-container"
        >
            <style>{`
                @media (max-width: 768px) {
                    .scroll-coin-container {
                        transform: translateX(-50%) scale(0.6) !important;
                        bottom: -35% !important;
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
                    opacity: 0.9,
                    transition: 'opacity 0.1s linear',
                    filter: 'drop-shadow(0 0 40px rgba(234, 153, 153, 0.4)) contrast(1.2) brightness(1.2)',
                }}
            />
        </div>
    );
};

export default ScrollCoin;
