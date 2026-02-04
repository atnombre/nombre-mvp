import React from 'react';
import { motion } from 'framer-motion';
import card1 from '../assets/card-1.png';
import card2 from '../assets/card-2.png';
import card3 from '../assets/card-3.png';

const TradingSteps: React.FC = () => {
    const cards = [
        { src: card1, alt: "Step 1", text: "Discover creator trends." },
        { src: card2, alt: "Step 2", text: "Buy creator tokens in seconds." },
        { src: card3, alt: "Step 3", text: "Track performance. Grow your portfolio." },
    ];

    return (
        <section style={{
            position: 'relative',
            zIndex: 10,
            padding: '2rem 2rem 8rem 2rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8rem',
                maxWidth: '1150px',
                width: '100%',
            }} className="responsive-gap">
                <style>{`
                    @media (max-width: 768px) {
                        .responsive-gap { gap: 4rem !important; }
                    }
                `}</style>
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{
                            duration: 0.8,
                            delay: index * 0.2,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            width: '100%',
                        }}
                    >
                        <h3 style={{
                            fontFamily: 'Geist, sans-serif',
                            fontSize: 'clamp(2rem, 5vw, 3rem)', // Responsive clamp
                            fontWeight: 600,
                            color: '#FFFFFF',
                            marginBottom: '2rem',
                            letterSpacing: '-0.02em',
                        }}>
                            {card.text}
                        </h3>

                        <img
                            src={card.src}
                            alt={card.alt}
                            className="no-blend"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default TradingSteps;
