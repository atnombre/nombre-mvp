import React, { useEffect, useRef } from 'react';

interface ScrollScaleImageProps {
    src: string;
    alt: string;
    style?: React.CSSProperties;
    className?: string;
}

const ScrollScaleImage: React.FC<ScrollScaleImageProps> = ({ src, alt, style, className }) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!imgRef.current) return;

            const rect = imgRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;

            const dist = Math.abs(viewportCenter - elementCenter);
            const safeZone = viewportHeight * 0.25;
            const fadeZone = viewportHeight * 0.5;

            let progress;
            if (dist < safeZone) {
                progress = 1;
            } else {
                const excess = dist - safeZone;
                progress = 1 - (excess / fadeZone);
                progress = Math.max(0, Math.min(1, progress));
            }

            const minScale = 0.8;
            const maxScale = 1.0;
            const currentScale = minScale + (maxScale - minScale) * progress;
            const minOpacity = 0.6;
            const currentOpacity = minOpacity + (1 - minOpacity) * progress;

            imgRef.current.style.transform = `scale(${currentScale})`;
            imgRef.current.style.opacity = `${currentOpacity}`;
            imgRef.current.style.filter = `blur(${Math.max(0, (1 - progress) * 10)}px)`;
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            marginTop: '4rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            perspective: '1000px',
        }}>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={className}
                style={{
                    ...style,
                    transition: 'transform 0.1s ease-out, opacity 0.1s ease-out, filter 0.1s ease-out',
                    willChange: 'transform, opacity, filter',
                }}
            />
        </div>
    );
};

export default ScrollScaleImage;
