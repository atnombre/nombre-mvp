import React, { useEffect, useRef } from 'react';

interface InteractiveGridProps {
    color?: string;           // Color of the grid lines (e.g., "#00f0ff")
    backgroundColor?: string; // Background color of the canvas
    opacity?: number;         // Base opacity of lines (0.0 to 1.0)
    lineWidth?: number;       // Thickness of the lines
    spacing?: number;         // Spacing between grid lines (px)
    glowRadius?: number;      // Radius of the glow effect around cursor
    fadeEffect?: boolean;     // If true, grid fades out entirely away from cursor
}

const InteractiveGrid: React.FC<InteractiveGridProps> = ({
    color = '#00f0ff',
    backgroundColor = '#111',
    opacity = 0.3,
    lineWidth = 1,
    spacing = 40,
    glowRadius = 300,
    fadeEffect = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const cursorRef = useRef({ x: -1000, y: -1000 });
    const trailingCursorRef = useRef({ x: -1000, y: -1000 });

    // Helper to convert hex to rgb for easy alpha manipulation
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgb = hexToRgb(color) || { r: 0, g: 240, b: 255 };

    // Track mouse without re-rendering component
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const animate = () => {
            // Smoothly interpolate trailing cursor towards actual cursor
            const dx = cursorRef.current.x - trailingCursorRef.current.x;
            const dy = cursorRef.current.y - trailingCursorRef.current.y;

            // 0.1 factor adds the "delay" / smoothness weight
            trailingCursorRef.current.x += dx * 0.1;
            trailingCursorRef.current.y += dy * 0.1;

            // Use the trailing value for drawing
            drawEfficiently(ctx, canvas.width, canvas.height, trailingCursorRef.current);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [color, backgroundColor, opacity, lineWidth, spacing, glowRadius, fadeEffect]);

    const drawEfficiently = (ctx: CanvasRenderingContext2D, width: number, height: number, currentCursor: { x: number, y: number }) => {
        ctx.clearRect(0, 0, width, height);

        // 1. Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Base Grid (dim or invisible)
        ctx.beginPath();
        // Only draw base grid if opacity > 0
        if (opacity > 0) {
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.lineWidth = lineWidth;

            for (let x = 0; x <= width; x += spacing) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y <= height; y += spacing) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        // 3. Draw Active Grid Segments (variable width "pop up" effect)
        const startX = Math.floor((currentCursor.x - glowRadius) / spacing) * spacing;
        const endX = Math.ceil((currentCursor.x + glowRadius) / spacing) * spacing;

        const startY = Math.floor((currentCursor.y - glowRadius) / spacing) * spacing;
        const endY = Math.ceil((currentCursor.y + glowRadius) / spacing) * spacing;

        ctx.lineCap = 'round';

        // Vertical Lines "Pop Up"
        for (let x = startX; x <= endX; x += spacing) {
            if (x < 0 || x > width) continue;

            const dx = Math.abs(x - currentCursor.x);

            if (dx < glowRadius) {
                const dy = Math.sqrt(glowRadius * glowRadius - dx * dx);
                const y1 = currentCursor.y - dy;
                const y2 = currentCursor.y + dy;

                const proximityFactor = 1 - (dx / glowRadius);
                const activeWidth = lineWidth + (1.5 * proximityFactor);

                const grad = ctx.createLinearGradient(x, y1, x, y2);
                grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
                grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

                ctx.beginPath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = activeWidth;
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
            }
        }

        // Horizontal Lines "Pop Up"
        for (let y = startY; y <= endY; y += spacing) {
            if (y < 0 || y > height) continue;

            const dy = Math.abs(y - currentCursor.y);

            if (dy < glowRadius) {
                const dx = Math.sqrt(glowRadius * glowRadius - dy * dy);
                const x1 = currentCursor.x - dx;
                const x2 = currentCursor.x + dx;

                const proximityFactor = 1 - (dy / glowRadius);
                const activeWidth = lineWidth + (1.5 * proximityFactor);

                const grad = ctx.createLinearGradient(x1, y, x2, y);
                grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
                grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

                ctx.beginPath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = activeWidth;
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            }
        }
    };

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1, // Behind everything
                width: '100%',
                height: '100%',
            }}
        />
    );
};

export default InteractiveGrid;
