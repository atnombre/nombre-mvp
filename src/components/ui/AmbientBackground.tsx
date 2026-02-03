import React from 'react';
import './AmbientBackground.css';

const AmbientBackground: React.FC = () => {
    return (
        <div className="ambient-container">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="noise-overlay" />
        </div>
    );
};

export default AmbientBackground;
