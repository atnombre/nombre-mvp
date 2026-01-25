# Changelog

All notable changes to the Nombre project.

---

## [MVP v1.0] - January 2026

### 🎉 Initial MVP Release

The first complete version of Nombre with all core features functional.

---

### Added

#### Authentication & Users
- Google OAuth via Supabase Auth
- User profile management
- Avatar and display name from Google
- Faucet system (10,000 $NMBR for new users)
- Device fingerprinting for anti-abuse

#### Trading Engine
- AMM bonding curve (constant product x × y = k)
- Buy/sell execution with real-time price updates
- 1% protocol fee on all trades
- Slippage protection
- Price impact calculation
- Quote system before trade execution

#### Creators
- 115+ YouTubers seeded in database
- YouTube Data API integration for adding new creators
- CPI (Creator Performance Index) scoring system
- Manual stats refresh capability
- Token symbol auto-generation

#### Portfolio Management
- Holdings tracking with P&L calculation
- Average buy price tracking
- Portfolio value in real-time
- ROI calculation

#### Leaderboard
- ROI-based ranking system
- User rank display
- Fair competition (skill over timing)

#### UI/UX
- Dark theme design system
- Mobile responsive layout
- Real-time price updates via Supabase subscriptions
- Price charts with Recharts
- Loading skeletons
- Empty states with CTAs

#### Pages
- Dashboard - Portfolio overview, trending creators
- Explore - Browse and search creators
- Portfolio - Detailed holdings breakdown
- Leaderboard - ROI rankings
- History - Transaction history
- Creator Profile - Trading interface

---

### Technical Foundation

#### Backend (Python FastAPI)
- RESTful API with OpenAPI documentation
- Pydantic models for type safety
- Supabase client integration
- YouTube Data API service
- Trading engine with bonding curve math
- Portfolio and faucet services

#### Frontend (React + TypeScript)
- Vite build system
- Zustand state management
- Custom React hooks for data fetching
- Supabase real-time subscriptions
- CSS-in-JS styling

#### Database (Supabase/PostgreSQL)
- Complete schema with 6 tables
- Row Level Security policies
- Database triggers for timestamps
- Views for leaderboard

---

### Bug Fixes (Code Review - January 24, 2026)

Fixed critical bugs identified during comprehensive code review:

1. **Slippage check was ineffective** - Now properly compares quote vs actual output
2. **Market cap never updated after trades** - Now recalculates: `price × 10M`
3. **Volume tracking broken** - Now increments `volume_all_time` on each trade
4. **Sell volume calculation wrong** - Now uses gross amount before fees
5. **total_invested not decremented on sell** - Now properly reduces proportionally
6. **CPI formula mismatch** - Unified formula between `cpi.py` and `youtube_service.py`
7. **Frontend PnL hardcoded to 0** - Now calculates: `(currentValue - costBasis) / costBasis × 100`
8. **Market cap used wrong supply** - Changed from 9M to 10M total tokens

---

### Scripts

- `reset_mvp.py` - Complete MVP reset (users, trades, prices)
- `add_top_youtubers.py` - Seed database with popular creators
- `seed_price_history.py` - Generate initial price history
- `daily_maintenance.py` - Snapshots, volume reset, market cap recalc

---

## [Pre-MVP Phases]

### Phase 1: Foundation ✅
- FastAPI backend skeleton
- Database schema design
- Supabase project setup
- Frontend page routing
- Basic UI components

### Phase 2: Core Trading ✅
- Bonding curve implementation
- Trading interface
- Transaction recording
- Price history tracking

### Phase 3: Social Features ✅
- Leaderboard implementation
- Creator profiles
- Search and discovery

### Phase 4: Polish ✅
- Real-time updates
- Mobile responsiveness
- Error handling
- Loading states

### Phase 5: YouTube Integration ✅
- YouTube Data API setup
- Channel search endpoint
- Add creator from YouTube
- Stats refresh capability

---

## Roadmap (Future)

### Phase 2: Blockchain Integration
- [ ] Base network deployment
- [ ] Real ERC-20 creator tokens
- [ ] Privy wallet integration
- [ ] On-chain transaction execution
- [ ] Creator vesting contracts

### Phase 3: Creator Onboarding
- [ ] YouTube OAuth for creators
- [ ] Creator verification system
- [ ] Revenue sharing mechanics
- [ ] Creator dashboard

### Phase 4: Advanced Features
- [ ] Notifications system
- [ ] Price alerts
- [ ] Social features (comments, follows)
- [ ] Advanced analytics
- [ ] Multiple creator platforms (TikTok, Twitch)

---

## Versioning

This project uses semantic versioning:

- **Major** (1.x.x): Breaking changes, major feature releases
- **Minor** (x.1.x): New features, backward compatible
- **Patch** (x.x.1): Bug fixes, minor improvements

---

## Contributing

When contributing, please:

1. Update this changelog with your changes
2. Follow the existing format
3. Group changes by category (Added, Changed, Fixed, Removed)
4. Reference related issues/PRs where applicable
