import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Header: React.FC = () => {
    const navigate = useNavigate()
    const { signIn, isAuthenticated } = useAuthStore()
    const [isSigningIn, setIsSigningIn] = useState(false)

    const handleSignUp = async () => {
        setIsSigningIn(true)
        try {
            await signIn()
            // Redirect happens in auth callback
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

    // If already authenticated, redirect to dashboard
    const goToDashboard = () => {
        navigate('/dashboard')
    }

    return (
        <header
            style={{
                position: 'fixed',
                top: '40px', // below ticker
                left: 0,
                width: '100%',
                height: '72px',
                zIndex: 40,
                pointerEvents: 'auto',
                display: 'flex',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(10, 10, 10, 0.5)',
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
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: isAuthenticated ? 'pointer' : 'default',
                    }}
                    onClick={() => isAuthenticated ? goToDashboard() : null}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Zap size={18} color="#000" fill="#000" />
                    </div>
                    <span style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                    }}>
                        Nombre
                    </span>
                </div>

                {/* Auth actions */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    {isAuthenticated ? (
                        // Authenticated - show dashboard button
                        <button
                            onClick={goToDashboard}
                            style={{
                                padding: '0.55rem 1.25rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                                color: '#fff',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 2px 8px rgba(234, 153, 153, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 153, 153, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 153, 153, 0.25)';
                            }}
                        >
                            Go to Dashboard
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
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                    transition: 'all 0.15s ease',
                                    cursor: isSigningIn ? 'not-allowed' : 'pointer',
                                    opacity: isSigningIn ? 0.5 : 1,
                                    padding: '0.5rem 0.75rem',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                            >
                                Log In
                            </button>

                            {/* Sign Up */}
                            <button
                                onClick={handleSignUp}
                                disabled={isSigningIn}
                                aria-label="Sign Up"
                                style={{
                                    padding: '0.55rem 1.25rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                                    color: '#fff',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: isSigningIn ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 2px 8px rgba(234, 153, 153, 0.25)',
                                    opacity: isSigningIn ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 153, 153, 0.35)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 153, 153, 0.25)';
                                }}
                                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(0.98)')}
                                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px) scale(1)')}
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
