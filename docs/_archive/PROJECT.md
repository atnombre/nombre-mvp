# Nombre - SocialFi Creator Stock Trading Platform

## Project Mission

Nombre is a financial platform that turns **Creator Reputation into a tradable asset**. It allows fans to invest in their favorite YouTubers like "stocks," where the price is driven by real-world performance (YouTube views/subs) and market demand (buying pressure).

**Current Phase**: MVP / Closed Beta Competition

**Core Mechanic**: Since this is an MVP, we are not processing real fiat payments yet. Users receive "play money" ($NMBR tokens) to compete on a leaderboard for the highest Portfolio ROI.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│   Dashboard │ Trading │ Portfolio │ Leaderboard │ Creator Page  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python FastAPI)                     │
│  • YouTube OAuth & CPI Calculation                              │
│  • Trading Logic (Buy/Sell simulation)                          │
│  • Leaderboard & Portfolio calculations                         │
│  • Faucet (give new users $NMBR)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                            │
│  • PostgreSQL Database (Users, Creators, Pools, Transactions)   │
│  • Google OAuth Authentication                                  │
│  • Real-time subscriptions (for live price updates)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React + TypeScript + Vite | Modern SPA |
| **Styling** | CSS-in-JS (inline styles) + TailwindCSS | Already configured |
| **Backend** | Python FastAPI | Async, auto OpenAPI docs |
| **Database** | Supabase (PostgreSQL) | BaaS with built-in auth |
| **Auth** | Supabase Auth (Google OAuth) | Phase 1: Simple OAuth |
| **Blockchain** | Base Sepolia Testnet | Phase 2: Real contracts |
| **Hosting** | TBD | Vercel for frontend, Railway/Render for backend |

---

## Directory Structure

```
nombre-mvp-1/
├── .agent/                    # AI Agent knowledge base
│   ├── knowledge/             # Project documentation
│   │   ├── PROJECT.md         # This file - project overview
│   │   ├── DESIGN_SYSTEM.md   # Colors, fonts, components
│   │   ├── DATABASE.md        # Schema and relationships
│   │   ├── API.md             # Backend endpoints
│   │   └── BUSINESS_LOGIC.md  # Trading mechanics, CPI formula
│   └── workflows/             # Automation workflows
├── src/                       # Frontend React app
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-level components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client, Supabase client
│   ├── stores/                # State management
│   └── utils/                 # Helper functions
├── backend/                   # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── routers/           # API route handlers
│   │   ├── models/            # Pydantic models
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   └── requirements.txt
└── supabase/                  # Supabase config & migrations
    └── migrations/            # SQL migrations
```

---

## Feature Breakdown

### MVP Features (Priority Order)

1. **Authentication** - Google OAuth via Supabase
2. **User Dashboard** - Portfolio overview, balance, ROI
3. **Creator Discovery** - Browse and search creators
4. **Creator Profile** - View stats, price chart, buy/sell
5. **Trading Engine** - Buy/Sell with bonding curve simulation
6. **Leaderboard** - ROI-based ranking
7. **Faucet** - New user receives 10,000 $NMBR

### Deferred Features (Post-MVP)

- Real blockchain transactions (Base network)
- Privy wallet integration
- Creator onboarding (YouTube OAuth)
- Vesting contracts for creators
- Real-time price indexer
- Notifications

---

## Development Phases

### Phase 1: Foundation (Current)
- [ ] Set up Supabase project
- [ ] Design database schema
- [ ] Create FastAPI backend skeleton
- [ ] Implement Google OAuth flow
- [ ] Build basic dashboard UI

### Phase 2: Core Trading
- [ ] Implement bonding curve math
- [ ] Build trading interface
- [ ] Create transaction history
- [ ] Add portfolio tracking

### Phase 3: Social Features
- [ ] Leaderboard implementation
- [ ] Creator profiles
- [ ] Search and discovery

### Phase 4: Polish
- [ ] Real-time updates
- [ ] Animations and transitions
- [ ] Mobile responsiveness
- [ ] Error handling
