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

    // Preload images into memory
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

                // Set canvas size to match image aspect ratio or fixed size
                // Using image natural size for best quality
                canvas.width = firstImg.naturalWidth || 500;
                canvas.height = firstImg.naturalHeight || 500;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(firstImg, 0, 0);
            };
        }
    }, []);

    // Scroll Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let requestId: number;

        const render = () => {
            const scrollY = window.scrollY;

            // Map scroll to frame index
            // Speed factor controls how "fast" it spins relative to scroll
            // 0.2 means 1 frame every 5 pixels scrolled
            const speedFactor = 0.5;
            const frameIndex = Math.floor(scrollY * speedFactor) % totalFrames;

            // Fade Logic: Start fading at 200px, completely invisible by 600px
            const fadeStart = 200;
            const fadeEnd = 600;
            const opacity = Math.max(0, Math.min(1, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)));

            // Apply opacity directly to canvas style for performance without re-render
            if (canvas) {
                // Base opacity is 0.9, so we multiply
                canvas.style.opacity = (opacity * 0.9).toString();
            }

            const img = imagesRef.current[frameIndex];

            if (img && img.complete) {
                // Determine dimensions based on canvas
                // clear
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw
                // We can center it or fill. Assuming frame is self-contained.
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }

            requestId = requestAnimationFrame(render);
        };

        requestId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(requestId);
    }, [totalFrames]);

    return (
        <div
            style={{
                position: 'absolute', // Changed from fixed to absolute for sticky container support
                top: 'auto',
                bottom: '-45%', // Shifted even lower as requested
                left: '50%',
                right: 'auto',
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center', // Align center
                alignItems: 'center',
                width: 'auto',
                height: 'auto',
                zIndex: 1, // Lower z-index to sit behind text/button (which is z-index 2)
                pointerEvents: 'none',
                backgroundColor: '#050505', // Match InteractiveGrid background
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
            }}
            className="scroll-coin-container" // Hook for CSS media query scaling if needed
        >
            <style>{`
                @media (max-width: 768px) {
                    .scroll-coin-container {
                        transform: translateX(-50%) scale(0.6) !important;
                        bottom: -35% !important; /* Adjust position for scaled down version */
                    }
                }
            `}</style>
            <canvas
                ref={canvasRef}
                className="no-blend" // Prevents cursor color inversion
                style={{
                    width: '750px', // Increased size as requested
                    maxWidth: '100vw',
                    height: 'auto',
                    objectFit: 'contain',
                    // Blending Effects
                    mixBlendMode: 'screen',
                    opacity: 0.9, // Initial opacity (controlled by JS loop)
                    transition: 'opacity 0.1s linear', // Smooth transition logic
                    filter: 'drop-shadow(0 0 40px rgba(234, 153, 153, 0.4)) contrast(1.2) brightness(1.2)',
                }}
            />
        </div>
    );
};

export default ScrollCoin;
