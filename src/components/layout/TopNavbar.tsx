import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Wallet,
  Trophy,
  History,
  LogOut,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { formatNumber } from '../trading/PriceDisplay';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/history', icon: History, label: 'History' },
];

export const TopNavbar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        // Glass navbar
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 200,
      }}
    >
      {/* Logo */}
      <NavLink
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          marginRight: '32px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 153, 153, 0.3)',
          }}
        >
          <Zap size={18} color="#000" fill="#000" />
        </div>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 1)',
            letterSpacing: '-0.02em',
          }}
        >
          Nombre
        </span>
      </NavLink>

      {/* Navigation Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flex: 1,
        }}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;

          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                backgroundColor: isActive ? 'rgba(234, 153, 153, 0.15)' : 'transparent',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                position: 'relative',
                // Pink glow for active
                boxShadow: isActive ? '0 0 20px rgba(234, 153, 153, 0.15)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
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
              <Icon size={16} style={{ color: isActive ? '#EA9999' : 'inherit' }} />
              {label}
            </NavLink>
          );
        })}
      </div>

      {/* Right Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Balance - Glass pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(234, 153, 153, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(234, 153, 153, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Balance</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#EA9999',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formatNumber(user.nmbr_balance)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>NMBR</span>
          </div>
        )}

        {/* User Menu - Glass button */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 4px',
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name}&background=1a1a1a&color=fff`}
                alt={user.display_name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.display_name?.split(' ')[0]}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {/* Dropdown Menu - Glass */}
            {showUserMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99,
                  }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    background: 'rgba(17, 17, 17, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '8px',
                    zIndex: 100,
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
                    animation: 'slideDown 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255, 255, 255, 1)' }}>
                      {user.display_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#FF5252',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 82, 82, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
