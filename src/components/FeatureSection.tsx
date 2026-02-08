import React from 'react';

import RevealElement from './ui/RevealElement';
import StickyScrollSection from './StickyScrollSection';
import ScrollScaleImage from './ui/ScrollScaleImage';
import portfolioPreview from '../assets/portfolio-preview.png'; // Adjusted import

const FeatureSection: React.FC = () => {
    return (
        <section style={{
            minHeight: 'auto',
            width: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '1rem 1.5rem 0rem 1.5rem',
            position: 'relative',
            zIndex: 10,
            boxSizing: 'border-box',
        }}>
            {/* Mobile margin reduction - handled via CSS */}
            <style>{`
                @media (max-width: 768px) {
                    .feature-header { margin-top: 4rem !important; }
                }
            `}</style>
            {/* Top Header Content */}
            <div style={{
                textAlign: 'center',
                marginBottom: '4rem',
                marginTop: '20rem',
                maxWidth: '1150px',
                padding: '0 1rem',
            }} className="feature-header">
                <RevealElement delay={0}>
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', // Responsive clamp
                        fontWeight: 700,
                        color: 'white',
                        fontFamily: 'Geist, sans-serif',
                        lineHeight: '1.2',
                        margin: 0,
                        display: 'block',
                    }}>
                        Don't just spot the next big thing,
                    </h2>
                </RevealElement>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                }} className="responsive-col">
                    <RevealElement delay={200}>
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', // Responsive clamp
                            fontWeight: 700,
                            color: 'white',
                            fontFamily: 'Geist, sans-serif',
                            lineHeight: '1.2',
                            margin: 0,
                            display: 'block',
                        }}>
                            own a piece of it with
                        </h2>
                    </RevealElement>

                    <RevealElement delay={400}>
                        <h2 style={{
                            fontSize: 'clamp(4rem, 15vw, 8rem)', // Massive clamp for hero text
                            fontWeight: 800,
                            color: '#EA9999',
                            fontFamily: 'Geist, sans-serif',
                            lineHeight: '1',
                            margin: 0,
                            display: 'block',
                            letterSpacing: '-0.04em'
                        }}>
                            Nombre.
                        </h2>
                    </RevealElement>
                </div>

                <ScrollScaleImage
                    src={portfolioPreview}
                    alt="Portfolio Preview"
                    className="no-blend"
                    style={{
                        maxWidth: '90%',
                        borderRadius: '24px',
                        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                />
            </div>

            {/* Sticky Interaction Section */}
            <StickyScrollSection />

        </section>
    );
};

export default FeatureSection;
