# Design System

Nombre's visual design guidelines, color palette, typography, and component patterns.

---

## Brand Identity

Nombre is a **premium SocialFi trading platform**. The design should feel:

- **Professional** – Like Robinhood, not a meme coin casino
- **Modern** – Clean lines, subtle gradients, smooth animations
- **Dark-first** – Dark theme as primary, optimized for long trading sessions

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Coral (Primary)** | `#EA9999` | rgb(234, 153, 153) | CTAs, buttons, accents |
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

### Color Usage Examples

```css
/* Positive price change */
.price-up {
  color: #86efac;
}

/* Negative price change */
.price-down {
  color: #fca5a5;
}

/* Neutral/unchanged */
.price-neutral {
  color: rgba(255, 255, 255, 0.7);
}
```

---

## Typography

### Font Stack

```css
font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
```

**Import from Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

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

| Context | Value |
|---------|-------|
| Default | `0.01em` |
| Ticker/Mono | `0.04em` |
| Buttons | `0.02em` |

---

## Spacing System

Based on a **4px grid**:

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

/* Coral glow (primary buttons) */
box-shadow: 0 4px 10px rgba(234, 153, 153, 0.2);

/* Coral glow hover */
box-shadow: 0 6px 14px rgba(234, 153, 153, 0.3);

/* Focus ring */
box-shadow: 0 0 0 3px rgba(234, 153, 153, 0.5);
```

---

## Component Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  border: none;
  background-color: #EA9999;
  color: #FFFFFF;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(234, 153, 153, 0.2);
}

.btn-primary:hover {
  background-color: #E08888;
  box-shadow: 0 6px 14px rgba(234, 153, 153, 0.3);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary/Ghost Button
```css
.btn-secondary {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}
```

### Cards

```css
.card {
  background-color: #111111;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### Inputs

```css
.input {
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.87);
  font-size: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #EA9999;
  box-shadow: 0 0 0 3px rgba(234, 153, 153, 0.2);
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

### Tabs

```css
.tabs {
  display: flex;
  gap: 0;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab.active {
  background: #EA9999;
  color: #FFFFFF;
}

.tab:hover:not(.active) {
  color: rgba(255, 255, 255, 0.87);
}
```

---

## Transitions

### Standard Timing

```css
transition: all 0.2s ease;
```

### Fade/Reveal

```css
transition: opacity 1s ease-out;
```

### Transform Hover

```css
.hoverable {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hoverable:hover {
  transform: translateY(-2px);
}
```

---

## Price Change Indicators

```jsx
// In React components
const getPriceColor = (change) => {
  if (change > 0) return '#86efac';  // Green for gains
  if (change < 0) return '#fca5a5';  // Red for losses
  return 'rgba(255, 255, 255, 0.7)'; // Neutral
};

const formatPriceChange = (change) => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};
```

---

## Icons

Use **Lucide React** for all icons:

```bash
npm install lucide-react
```

### Commonly Used Icons

| Icon | Usage |
|------|-------|
| `TrendingUp`, `TrendingDown` | Price changes |
| `User`, `Users` | Creators, users |
| `Wallet` | Balance display |
| `ArrowUpRight`, `ArrowDownRight` | Transactions |
| `Search` | Search input |
| `Trophy` | Leaderboard |
| `Clock`, `History` | Transaction history |
| `Settings`, `LogOut` | Account menu |
| `Plus` | Add creator |
| `RefreshCw` | Refresh data |
| `ExternalLink` | External links (YouTube) |

### Icon Styling

```jsx
import { TrendingUp } from 'lucide-react';

// In component
<TrendingUp 
  size={16} 
  color="#86efac" 
  strokeWidth={2}
/>
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
/* Base styles for mobile */

@media (min-width: 640px) {
  /* sm - Small tablets */
}

@media (min-width: 768px) {
  /* md - Tablets, small laptops */
}

@media (min-width: 1024px) {
  /* lg - Desktops */
}

@media (min-width: 1280px) {
  /* xl - Large desktops */
}
```

### Responsive Grid Classes

```css
/* Stats grid - 2 cols mobile, 4 cols desktop */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Creator grid - 1 col mobile, 2-3 cols larger */
.creator-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .creator-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .creator-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Animations

### Interactive Grid Effect

The landing page has a cursor-following grid glow. See `src/components/InteractiveGrid.tsx`.

### Infinite Ticker

Horizontal scrolling creator ticker on landing. See `src/components/InfiniteTicker.tsx`.

### Number Count-up

For stats that animate from 0 to value on mount:

```jsx
const CountUp = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}</span>;
};
```

### Micro-interactions

| Interaction | Effect |
|-------------|--------|
| Button press | Scale to 0.98 |
| Card hover | Translate Y -2px |
| Tab switch | Smooth background slide |
| Loading | Pulse animation on skeleton |

---

## Loading States

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #1a1a1a 25%,
    #242424 50%,
    #1a1a1a 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Loading Spinner

```jsx
const Spinner = ({ size = 24 }) => (
  <div 
    style={{
      width: size,
      height: size,
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#EA9999',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}
  />
);
```

---

## Empty States

Design pattern for when there's no data:

```jsx
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.4)'
  }}>
    <Icon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
    <h3 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
      {title}
    </h3>
    <p style={{ marginBottom: '1.5rem' }}>{description}</p>
    {action}
  </div>
);
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(234, 153, 153, 0.5);
}
```

### Color Contrast

- Text on dark backgrounds: Minimum 4.5:1 contrast ratio
- Large text (H1, H2): Minimum 3:1 contrast ratio
- Use `rgba(255, 255, 255, 0.87)` for primary text, not pure white

### Touch Targets

Minimum 44×44px touch target for mobile interactions.

---

## Component Library

Located in `src/components/ui/`:

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `Button.tsx` | Primary, secondary, ghost buttons |
| `Card` | `Card.tsx` | Content containers |
| `Input` | `Input.tsx` | Text inputs |
| `Avatar` | `Avatar.tsx` | User/creator avatars |
| `Skeleton` | `Skeleton.tsx` | Loading placeholders |
| `PriceChange` | `PriceChange.tsx` | Colored price change display |

### Usage

```jsx
import { Button, Card, Avatar } from '@/components/ui';

<Card>
  <Avatar src={creator.avatar_url} size={48} />
  <Button variant="primary" onClick={handleTrade}>
    Trade
  </Button>
</Card>
```
