import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
    Shield,
    Users,
    BarChart3,
    ChevronLeft,
    LogOut,
    Activity
} from 'lucide-react';

// Brand colors
const BRAND = {
    accent: '#EA9999',      // Coral/rose accent
    accentDark: '#D88888',  // Darker accent
    accentBg: 'rgba(234, 153, 153, 0.1)',
    primary: '#6366F1',     // Indigo
    primaryBg: 'rgba(99, 102, 241, 0.1)',
};

/**
 * AdminLayout - Premium dark-mode layout for admin dashboard.
 *
 * Features:
 * - "Admin Mode" indicator with brand colors
 * - Sidebar navigation
 * - Dark glassmorphic aesthetic
 */
export const AdminLayout: React.FC = () => {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/transactions', label: 'Global Ledger', icon: Activity },
    ];

    const isActive = (path: string, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            display: 'flex',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px',
                backgroundColor: 'rgba(15, 15, 15, 0.95)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100,
            }}>
                {/* Admin Mode Header */}
                <div style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '12px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentDark} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Shield size={18} color="#fff" />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: BRAND.accent,
                                letterSpacing: '0.02em',
                            }}>
                                ADMIN MODE
                            </div>
                            <div style={{
                                fontSize: '0.6875rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                            }}>
                                Nombre Control Center
                            </div>
                        </div>
                    </div>

                    {/* User info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                    }}>
                        <img
                            src={user?.avatar_url || ''}
                            alt={user?.display_name}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                objectFit: 'cover',
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.9)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user?.display_name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {navItems.map(item => {
                        const active = isActive(item.path, item.exact);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    backgroundColor: active
                                        ? BRAND.accentBg
                                        : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    width: '100%',
                                    textAlign: 'left',
                                }}
                            >
                                <item.icon
                                    size={18}
                                    style={{
                                        color: active ? BRAND.accent : 'rgba(255, 255, 255, 0.5)'
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: active ? 600 : 400,
                                    color: active ? BRAND.accent : 'rgba(255, 255, 255, 0.7)',
                                }}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px 12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            width: '100%',
                            textAlign: 'left',
                        }}
                    >
                        <ChevronLeft size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}>
                            Back to App
                        </span>
                    </button>
                    <button
                        onClick={signOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            width: '100%',
                            textAlign: 'left',
                        }}
                    >
                        <LogOut size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}>
                            Sign Out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '240px',
                minHeight: '100vh',
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '24px 32px',
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
