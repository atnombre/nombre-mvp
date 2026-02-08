import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import logo from '../assets/logo.png'

const Header: React.FC = () => {
    const navigate = useNavigate()
    const { signIn, isAuthenticated } = useAuthStore()
    const [isSigningIn, setIsSigningIn] = useState(false)

    const handleSignUp = async () => {
        setIsSigningIn(true)
        try {
            await signIn()
        } catch (error) {
            console.error('Sign in failed:', error)
            setIsSigningIn(false)
        }
    }

    const handleLogIn = async () => {
        setIsSigningIn(true)
        try {
            await signIn()
        } catch (error) {
            console.error('Log in failed:', error)
            setIsSigningIn(false)
        }
    }

    const goToDashboard = () => {
        navigate('/dashboard')
    }

    return (
        <header
            style={{
                position: 'fixed',
                top: '55px',
                left: 0,
                width: '100%',
                zIndex: 50,
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'center',
                paddingLeft: '10px',  // Safety margin for very small screens
                paddingRight: '10px', // Safety margin for very small screens
                boxSizing: 'border-box' // Include padding in width
            }}
        >
            {/* Floating Pill Container */}
            <div
                style={{
                    pointerEvents: 'auto',
                    minWidth: 'unset',
                    width: 'min(95vw, 1150px)', // Robust width capping
                    margin: '0 auto', // Centering strategy part 1

                    padding: '0.6rem 1rem', // Base padding
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',

                    background: 'rgba(5, 5, 5, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
                className="responsive-pill"
            >
                {/* Mobile header fix */}
                <style>{`
                    @media (max-width: 768px) {
                        .responsive-pill {
                            width: calc(100vw - 40px) !important;
                            padding: 0.5rem 0.75rem !important;
                        }
                        .responsive-pill .shimmer-button {
                            padding: 0.5rem 1rem !important;
                            font-size: 0.8rem !important;
                        }
                        .auth-actions {
                            gap: 0.75rem !important;
                        }
                    }
                `}</style>
                {/* Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => isAuthenticated ? goToDashboard() : navigate('/')}
                >
                    {/* Fallback to Zap if logo image fails, or use both. Using logo.png as per landing repo */}
                    <img
                        src={logo}
                        alt="Nombre Logo"
                        className="nav-logo no-blend"
                        style={{ height: '42px', width: 'auto' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Could show fallback Zap icon here if needed
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
                    className="auth-actions"
                >
                    {isAuthenticated ? (
                        <button
                            onClick={goToDashboard}
                            className="shimmer-button"
                            style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
                        >
                            Dashboard
                        </button>
                    ) : (
                        <>
                            {/* Log In */}
                            <button
                                onClick={handleLogIn}
                                disabled={isSigningIn}
                                aria-label="Log In"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    textDecoration: 'none',
                                    color: '#FFFFFF',
                                    fontFamily: "'Geist', sans-serif",
                                    fontSize: '0.85rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.01em',
                                    transition: 'opacity 0.2s ease',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    opacity: isSigningIn ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                                Log In
                            </button>

                            {/* Sign Up */}
                            <button
                                className="shimmer-button"
                                onClick={handleSignUp}
                                disabled={isSigningIn}
                                aria-label="Sign Up"
                                style={{ opacity: isSigningIn ? 0.5 : 1 }}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
