import React, { useEffect, useRef } from 'react';

const StickyScrollSection: React.FC = () => {
    const trackRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!trackRef.current || !textRef.current) return;

            const rect = trackRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate progress through the "sticky" track (300vh total)
            const scrollDistance = rect.height - viewportHeight;
            let progress = -rect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));

            // 1. Text Animation: Fade out & Blur faster (0% -> 95%)
            const textPhase = Math.min(1, progress / 0.95);
            const blurVal = textPhase * 20;
            const opacityVal = 1 - textPhase;
            const scaleVal = 1 - (textPhase * 0.1);

            textRef.current.style.filter = `blur(${blurVal}px)`;
            textRef.current.style.opacity = `${opacityVal}`;
            textRef.current.style.transform = `translate(-50%, -50%) scale(${scaleVal})`;
            textRef.current.style.pointerEvents = opacityVal < 0.1 ? 'none' : 'auto';


            // 3. Line Animation (Fade out when scrolling deep)
            if (lineRef.current) {
                // Only handle fading OUT based on scroll progress
                // The IntersectionObserver in JSX handles the initial fade IN + growth
                if (progress > 0.5) {
                    lineRef.current.style.opacity = '0';
                } else {
                    // Let the Observer control opacity when we are at the top (progress < 0.1)
                    // But we ensure it's not somehow stuck at 0 if we scroll back up
                    // We don't force '1' here to avoid fighting the Observer's initial entry logic
                    // Actually, if we scroll back up, progress goes to 0.
                    // The Observer might still say "intersecting" -> opacity 1.
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={trackRef} style={{
            height: '130vh',
            width: '100%',
            position: 'relative',
        }}>
            {/* Sticky Viewport */}
            <div style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                width: '100%',
                overflow: 'hidden',
            }}>

                {/* --- LAYER 1: TEXT (Blurs Out) --- */}
                <div ref={textRef} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: '1000px',
                    textAlign: 'center',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    willChange: 'opacity, filter, transform',
                }}>
                    {/* Minimal Vertical Design */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '2rem',
                    }}>
                        {/* Scroll-Triggered Growing Line */}
                        <div ref={(el) => {
                            // Assign both ref for scroll-fade logic AND observer for grow logic
                            (lineRef as React.MutableRefObject<HTMLDivElement | null>).current = el;

                            if (!el) return;
                            const observer = new IntersectionObserver(([entry]) => {
                                if (entry.isIntersecting) {
                                    el.style.height = '80px'; // Grow when visible
                                    el.style.opacity = '1';
                                } else {
                                    el.style.height = '0px';  // Reset
                                    el.style.opacity = '0.5';
                                }
                            }, { threshold: 0.5 });
                            observer.observe(el);
                        }} style={{
                            width: '2px',
                            height: '0px',
                            background: 'linear-gradient(to bottom, transparent, #EA9999)',
                            marginBottom: '1.5rem',
                            transition: 'height 1.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
                            opacity: 0.5,
                        }} />

                        <span style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1.15rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            background: 'linear-gradient(90deg, #FFFFFF, #EA9999)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 600,
                        }}>
                            How it works
                        </span>
                    </div>
                    <h2 style={{
                        fontFamily: 'Geist, sans-serif',
                        fontSize: 'clamp(3rem, 5vw, 3.5rem)',
                        fontWeight: 400,
                        lineHeight: '1.1',
                        color: '#EDEDED',
                        letterSpacing: '-0.04em',
                        maxWidth: '1500px',
                        width: '100%',
                        margin: '0 auto',
                    }}>
                        3 simple steps – everything you need <br />
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>to know about our work</span>
                    </h2>
                </div>


            </div>
        </div>
    );
};

export default StickyScrollSection;
