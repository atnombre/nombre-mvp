# Architecture

This document describes the system architecture, tech stack, and data flow for the Nombre platform.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│   Dashboard │ Trading │ Portfolio │ Leaderboard │ Creator Page  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python FastAPI)                     │
│  • Auth & User Management                                       │
│  • Trading Engine (AMM bonding curve)                           │
│  • Portfolio & Leaderboard calculations                         │
│  • YouTube API Integration                                      │
│  • Faucet (anti-cheat protected)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                            │
│  • PostgreSQL Database                                          │
│  • Google OAuth Authentication                                  │
│  • Real-time Subscriptions                                      │
│  • Row Level Security (RLS)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **Zustand** | 4.x | State management |
| **React Router** | 6.x | Client-side routing |
| **Recharts** | 2.x | Price charts |
| **Lucide React** | - | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Runtime |
| **FastAPI** | 0.100+ | API framework |
| **Pydantic** | 2.x | Data validation |
| **Supabase Client** | 2.x | Database access |
| **google-api-python-client** | - | YouTube API |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Supabase** | Database, Auth, Real-time |
| **PostgreSQL** | Primary database |
| **Google OAuth** | User authentication |
| **YouTube Data API v3** | Creator metrics |

---

## Directory Structure

```
nombre-mvp/
├── .agent/                    # AI Agent context (for Copilot/Cursor)
│   └── knowledge/             # Symlinks to docs/ for AI context
├── docs/                      # Documentation hub
│   ├── architecture.md        # This file
│   ├── getting-started.md     # Setup guide
│   ├── api-reference.md       # API documentation
│   ├── database-schema.md     # Database design
│   ├── trading-mechanics.md   # Business logic
│   ├── design-system.md       # UI guidelines
│   └── development/           # Dev guides
│       ├── scripts.md         # Utility scripts
│       └── changelog.md       # Version history
├── src/                       # Frontend application
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # AppLayout, Sidebar, MobileNav
│   │   ├── trading/           # BuySellPanel, PriceChart
│   │   └── ui/                # Button, Card, Input, Avatar
│   ├── pages/                 # Route components
│   │   ├── Dashboard.tsx      # Home page with portfolio overview
│   │   ├── Explore.tsx        # Browse and search creators
│   │   ├── Portfolio.tsx      # User holdings detail
│   │   ├── Leaderboard.tsx    # ROI rankings
│   │   ├── History.tsx        # Transaction history
│   │   └── CreatorProfile.tsx # Trading page for a creator
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCreators.ts     # Creator list & search
│   │   ├── usePortfolio.ts    # User portfolio data
│   │   ├── useTrade.ts        # Trade execution
│   │   ├── useLeaderboard.ts  # Rankings data
│   │   └── useRealtime.ts     # Supabase subscriptions
│   ├── services/              # External integrations
│   │   └── api.ts             # Backend API client
│   ├── stores/                # Zustand stores
│   │   └── authStore.ts       # Auth state & user data
│   └── lib/                   # Utilities
│       └── supabase.ts        # Supabase client
├── backend/                   # Backend application
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # Supabase client setup
│   │   ├── routers/           # API endpoints
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── users.py       # User profile routes
│   │   │   ├── creators.py    # Creator CRUD + YouTube
│   │   │   ├── trading.py     # Buy/sell execution
│   │   │   ├── portfolio.py   # Portfolio data
│   │   │   └── leaderboard.py # Rankings
│   │   ├── services/          # Business logic
│   │   │   ├── trading_engine.py  # AMM math
│   │   │   ├── portfolio_service.py
│   │   │   ├── faucet_service.py
│   │   │   └── youtube_service.py # YouTube API
│   │   ├── models/            # Pydantic schemas
│   │   │   └── schemas.py     # Request/response models
│   │   └── utils/
│   │       └── cpi.py         # CPI calculation
│   ├── scripts/               # Maintenance utilities
│   │   ├── reset_mvp.py       # Reset all user data
│   │   ├── add_top_youtubers.py
│   │   ├── seed_price_history.py
│   │   └── daily_maintenance.py
│   └── requirements.txt
└── supabase/
    └── migrations/            # Database migrations
        ├── 001_initial_schema.sql
        └── 002_seed_data.sql
```

