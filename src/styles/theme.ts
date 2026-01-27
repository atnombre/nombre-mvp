/**
 * Nombre Design System - Theme Tokens
 * Glassmorphism-first trading platform aesthetic
 */

export const theme = {
  // ============ COLORS ============
  colors: {
    // Background hierarchy
    bg: {
      primary: '#0a0a0a',      // Main app background
      secondary: '#0f0f0f',    // Elevated surfaces
      tertiary: '#141414',     // Cards, panels
      hover: '#1a1a1a',        // Hover states
      active: '#242424',       // Active/pressed states
    },

    // Text hierarchy - using opacity for "floating" text
    text: {
      primary: 'rgba(255, 255, 255, 1)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.45)',
      disabled: 'rgba(255, 255, 255, 0.25)',
    },

    // Semantic - Trading colors (high contrast)
    positive: '#00C853',       // Bright green - gains, profit, up
    negative: '#FF5252',       // Bright red - loss, down

    // Semantic - Trading colors with opacity
    positiveBg: 'rgba(0, 200, 83, 0.1)',
    negativeBg: 'rgba(255, 82, 82, 0.1)',
    positiveBorder: 'rgba(0, 200, 83, 0.3)',
    negativeBorder: 'rgba(255, 82, 82, 0.3)',

    // Brand accent - Nombre Pink
    accent: '#EA9999',
    accentHover: '#d88888',
    accentBg: 'rgba(234, 153, 153, 0.12)',
    accentBorder: 'rgba(234, 153, 153, 0.25)',
    accentGlow: 'rgba(234, 153, 153, 0.4)',

    // Neutral / borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(255, 255, 255, 0.18)',

    // Status colors
    warning: '#FFB300',
    info: '#2196F3',
  },

  // ============ GLASSMORPHISM ============
  glass: {
    // Backgrounds
    bg: 'rgba(20, 20, 20, 0.6)',
    bgSolid: 'rgba(17, 17, 17, 0.85)',
    bgLight: 'rgba(30, 30, 30, 0.5)',
    bgHover: 'rgba(40, 40, 40, 0.6)',

    // Borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(255, 255, 255, 0.18)',
    borderAccent: 'rgba(234, 153, 153, 0.3)',

    // Blur values
    blur: '16px',
    blurHeavy: '24px',
    blurLight: '10px',

    // Shadows
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 16px 48px rgba(0, 0, 0, 0.4)',
    shadowXl: '0 24px 64px rgba(0, 0, 0, 0.5)',
    shadowInset: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',

    // Glows
    glowAccent: '0 0 30px rgba(234, 153, 153, 0.15)',
    glowAccentStrong: '0 0 40px rgba(234, 153, 153, 0.25)',
    glowPositive: '0 0 20px rgba(0, 200, 83, 0.15)',
    glowNegative: '0 0 20px rgba(255, 82, 82, 0.15)',
  },

  // ============ TYPOGRAPHY ============
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",

    // Font sizes
    fontSize: {
      xs: '0.7rem',      // 11.2px - tiny labels
      sm: '0.75rem',     // 12px - captions, overlines
      base: '0.8125rem', // 13px - body small
      md: '0.875rem',    // 14px - body
      lg: '1rem',        // 16px - body large
      xl: '1.125rem',    // 18px - subheadings
      '2xl': '1.375rem', // 22px - headings
      '3xl': '1.75rem',  // 28px - page titles
      '4xl': '2.25rem',  // 36px - large numbers
    },

    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line heights
    lineHeight: {
      tight: 1.1,
      snug: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },

    // Letter spacing
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  // ============ SPACING ============
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
  },

  // ============ BORDERS ============
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  },

  // ============ SHADOWS ============
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    glow: {
      positive: '0 0 20px rgba(0, 200, 83, 0.15)',
      negative: '0 0 20px rgba(255, 82, 82, 0.15)',
      accent: '0 0 30px rgba(234, 153, 153, 0.2)',
      accentStrong: '0 0 40px rgba(234, 153, 153, 0.3)',
    },
  },

  // ============ TRANSITIONS ============
  transitions: {
    fast: '0.1s ease',
    normal: '0.15s ease',
    slow: '0.25s ease',
    smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ============ LAYOUT ============
  layout: {
    navHeight: '56px',
    sidebarWidth: '280px',
    maxContentWidth: '1400px',
    containerPadding: '24px',
  },

  // ============ Z-INDEX ============
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
  },
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeGlass = typeof theme.glass;

// Helper function to create glass styles
export const createGlassStyle = (variant: 'default' | 'solid' | 'light' | 'heavy' = 'default') => {
  const variants = {
    default: {
      background: theme.glass.bg,
      backdropFilter: `blur(${theme.glass.blur})`,
      WebkitBackdropFilter: `blur(${theme.glass.blur})`,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadow,
    },
    solid: {
      background: theme.glass.bgSolid,
      backdropFilter: `blur(${theme.glass.blur})`,
      WebkitBackdropFilter: `blur(${theme.glass.blur})`,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadow,
    },
    light: {
      background: theme.glass.bgLight,
      backdropFilter: `blur(${theme.glass.blurLight})`,
      WebkitBackdropFilter: `blur(${theme.glass.blurLight})`,
      border: `1px solid ${theme.glass.border}`,
    },
    heavy: {
      background: theme.glass.bg,
      backdropFilter: `blur(${theme.glass.blurHeavy})`,
      WebkitBackdropFilter: `blur(${theme.glass.blurHeavy})`,
      border: `1px solid ${theme.glass.border}`,
      boxShadow: theme.glass.shadowLg,
    },
  };

  return variants[variant];
};
