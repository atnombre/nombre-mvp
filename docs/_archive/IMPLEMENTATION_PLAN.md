# Nombre MVP - Implementation Plan

## Goal

Build a SocialFi trading platform where users can invest in creator "stocks" using play money ($NMBR tokens). Prices follow an AMM bonding curve based on real-world performance (YouTube metrics).

---

## Architecture

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
│  • Faucet (anti-cheat protected)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                            │
│  • PostgreSQL Database                                          │
│  • Google OAuth Authentication                                  │
│  • Real-time subscriptions                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | CSS-in-JS + Design System |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |

---

## Development Phases

### Phase 1: Foundation ✅
- [x] AI agent knowledge base
- [x] FastAPI backend with trading engine
- [x] Database schema & migrations
- [x] Frontend pages & components
- [ ] Supabase project setup

### Phase 2: Core Trading
- [ ] CreatorProfile page
- [ ] Buy/Sell trading panel
- [ ] Price charts
- [ ] Transaction history

### Phase 3: Polish
- [ ] Real-time updates
- [ ] Mobile responsiveness
- [ ] Error handling

---

## File Structure

```
nombre-mvp-1/
├── .agent/knowledge/          # AI agent docs
├── docs/                      # Project documentation
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TASK.md
│   └── WALKTHROUGH.md
├── src/                       # Frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── stores/
├── backend/                   # FastAPI backend
│   └── app/
└── supabase/                  # Database migrations
    └── migrations/
```