---

## Data Flow

### Authentication Flow

```
1. User clicks "Sign in with Google"
2. Frontend redirects to Supabase OAuth
3. Google authenticates user
4. Supabase creates session, returns JWT
5. Frontend stores JWT, calls /api/v1/auth/callback
6. Backend creates/updates user record
7. Frontend loads user data into authStore
```

### Trading Flow

```
1. User enters amount on CreatorProfile page
2. Frontend calls /api/v1/trade/quote for preview
3. Backend calculates AMM output, fees, price impact
4. User confirms trade
5. Frontend calls /api/v1/trade/execute
6. Backend:
   a. Validates balance/holdings
   b. Executes AMM math
   c. Updates pool reserves & price
   d. Updates user balance & holdings
   e. Records transaction & price history
7. Supabase real-time pushes price update
8. Frontend receives update, refreshes UI
```

### Real-time Updates

```
1. Frontend subscribes to Supabase channel
2. On pool update (price change):
   a. Supabase pushes change event
   b. Frontend updates creator card/chart
3. On trade by another user:
   a. Price updates propagate instantly
   b. Volume counters update
```

---

## Key Design Decisions

### Why Supabase?

1. **Integrated Auth** - Google OAuth out of the box
2. **Real-time** - WebSocket subscriptions for live prices
3. **PostgreSQL** - Full SQL power with RLS security
4. **Free Tier** - Generous limits for MVP

### Why FastAPI?

1. **Performance** - Async I/O for handling concurrent trades
2. **Auto Documentation** - OpenAPI docs at `/docs`
3. **Type Safety** - Pydantic validation
4. **Python Ecosystem** - Easy YouTube API integration

### Why AMM Bonding Curve?

1. **Deterministic Pricing** - No order book complexity
2. **Instant Execution** - No waiting for counterparty
3. **Fair Launch** - Price discovery through market activity
4. **Proven Model** - Used by Uniswap, Pump.fun

---

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS policies:
- Users can only read/update their own profile
- Creators and pools are publicly readable
- Transactions are user-scoped

### API Security

- JWT validation on all authenticated endpoints
- Service role key only used by backend (never exposed)
- Rate limiting on trade execution (10/min)
- Device fingerprinting for faucet abuse prevention

### Input Validation

- Pydantic models validate all request bodies
- SQL injection prevented by Supabase client
- Frontend type checking with TypeScript

---

## Performance Optimizations

### Database

- Indexes on frequently queried columns
- Materialized view for leaderboard (future)
- Connection pooling via Supabase

### Frontend

- React.memo for expensive components
- Debounced search inputs
- Lazy loading for routes

### Backend

- Async database operations
- Query result caching (planned)
- Batch operations where possible

---

## External Integrations

### YouTube Data API v3

**Quota**: 10,000 units/day (free tier)

| Operation | Cost | Usage |
|-----------|------|-------|
| Channel search | 100 | Adding new creators |
| Channel details | 1 | Refreshing stats |
| Video list | 1 | Estimating 30-day views |

**Strategy**: Fetch stats once when adding creator, refresh on-demand or daily.

### Supabase

**Free Tier Limits**:
- 500 MB database
- 2 GB bandwidth/month
- 50 MB file storage
- Unlimited API requests

Sufficient for MVP with 1000+ users.

---

## Future Architecture (Phase 2)

When moving to real blockchain:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                    + Privy Wallet SDK                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python FastAPI)                     │
│                    + Indexer Service                            │
└─────────────────────────────────────────────────────────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────────────┐
│     SUPABASE        │              │      BASE NETWORK           │
│ (off-chain data)    │              │ • ERC-20 Creator Tokens     │
│                     │              │ • Bonding Curve Contracts   │
│                     │              │ • Vesting Contracts         │
└─────────────────────┘              └─────────────────────────────┘
```

This would involve:
- Real token contracts on Base (L2)
- Privy for wallet management
- Indexer to sync on-chain events
- Creator vesting schedules
