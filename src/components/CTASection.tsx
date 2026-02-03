import React from 'react';
import HeroCTAButton from './ui/HeroCTAButton';
import LiquidText from './ui/LiquidText';
import { useAuthStore } from '../stores/authStore';

const CTASection: React.FC = () => {
    const { signIn } = useAuthStore();

    const handleStartInvesting = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error("Auth error", error);
        }
    };

    return (
        <section style={{
            minHeight: '60vh',
            width: '100%',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            boxSizing: 'border-box',
        }}>
            {/* Ambient background glow for this section */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'rgba(234, 153, 153, 0.03)',
                borderRadius: '50%',
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: -1,
            }}></div>

            {/* Standardized Content Wrapper */}
            <div style={{
                width: '100%',
                maxWidth: '1150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <h2 style={{
                    fontSize: '5rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '1.5rem',
                    lineHeight: '0.95',
                    letterSpacing: '-0.04em',
                    fontFamily: 'Geist, sans-serif',
                    maxWidth: '900px',
                }} className="section-title">
                    The Future of <br />
                    <LiquidText id="liquid-hero">
                        <span style={{ color: '#fff' }}>Influence is Liquid.</span>
                    </LiquidText>
                </h2>

                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.25rem',
                    color: '#A1A1AA',
                    lineHeight: '1.6',
                    marginBottom: '4rem',
                    maxWidth: '600px',
                    fontWeight: 400,
                }}>
                    Join the first exchange where culture is the currency. Monetize your watch history and invest in the creators shaping tomorrow.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '2rem',
                }} className="responsive-col responsive-gap">
                    <HeroCTAButton label="Start Investing" onClick={handleStartInvesting} />

                    <button style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '100px',
                        color: '#FFFFFF',
                        fontFamily: "'Geist', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 400,
                        cursor: 'pointer',
                        padding: '0.6rem 1.5rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        outline: 'none',
                        letterSpacing: '0.01em',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        View Demo
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
