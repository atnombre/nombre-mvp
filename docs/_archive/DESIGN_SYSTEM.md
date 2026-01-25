# Nombre Design System

## Brand Identity

Nombre is a premium SocialFi trading platform. The design should feel:
- **Professional** - Like Robinhood, not a meme coin casino
- **Modern** - Clean lines, subtle gradients, smooth animations
- **Dark-first** - Dark theme as primary, optimized for long sessions

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Coral (Primary Action)** | `#EA9999` | rgb(234, 153, 153) | CTAs, buttons, accents |
| **Coral Hover** | `#E08888` | rgb(224, 136, 136) | Button hover states |
| **Coral Light** | `rgba(234, 153, 153, 0.2)` | - | Shadows, glows |

### Background Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background Dark** | `#0a0a0a` | rgb(10, 10, 10) | Main app background |
| **Surface** | `#111111` | rgb(17, 17, 17) | Cards, elevated surfaces |
| **Surface Light** | `#1a1a1a` | rgb(26, 26, 26) | Hover states, borders |
| **Surface Lighter** | `#242424` | rgb(36, 36, 36) | Active states |

### Text Colors

| Name | Value | Usage |
|------|-------|-------|
| **Text Primary** | `rgba(255, 255, 255, 0.87)` | Main content |
| **Text Secondary** | `rgba(255, 255, 255, 0.7)` | Secondary content |
| **Text Muted** | `rgba(255, 255, 255, 0.4)` | Tertiary, hints |
| **Text Disabled** | `rgba(255, 255, 255, 0.2)` | Disabled states |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success / Gain** | `#86efac` | Positive price changes, profits |
| **Error / Loss** | `#fca5a5` | Negative price changes, losses |
| **Warning** | `#fcd34d` | Alerts, warnings |
| **Info** | `#93c5fd` | Informational messages |

---

## Typography

### Font Stack

```css
font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
```

> **Note**: Import Inter from Google Fonts:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
> ```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 3rem (48px) | 700 | 1.1 | Landing hero |
| **H1** | 2rem (32px) | 600 | 1.2 | Page titles |
| **H2** | 1.5rem (24px) | 600 | 1.3 | Section headers |
| **H3** | 1.25rem (20px) | 500 | 1.4 | Card titles |
| **Body** | 1rem (16px) | 400 | 1.5 | Default text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| **Caption** | 0.8rem (12.8px) | 400 | 1.4 | Labels, hints |
| **Overline** | 0.75rem (12px) | 500 | 1.4 | Tags, badges |

### Letter Spacing

- Default: `0.01em`
- Ticker/Mono: `0.04em`
- Buttons: `0.02em`

---

## Spacing System

Based on 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Icon gaps |
| `md` | 16px | Card padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Page margins |
| `2xl` | 48px | Large gaps |
| `3xl` | 64px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small elements |
| `md` | 8px | Buttons, inputs |
| `lg` | 10px | Cards |
| `xl` | 16px | Modals |
| `full` | 9999px | Pills, avatars |

---

## Shadows

```css
/* Subtle elevation */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

/* Card elevation */
box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

/* Coral glow (buttons) */
box-shadow: 0 4px 10px rgba(234, 153, 153, 0.2);

/* Coral glow hover */
box-shadow: 0 6px 14px rgba(234, 153, 153, 0.3);

/* Focus ring */
box-shadow: 0 0 0 3px rgba(234, 153, 153, 0.5);
```

---

## Component Patterns

### Buttons

#### Primary Button (Sign Up style)
```css
{
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
}
```

#### Secondary/Ghost Button
```css
{
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#FFFFFF',
  /* Hover: border-color lightens */
}
```

### Cards

```css
{
  backgroundColor: '#111111',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '1.5rem',
}
```

### Inputs

```css
{
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: 'rgba(255, 255, 255, 0.87)',
  fontSize: '1rem',
  /* Focus: border-color: #EA9999 */
}
```

---

## Transitions

Standard timing:
```css
transition: all 0.2s ease;
```

For fades/reveals:
```css
transition: opacity 1s ease-out;
```

---

## Price Change Indicators

```jsx
// Positive change (gain)
color: '#86efac'

// Negative change (loss)  
color: '#fca5a5'

// Neutral
color: 'rgba(255, 255, 255, 0.7)'
```

---

## Icons

Use **Lucide React** for icons:
```bash
npm install lucide-react
```

Common icons needed:
- `TrendingUp`, `TrendingDown` - Price changes
- `User`, `Users` - Creators, users
- `Wallet` - Balance
- `ArrowUpRight`, `ArrowDownRight` - Transactions
- `Search` - Discovery
- `Trophy` - Leaderboard
- `Clock` - History
- `Settings`, `LogOut` - Account

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## Animations

### Interactive Grid Effect
The landing page has a cursor-following grid glow effect. See `InteractiveGrid.tsx` for implementation.

### Ticker Animation
Infinite horizontal scroll for creator tickers. See `InfiniteTicker.tsx`.

### Micro-interactions
- Button hover: Scale 0.98 on press
- Cards: Subtle scale on hover
- Numbers: Count-up animation for stats
