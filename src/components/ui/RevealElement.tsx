import React, { useState, useEffect, useRef } from 'react';

interface RevealElementProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}

const RevealElement: React.FC<RevealElementProps> = ({ children, delay = 0, style }) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={elementRef} style={{
            ...style,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            filter: isVisible ? 'blur(0px)' : 'blur(10px)',
            transition: `opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)`,
            transitionDelay: `${delay}ms`,
            willChange: 'opacity, transform, filter'
        }}>
            {children}
        </div>
    );
};

export default RevealElement;
