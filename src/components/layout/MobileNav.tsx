import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Compass,
    Wallet,
    Trophy,
    History
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { path: '/history', icon: History, label: 'History' },
];

export const MobileNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70px',
            // Glass bottom navigation
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 0.5rem',
            zIndex: 1000,
            // Safe area for iPhone notch/home indicator
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
            {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;

                return (
                    <NavLink
                        key={path}
                        to={path}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: isActive ? '#EA9999' : 'rgba(255, 255, 255, 0.4)',
                            backgroundColor: isActive ? 'rgba(234, 153, 153, 0.1)' : 'transparent',
                            transition: 'all 0.15s ease',
                            minWidth: '60px',
                            // Pink glow for active
                            boxShadow: isActive ? '0 0 20px rgba(234, 153, 153, 0.15)' : 'none',
                        }}
                    >
                        <Icon
                            size={22}
                            strokeWidth={isActive ? 2.5 : 2}
                            style={{
                                filter: isActive ? 'drop-shadow(0 0 6px rgba(234, 153, 153, 0.5))' : 'none',
                            }}
                        />
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: isActive ? 600 : 400,
                            letterSpacing: '0.02em',
                        }}>
                            {label}
                        </span>
                    </NavLink>
                );
            })}
        </nav>
    );
};
