import React from 'react'
import logo from '../assets/logo.png'

const Header: React.FC = () => {
    return (
        <header
            style={{
                position: 'fixed',
                top: '40px', // below ticker
                left: 0,
                width: '100%',
                height: '80px',
                zIndex: 40,
                pointerEvents: 'auto',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            {/* Inner container for proper alignment */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={logo}
                        alt="Nombre Logo"
                        style={{
                            height: '32px',
                            filter: 'brightness(1.15)',
                        }}
                    />
                </div>

                {/* Auth actions */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                    }}
                >
                    {/* Log In */}
                    <a
                        href="#"
                        aria-label="Log In"
                        style={{
                            textDecoration: 'none',
                            color: '#FFFFFF',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '0.85rem',
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            transition: 'opacity 0.2s ease',
                            outline: 'none', // Focus handled by styles below or global
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        onFocus={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onBlur={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                        Log In
                    </a>

                    {/* Sign Up */}
                    <button
                        aria-label="Sign Up"
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#EA9999',
                            color: '#FFFFFF',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 10px rgba(234, 153, 153, 0.2)',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E08888'; // Slightly darker
                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(234, 153, 153, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#EA9999';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(234, 153, 153, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 153, 153, 0.5)')}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(234, 153, 153, 0.2)';
                        }}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
