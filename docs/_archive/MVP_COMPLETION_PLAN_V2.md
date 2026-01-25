# Nombre MVP v2 - Final Completion Plan

**Created**: 23 January 2026  
**Status**: In Progress

---

## Current State Assessment

### ✅ What's Working
- **Auth System**: Google OAuth with Supabase (just revamped)
- **Trading Engine**: AMM with bonding curve (x * y = k)
- **Creator Database**: 176 YouTubers with CPI-based pricing
- **Core Pages**: Dashboard, Explore, Portfolio, Leaderboard, History, CreatorProfile
- **Real-time**: Supabase subscriptions for live price updates
- **Mobile**: Responsive layout with MobileNav
- **YouTube Integration**: Add creator from YouTube API

### ⚠️ Issues to Fix
1. Price charts show "No price data available" (no initial price history)
2. Landing page is mostly empty (just grid background)
3. Dashboard trending creators/activity may show stale or no data
4. No onboarding flow for new users
5. Error states could be better

---

## Phase 1: Data Foundation (Critical) 🔴

### 1.1 Seed Price History for All Creators
**Priority**: Critical  
**Time**: 30 min

**Problem**: Charts are empty because `price_history` table has no data for new creators.

**Solution**: Create script to seed initial price history for all creators:
- Add initial price point when creator is added
- Optionally simulate some price variance for visual interest

**Files**:
- `backend/scripts/seed_price_history.py` (new)
- `backend/app/routers/creators.py` (add price history on creator add)

---

### 1.2 Fix Dashboard Data Loading
**Priority**: High  
**Time**: 20 min

**Problem**: Dashboard shows "No holdings" or stale trending data.

**Solution**:
- Ensure trending creators query works properly
- Add proper empty states with CTAs
- Show real activity feed

**Files**:
- `src/pages/Dashboard.tsx`
- `backend/app/routers/creators.py` (verify trending endpoint)

---

## Phase 2: Landing Page & Onboarding 🟡

### 2.1 Build Compelling Landing Page
**Priority**: High  
**Time**: 1 hour

**Current**: Empty page with grid background and header.

**New Design**:
```
┌─────────────────────────────────────────────┐
│  [Logo]                    [Log In] [Sign Up]│
├─────────────────────────────────────────────┤
│                                             │
│     Trade Your Favorite YouTubers           │
│     Buy and sell creator tokens based on    │
│     real YouTube performance metrics        │
│                                             │
│     [Get Started - It's Free]               │
│                                             │
├─────────────────────────────────────────────┤
│  🔥 Trending Creators                       │
│  [Card] [Card] [Card] [Card]                │
├─────────────────────────────────────────────┤
│  How It Works                               │
│  1. Sign up  2. Get 10K NMBR  3. Trade      │
├─────────────────────────────────────────────┤
│  Live Prices Ticker (already exists)        │
└─────────────────────────────────────────────┘
```

**Files**:
- `src/App.tsx` (LandingPage component)
- `src/components/LandingTrending.tsx` (new)

---

### 2.2 New User Welcome Flow
**Priority**: Medium  
**Time**: 30 min

After first sign-in:
1. Show welcome modal with brief tutorial
2. Highlight faucet claim (already exists)
3. Suggest first creator to explore

**Files**:
- `src/components/WelcomeModal.tsx` (new)
- `src/pages/Dashboard.tsx`

---

## Phase 3: UI Polish 🟢

### 3.1 Empty States
**Priority**: Medium  
**Time**: 30 min

Add helpful empty states for:
- Portfolio with no holdings → "Start trading to build your portfolio"
- Transaction history with no trades → "Your trades will appear here"
- Search with no results → "No creators found"

**Files**:
- `src/pages/Portfolio.tsx`
- `src/pages/History.tsx`
- `src/pages/Explore.tsx`

---

### 3.2 Loading States
**Priority**: Medium  
**Time**: 20 min

