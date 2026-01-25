# Nombre MVP - Development Tasks

## Phase 1: Foundation ✅

### Backend
- [x] FastAPI app structure (`backend/app/`)
- [x] Config & Supabase client
- [x] Pydantic schemas (40+ models)
- [x] Trading engine (bonding curve math)
- [x] Portfolio & faucet services
- [x] API routers (auth, users, creators, trading, portfolio, leaderboard)

### Database
- [x] Schema migration (`001_initial_schema.sql`)
- [x] Seed data (`002_seed_data.sql`)
- [x] RLS policies

### Frontend
- [x] Supabase client + auth helpers
- [x] API client with types
- [x] Zustand auth store
- [x] React hooks (portfolio, trade, creators, leaderboard)
- [x] UI components (Button, Card, Avatar, Input, etc.)
- [x] Layout (Sidebar, AppLayout)
- [x] Pages (Dashboard, Explore, Portfolio, Leaderboard, AuthCallback)
- [x] React Router configuration

### Setup (Pending)
- [ ] Create Supabase project
- [ ] Run migrations
- [ ] Enable Google OAuth
- [ ] Create .env files
- [ ] Test connection

---

## Phase 2: Core Trading

- [ ] CreatorProfile page with trading UI
- [ ] BuySellPanel component
- [ ] Price charts (Recharts)
- [ ] Transaction history page

---

## Phase 3: Polish

- [ ] Real-time Supabase subscriptions
- [ ] Animations & micro-interactions
- [ ] Mobile responsive design
- [ ] Error boundaries & loading states
