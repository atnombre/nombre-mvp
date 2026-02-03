import React, { useRef, useEffect, useState } from 'react';

interface LiquidTextProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const LiquidText: React.FC<LiquidTextProps> = ({ children, className = '', id = 'liquid-filter' }) => {
    const [filterValues, setFilterValues] = useState({ freqX: 0.001, freqY: 0.001, scale: 0 });
    const textRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>();
    const targetRef = useRef({ freqX: 0.001, freqY: 0.001, scale: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!textRef.current) return;
            const rect = textRef.current.getBoundingClientRect();

            // Check if mouse is near or inside the text area
            const isHovering =
                e.clientX >= rect.left - 50 &&
                e.clientX <= rect.right + 50 &&
                e.clientY >= rect.top - 50 &&
                e.clientY <= rect.bottom + 50;

            if (isHovering) {
                // Calculate intensity based on movement speed or position
                // For now, let's just make it "excited" when hovering
                targetRef.current = {
                    freqX: 0.02,
                    freqY: 0.05,
                    scale: 15
                };
            } else {
                targetRef.current = {
                    freqX: 0.001,
                    freqY: 0.001,
                    scale: 0
                };
            }
        };

        const animate = () => {
            setFilterValues(prev => ({
                freqX: prev.freqX + (targetRef.current.freqX - prev.freqX) * 0.1,
                freqY: prev.freqY + (targetRef.current.freqY - prev.freqY) * 0.1,
                scale: prev.scale + (targetRef.current.scale - prev.scale) * 0.1
            }));
            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
            {/* SVG Filter Definition */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id={id}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency={`${filterValues.freqX} ${filterValues.freqY}`}
                            numOctaves="1"
                            result="warp"
                        />
                        <feDisplacementMap
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale={filterValues.scale}
                            in="SourceGraphic"
                            in2="warp"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Content with Filter Applied */}
            <div
                ref={textRef}
                style={{ filter: `url(#${id})` }}
            >
                {children}
            </div>
        </div>
    );
};

export default LiquidText;
