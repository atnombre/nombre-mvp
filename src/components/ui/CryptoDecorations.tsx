import React from 'react';
import './CryptoDecorations.css';

const CryptoDecorations: React.FC = () => {
    return (
        <div className="crypto-decorations">
            {/* Ambient Scan Line - Removed per user request */}

            {/* Corner Markers */}
            <div className="corner-bracket top-left" />
            <div className="corner-bracket bottom-right" />

            {/* System Status - Removed per user request */}

            {/* Side Coordinates - Removed per user request */}
        </div>
    );
};

export default CryptoDecorations;
