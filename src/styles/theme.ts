/**
 * Nombre Design System - Theme Tokens
 * Robinhood/Groww-style trading platform aesthetic
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
    
    // Text hierarchy
    text: {
      primary: '#ffffff',
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
    
    // Brand accent
    accent: '#EA9999',
    accentHover: '#d88888',
    accentBg: 'rgba(234, 153, 153, 0.12)',
    accentBorder: 'rgba(234, 153, 153, 0.25)',
    
    // Neutral / borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    borderActive: 'rgba(255, 255, 255, 0.2)',
    
    // Status colors
    warning: '#FFB300',
    info: '#2196F3',
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
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  // ============ SHADOWS ============
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 2px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.5)',
    glow: {
      positive: '0 0 20px rgba(0, 200, 83, 0.15)',
      negative: '0 0 20px rgba(255, 82, 82, 0.15)',
      accent: '0 0 20px rgba(234, 153, 153, 0.2)',
    },
  },
  
  // ============ TRANSITIONS ============
  transitions: {
    fast: '0.1s ease',
    normal: '0.15s ease',
    slow: '0.25s ease',
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

// CSS custom properties generator
export const cssVariables = `
  :root {
    /* Background */
    --bg-primary: ${theme.colors.bg.primary};
    --bg-secondary: ${theme.colors.bg.secondary};
    --bg-tertiary: ${theme.colors.bg.tertiary};
    --bg-hover: ${theme.colors.bg.hover};
    --bg-active: ${theme.colors.bg.active};
    
    /* Text */
    --text-primary: ${theme.colors.text.primary};
    --text-secondary: ${theme.colors.text.secondary};
    --text-muted: ${theme.colors.text.muted};
    --text-disabled: ${theme.colors.text.disabled};
    
    /* Semantic */
    --color-positive: ${theme.colors.positive};
    --color-negative: ${theme.colors.negative};
    --color-positive-bg: ${theme.colors.positiveBg};
    --color-negative-bg: ${theme.colors.negativeBg};
    
    /* Accent */
    --color-accent: ${theme.colors.accent};
    --color-accent-hover: ${theme.colors.accentHover};
    --color-accent-bg: ${theme.colors.accentBg};
    
    /* Borders */
    --border-color: ${theme.colors.border};
    --border-hover: ${theme.colors.borderHover};
    
    /* Layout */
    --nav-height: ${theme.layout.navHeight};
    --sidebar-width: ${theme.layout.sidebarWidth};
  }
`;
