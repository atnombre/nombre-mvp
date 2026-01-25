import React, { useState } from 'react';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
}

// Generate a consistent gradient based on string
const getGradientFromString = (str: string): string => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        'linear-gradient(135deg, #3f51b1 0%, #5a55ae 100%)',
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

// Get initials from name
const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'Avatar',
    size = 'md',
    fallback,
}) => {
    const [imgError, setImgError] = useState(false);
    
    const sizeValues: Record<string, number> = {
        xs: 28,
        sm: 36,
        md: 44,
        lg: 52,
        xl: 72,
    };

    const pixelSize = sizeValues[size];
    const displayName = fallback || alt || '?';
    const initials = getInitials(displayName);
    const gradient = getGradientFromString(displayName);

    const styles: React.CSSProperties = {
        width: pixelSize,
        height: pixelSize,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

    const imgStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    const fallbackStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: gradient,
        fontSize: pixelSize * 0.35,
        fontWeight: 700,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    };

    if (src && !imgError) {
        return (
            <div style={styles}>
                <img 
                    src={src} 
                    alt={alt} 
                    style={imgStyles} 
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }

    return (
        <div style={styles}>
            <div style={fallbackStyles}>{initials}</div>
        </div>
    );
};
