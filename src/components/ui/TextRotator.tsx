import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextRotatorProps {
    words: string[];
    interval?: number;
    className?: string;
    style?: React.CSSProperties;
}

const TextRotator: React.FC<TextRotatorProps> = ({
    words,
    interval = 3000, // Slightly slower interval for better reading
    className = "",
    style = {}
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, interval);

        return () => clearInterval(timer);
    }, [words, interval]);

    return (
        <motion.span
            layout // Smoothly animate width and layout changes
            style={{
                display: 'inline-flex',
                position: 'relative',
                overflow: 'hidden',
                verticalAlign: 'top',
                height: '1.2em',
                perspective: '600px', // Enable 3D perspective for child rotation
                ...style
            }}
            className={className}
            transition={{
                type: "spring",
                stiffness: 700,
                damping: 30
            }}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={words[index]}
                    initial={{ rotateX: 90, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ rotateX: -90, opacity: 0, filter: 'blur(4px)' }}
                    transition={{
                        type: "spring",
                        stiffness: 120, // Lower stiffness = softer spring (was 300)
                        damping: 20,    // Balanced damping
                        mass: 1.2       // A bit more mass for "weighty" smooth feel
                    }}
                    style={{
                        whiteSpace: 'nowrap',
                        display: 'block',
                        position: 'relative',
                        transformOrigin: '50% 50% -20px' // Deeper pivot for smoother arc
                    }}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
};

export default TextRotator;
