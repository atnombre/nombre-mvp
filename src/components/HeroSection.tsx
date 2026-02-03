import React from 'react';
import { motion } from 'framer-motion'; // Using framer-motion compatibility from 'motion' package
import HeroCTAButton from './ui/HeroCTAButton';
import TextRotator from './ui/TextRotator';
import ScrollCoin from './ScrollCoin';
import { useAuthStore } from '../stores/authStore';

const HeroSection: React.FC = () => {
    const { signIn } = useAuthStore();

    const handleGetStarted = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error("Auth error", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15,
                mass: 1.2
            } as const
        }
    };

    return (
        <main style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
            background: 'transparent',
        }}>
            {/* Hero Content Wrapper */}
            <div style={{
                position: 'relative',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop: '80px',
                paddingBottom: '100px'
            }}>
                {/* Hero Content Layer */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{
                            width: '100%',
                            maxWidth: '1150px',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        className="responsive-padding"
                    >
                        <motion.h1
                            variants={itemVariants}
                            style={{
                                fontSize: '6.6rem',
                                fontWeight: 700,
                                lineHeight: '1.1',
                                letterSpacing: '-0.03em',
                                color: '#FFFFFF',
                                margin: 0,
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                            }}
                            className="hero-title"
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap', justifyContent: 'center' }}>
                                Stop
                                <span style={{ width: '0.3em' }} /> {/* Gap */}
                                <TextRotator
                                    words={["Scrolling", "Watching", "Binging", "Spectating"]}
                                    style={{ display: 'block' }}
                                />
                                <span style={{ marginLeft: '0.05em' }}>,</span> {/* Comma */}
                            </span> <br />
                            <span style={{
                                background: 'linear-gradient(to right, #EA9999, #FFD1C1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block',
                                padding: '0 0.2em 0.1em 0',
                            }}>
                                Start Investing.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '1.5rem',
                                color: '#FFFFFF',
                                marginTop: '1.5rem',
                                fontWeight: 500,
                                maxWidth: '600px',
                                lineHeight: '1.5',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Monetize your watch history with Nombre
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            style={{ marginTop: '2.5rem', pointerEvents: 'auto' }}
                        >
                            <HeroCTAButton label="Get Started" onClick={handleGetStarted} />
                        </motion.div>
                    </motion.div>
                </div>

                <ScrollCoin />
            </div>
        </main>
    );
};

export default HeroSection;
