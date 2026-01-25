import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Compass,
    Wallet,
    Trophy,
    History,
    LogOut,
    Zap
} from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../ui/Avatar';
import { formatNumber } from '../ui/PriceChange';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/history', icon: History, label: 'History' },
];

export const Sidebar: React.FC = () => {
    const { user, signOut } = useAuthStore();
    const location = useLocation();

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            backgroundColor: '#0a0a0a',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{ 
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Zap size={20} color="#000" fill="#000" />
                </div>
                <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                }}>
                    Nombre
                </span>
            </div>

            {/* User Balance Card */}
            {user && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.15) 0%, rgba(234, 153, 153, 0.05) 100%)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(234, 153, 153, 0.2)',
                }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
                    }}>
                        Available Balance
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '0.25rem',
                    }}>
                        {formatNumber(user.nmbr_balance)}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#EA9999',
                        fontWeight: 500,
                    }}>
                        NMBR Tokens
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                }}>
                    {navItems.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname === path;

                        return (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '10px',
                                        textDecoration: 'none',
                                        color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                        backgroundColor: isActive ? 'rgba(234, 153, 153, 0.12)' : 'transparent',
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.15s ease',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                        }
                                    }}
                                >
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '20px',
                                            backgroundColor: '#EA9999',
                                            borderRadius: '0 2px 2px 0',
                                        }} />
                                    )}
                                    <Icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                                    {label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            {user && (
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '1.25rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '10px',
                        transition: 'background 0.15s ease',
                    }}>
                        <Avatar src={user.avatar_url} alt={user.display_name} fallback={user.display_name} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#fff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {user.display_name || 'User'}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                            }}>
                                {user.rank ? `Rank #${user.rank}` : 'Unranked'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(252, 165, 165, 0.3)';
                            e.currentTarget.style.color = '#fca5a5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        }}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
};
