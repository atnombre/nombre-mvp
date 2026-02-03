import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
    // Refs for cursor elements
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const cursorRingRef = useRef<HTMLDivElement>(null);

    // Refs for tracking position and animation
    const mousePos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>();

    // State for hover effects
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            // Update dot (instant follow)
            if (cursorDotRef.current) {
                cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        };

        const handleHoverStart = () => setIsHovering(true);
        const handleHoverEnd = () => setIsHovering(false);

        // Handlers for no-blend elements (logos)
        const handleNoBlendStart = () => {
            if (cursorDotRef.current) cursorDotRef.current.classList.add('no-blend');
            if (cursorRingRef.current) cursorRingRef.current.classList.add('no-blend');
        };
        const handleNoBlendEnd = () => {
            if (cursorDotRef.current) cursorDotRef.current.classList.remove('no-blend');
            if (cursorRingRef.current) cursorRingRef.current.classList.remove('no-blend');
        };

        // Mutation Observer to handle dynamic elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    attachListeners();
                }
            });
        });

        const attachListeners = () => {
            // Interactive elements
            const interactiveElements = document.querySelectorAll('a, button, input, [role="button"], .interactive');
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverStart);
                el.removeEventListener('mouseleave', handleHoverEnd);
                el.addEventListener('mouseenter', handleHoverStart);
                el.addEventListener('mouseleave', handleHoverEnd);
            });

            // No-blend elements
            const noBlendElements = document.querySelectorAll('.no-blend');
            noBlendElements.forEach(el => {
                el.removeEventListener('mouseenter', handleNoBlendStart);
                el.removeEventListener('mouseleave', handleNoBlendEnd);
                el.addEventListener('mouseenter', handleNoBlendStart);
                el.addEventListener('mouseleave', handleNoBlendEnd);
            });
        };

        // Animation loop for ring (smooth follow)
        const animate = () => {
            // Linear interpolation (lerp) for smoothing
            // Move ring 10% of the way towards mouse per frame (Smoother/More Lag)
            const ease = 0.1;

            ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
            ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

            if (cursorRingRef.current) {
                cursorRingRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
            }

            rafId.current = requestAnimationFrame(animate);
        };

        // Init
        window.addEventListener('mousemove', handleMouseMove);
        observer.observe(document.body, { childList: true, subtree: true });
        attachListeners();
        animate();
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
            document.body.style.cursor = 'auto';
            observer.disconnect();

            // Cleanup listeners
            const interactiveElements = document.querySelectorAll('a, button, input, [role="button"], .interactive');
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverStart);
                el.removeEventListener('mouseleave', handleHoverEnd);
            });
            const noBlendElements = document.querySelectorAll('.no-blend');
            noBlendElements.forEach(el => {
                el.removeEventListener('mouseenter', handleNoBlendStart);
                el.removeEventListener('mouseleave', handleNoBlendEnd);
            });
        };
    }, []);

    return (
        <>
            <style>{`
                .custom-cursor-dot, .custom-cursor-ring {
                    position: fixed;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 9999;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    will-change: transform;
                    mix-blend-mode: difference; 
                    transition: opacity 0.3s ease;
                }
                
                /* The Dot */
                .custom-cursor-dot {
                    width: 6px;
                    height: 6px;
                    background-color: white;
                    margin-top: -3px;
                    margin-left: -3px;
                }

                /* The Ring */
                .custom-cursor-ring {
                    width: 20px;
                    height: 20px;
                    background-color: white;
                    border: none;
                    transition: width 0.3s ease, height 0.3s ease, transform 0.1s linear, background-color 0.3s ease;
                    margin-top: -10px;
                    margin-left: -10px;
                }

                /* Hover State (Glassy/Normal) */
                .custom-cursor-ring.hovering {
                    width: 30px;
                    height: 30px;
                    margin-top: -15px;
                    margin-left: -15px;
                    mix-blend-mode: normal; 
                    background-color: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                /* No-Blend State (For Logos) */
                /* Force normal blend mode and solid white so it looks clean over colored logos */
                .custom-cursor-dot.no-blend {
                    mix-blend-mode: normal !important;
                    background-color: white !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5); /* separation */
                }
                .custom-cursor-ring.no-blend {
                    mix-blend-mode: normal !important;
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    border: 1px solid rgba(255,255,255,0.5);
                }

                *:not(body) {
                    cursor: none !important;
                }

                @media (hover: none) and (pointer: coarse) {
                    .custom-cursor-dot, .custom-cursor-ring {
                        display: none !important;
                    }
                    *:not(body) {
                        cursor: auto !important;
                    }
                    body {
                        cursor: auto !important;
                    }
                }
            `}</style>

            <div
                ref={cursorDotRef}
                className="custom-cursor-dot"
            />
            <div
                ref={cursorRingRef}
                className={`custom-cursor-ring ${isHovering ? 'hovering' : ''}`}
            />
        </>
    );
};

export default CustomCursor;
