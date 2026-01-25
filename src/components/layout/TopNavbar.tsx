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
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
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
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={18} color="#000" fill="#000" />
        </div>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
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
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--color-accent-bg)' : 'transparent',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <Icon size={16} />
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
        {/* Balance */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--color-accent-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-accent-border)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balance</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formatNumber(user.nmbr_balance)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NMBR</span>
          </div>
        )}

        {/* User Menu */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name}&background=1a1a1a&color=fff`}
                alt={user.display_name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                }}
              />
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
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
                  color: 'var(--text-muted)',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'var(--transition-fast)',
                }}
              />
            </button>

            {/* Dropdown Menu */}
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
                    width: '200px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '8px',
                    zIndex: 100,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid var(--border-color)',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.display_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-negative)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-negative-bg)';
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