Ensure consistent loading skeletons:
- Already fixed page navigation loading
- Add skeleton to creator cards during search
- Smooth transitions

**Files**:
- `src/pages/Explore.tsx`
- `src/components/ui/Skeleton.tsx`

---

### 3.3 Error Handling
**Priority**: Medium  
**Time**: 20 min

Better error messages:
- Trade fails → specific reason
- Network error → retry button
- Rate limit → "Please wait"

**Files**:
- `src/components/trading/BuySellPanel.tsx`
- `src/services/api.ts`

---

## Phase 4: Feature Completeness 🔵

### 4.1 Creator Stats Refresh
**Priority**: Low  
**Time**: 20 min

Add button to refresh creator's YouTube stats (subs, views):
- Rate limited (once per hour per creator)
- Updates CPI and potentially price

**Files**:
- `src/pages/CreatorProfile.tsx`
- `backend/app/routers/creators.py` (endpoint exists)

---

### 4.2 Search Improvements
**Priority**: Low  
**Time**: 20 min

- Debounce search input (already done)
- Search by @handle and display name
- Sort by relevance

**Files**:
- `backend/app/routers/creators.py`
- `src/pages/Explore.tsx`

---

### 4.3 Leaderboard Enhancements
**Priority**: Low  
**Time**: 15 min

- Add time filter (All time / This week / Today)
- Show more stats (total trades, best pick)

**Files**:
- `src/pages/Leaderboard.tsx`
- `backend/app/routers/leaderboard.py`

---

## Phase 5: Performance & Stability 🟣

### 5.1 API Response Caching
**Priority**: Low  
**Time**: 30 min

Cache expensive queries:
- Creator list (1 min TTL)
- Leaderboard (5 min TTL)
- User portfolio (30 sec TTL)

**Files**:
- `backend/app/routers/` (add caching middleware)

---

### 5.2 Error Boundaries
**Priority**: Low  
**Time**: 15 min

Add React error boundaries:
- Per-page error catching
- Graceful fallback UI

**Files**:
- `src/components/ErrorBoundary.tsx` (new)
- `src/App.tsx`

---

## Implementation Order

| Priority | Task | Est. Time | Dependency | Status |
|----------|------|-----------|------------|--------|
| 🔴 1 | Seed price history | 30 min | None | ✅ Done |
| 🔴 2 | Fix Dashboard data | 20 min | None | ✅ Done |
| 🟡 3 | Landing page redesign | 60 min | None | ⏭️ Skipped per user |
| 🟡 4 | Welcome modal | 30 min | #3 | ⏭️ Skipped per user |
| 🟢 5 | Empty states | 30 min | None | ✅ Done |
| 🟢 6 | Loading states polish | 20 min | None | ✅ Already exists |
| 🟢 7 | Error handling | 20 min | None | ✅ Already good |
| 🔵 8 | Creator refresh button | 20 min | None | ✅ Done |
| 🔵 9 | Search improvements | 20 min | None | Pending |
| 🟣 10 | API caching | 30 min | None | Pending |

**Total Estimated Time**: ~4.5 hours

---

## Quick Wins (Do First)

1. **Seed price history** - Makes charts work immediately
2. **Empty states** - Better UX with minimal effort  
3. **Landing page hero** - First impression matters

---

## Definition of Done

MVP is complete when:
- [x] New user can sign up and see a compelling landing page (skipped per user request)
- [x] Charts show real price data (✅ price history seeded)
- [x] All pages have proper empty/loading/error states (✅ already implemented)
- [x] Trading works end-to-end (buy → see in portfolio → sell) (✅ holdings refresh fixed)
- [x] Leaderboard shows real rankings (✅ working)
- [x] Mobile experience is smooth (✅ responsive design)
- [ ] No console errors in production

---

## Notes

- YouTube API quota: 10,000 units/day (sufficient for MVP)
- Supabase free tier: 500MB database, 2GB bandwidth
- Focus on core trading loop first, polish later
