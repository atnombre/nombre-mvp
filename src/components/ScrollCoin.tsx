import React, { useEffect, useRef, useState } from 'react';

// Static placeholder - loads immediately with high priority
import coinPlaceholder from '../assets/coin_frames/frame_000_delay-0.033s.webp';

// Lazy-loaded frame modules - only fetched when needed
const frameModules = import.meta.glob('../assets/coin_frames/*.webp', { eager: false });
const frameKeys = Object.keys(frameModules).sort();

const ScrollCoin: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [totalFrames, setTotalFrames] = useState(0);

    // Step 1: Load frames shortly after mount (small delay to not block LCP)
    useEffect(() => {
        const loadFrames = async () => {
            try {
                // Import all modules lazily
                const modules = await Promise.all(
                    frameKeys.map(key => frameModules[key]())
                );

                // Extract paths and create Image elements
                const paths = modules.map((mod: any) => mod.default);

                const images = paths.map((src: string) => {
                    const img = new Image();
                    img.src = src;
                    return img;
                });

                imagesRef.current = images;
                setTotalFrames(images.length);

                // Wait for first image to load before marking ready
                const firstImg = images[0];
                if (firstImg) {
                    if (firstImg.complete) {
                        initCanvas(firstImg);
                        setIsReady(true);
                    } else {
                        firstImg.onload = () => {
                            initCanvas(firstImg);
                            setIsReady(true);
                        };
                    }
                }
            } catch (error) {
                console.error('Failed to load coin frames:', error);
            }
        };

        const initCanvas = (img: HTMLImageElement) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.naturalWidth || 500;
            canvas.height = img.naturalHeight || 500;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };

        // Load frames after a small delay (100ms) to not block initial render
        const timer = setTimeout(loadFrames, 100);
        return () => clearTimeout(timer);
    }, []);

    // Step 2: Scroll animation loop (only when ready)
    useEffect(() => {
        if (!isReady || totalFrames === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let requestId: number;
        let autoFrameIndex = 0;
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();

        const render = () => {
            const scrollY = window.scrollY;
            const now = Date.now();

            // Check if user is actively scrolling
            const isScrolling = scrollY !== lastScrollY;
            if (isScrolling) {
                lastScrollY = scrollY;
                lastScrollTime = now;
            }

            // If not scrolled recently (500ms), auto-spin
            const timeSinceScroll = now - lastScrollTime;
            const shouldAutoSpin = timeSinceScroll > 500;

            let frameIndex: number;
            if (shouldAutoSpin) {
                // Auto-spin animation - ~30fps
                autoFrameIndex = (autoFrameIndex + 0.5) % totalFrames;
                frameIndex = Math.floor(autoFrameIndex);
            } else {
                // Scroll-based animation
                const speedFactor = 0.5;
                frameIndex = Math.floor(scrollY * speedFactor) % totalFrames;
                autoFrameIndex = frameIndex; // Sync auto-spin with scroll position
            }

            // Fade logic
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
    }, [isReady, totalFrames]);

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

            {/* Static placeholder - shown until frames are ready */}
            <img
                src={coinPlaceholder}
                alt=""
                fetchPriority="high"
                style={{
                    position: 'absolute',
                    width: '750px',
                    maxWidth: '100vw',
                    height: 'auto',
                    objectFit: 'contain',
                    mixBlendMode: 'screen',
                    opacity: isReady ? 0 : 0.9,
                    transition: 'opacity 0.5s ease-out',
                    filter: 'drop-shadow(0 0 40px rgba(234, 153, 153, 0.4)) contrast(1.2) brightness(1.2)',
                    pointerEvents: 'none',
                }}
            />

            {/* Canvas - fades in when ready */}
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
                    transition: 'opacity 0.5s ease-in',
                    filter: 'drop-shadow(0 0 40px rgba(234, 153, 153, 0.4)) contrast(1.2) brightness(1.2)',
                }}
            />
        </div>
    );
};

export default ScrollCoin;
