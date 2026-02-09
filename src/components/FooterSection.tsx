import React from 'react';
import logo from '../assets/logo.png';

const FooterSection: React.FC = () => {
    return (
        <footer style={{
            width: '100%',
            background: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 10,
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1150px',
                margin: '0 auto',
                padding: '2rem 2rem 1rem 2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.09)',
                boxSizing: 'border-box',
            }}>
                {/* Main Content Info */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    paddingRight: '0',
                }} className="responsive-col responsive-gap">
                    {/* Brand Column */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="responsive-padding">
                        <img src={logo} alt="Nombre Logo" className="no-blend" style={{ height: '2.5rem', width: 'auto' }} />
                        <span style={{
                            fontFamily: 'Geist, sans-serif',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: '-0.03em',
                        }}>
                            Nombre
                        </span>
                    </div>

                    {/* Social Column */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="responsive-col responsive-gap">
                        {/* Social Icons */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '9px' }}>
                            {/* Twitter Icon */}
                            <a href="#" style={{ color: '#A1A1AA', transition: 'color 0.2s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EA9999'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* GitHub Icon */}
                            <a href="#" style={{ color: '#A1A1AA', transition: 'color 0.2s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EA9999'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0122 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                            {/* LinkedIn Icon */}
                            <a href="#" style={{ color: '#A1A1AA', transition: 'color 0.2s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EA9999'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>

                        {/* Interactive Pill */}
                        <a href="mailto:hello@nombre.com" style={{ textDecoration: 'none' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '100px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(10px)',
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
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                }}>
                                    Get in Touch
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#A1A1AA' }}>
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
