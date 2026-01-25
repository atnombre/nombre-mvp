# AI Agent Context

This folder provides context for AI coding assistants (GitHub Copilot, Cursor, Claude, etc.).

---

## Quick Reference

**Nombre** is a SocialFi trading platform where users trade creator "stocks" using play money.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **$NMBR** | Platform currency (play money), 10K given via faucet |
| **CPI** | Creator Performance Index (0-1000), based on YouTube metrics |
| **AMM** | Automated Market Maker using `x × y = k` bonding curve |
| **Pool** | Each creator has a liquidity pool with 9M tokens |

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Google OAuth via Supabase

---

## Documentation

All documentation lives in `/docs/`:

| Document | AI Context |
|----------|------------|
| [architecture.md](../docs/architecture.md) | System design, data flow, directory structure |
| [api-reference.md](../docs/api-reference.md) | All backend endpoints with request/response |
| [database-schema.md](../docs/database-schema.md) | Tables, relationships, RLS policies |
| [trading-mechanics.md](../docs/trading-mechanics.md) | CPI formula, AMM math, portfolio calculations |
| [design-system.md](../docs/design-system.md) | Colors, typography, component patterns |
| [getting-started.md](../docs/getting-started.md) | Setup instructions |

---

## Key Files for AI Context

When working on specific areas:

### Trading Logic
- `backend/app/services/trading_engine.py` - AMM bonding curve
- `backend/app/routers/trading.py` - Buy/sell endpoints
- `backend/app/utils/cpi.py` - CPI calculation
- `docs/trading-mechanics.md` - Formula reference

### Frontend Components
- `src/components/trading/BuySellPanel.tsx` - Trading UI
- `src/components/trading/PriceChart.tsx` - Price charts
- `src/pages/CreatorProfile.tsx` - Trading page
- `docs/design-system.md` - Styling guidelines

### Database Operations
- `backend/app/database.py` - Supabase client
- `supabase/migrations/` - Schema definitions
- `docs/database-schema.md` - Table reference

### API Integration
- `src/services/api.ts` - Frontend API client
- `backend/app/routers/` - All endpoint handlers
- `docs/api-reference.md` - Endpoint documentation

---

## Core Formulas (Quick Reference)

### CPI Score (0-1000)
```python
# Logarithmic scaling
cpi = log(0.3*subs_score + 0.6*views30d_score + 0.1*lifetime_score + 1) * 50
```

### Initial Price
```python
market_cap = cpi * 100
initial_price = market_cap / 10_000_000  # 10M total tokens
```

### AMM (Constant Product)
```python
k = nmbr_reserve * token_supply  # Invariant

# Buy: user spends NMBR, receives tokens
new_nmbr = nmbr_reserve + input_nmbr
new_tokens = k / new_nmbr
tokens_out = token_supply - new_tokens

# Sell: user spends tokens, receives NMBR
new_tokens = token_supply + input_tokens
new_nmbr = k / new_tokens
nmbr_out = nmbr_reserve - new_nmbr

# Price
current_price = nmbr_reserve / token_supply
```

---

## Important Constants

```python
TOTAL_TOKEN_SUPPLY = 10_000_000  # 10M total tokens per creator
POOL_TOKEN_SUPPLY = 9_000_000   # 90% in liquidity pool
FAUCET_AMOUNT = 10_000          # Starting balance for new users
PROTOCOL_FEE_PCT = 1.0          # 1% fee on all trades
```

---

## Common Tasks

### Adding a New API Endpoint

1. Create route in `backend/app/routers/`
2. Add Pydantic models in `backend/app/models/schemas.py`
3. Update `src/services/api.ts` with client method
4. Document in `docs/api-reference.md`

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Follow patterns from existing pages
4. Use components from `src/components/ui/`

### Modifying Trading Logic

1. Update `backend/app/services/trading_engine.py`
2. Ensure math is correct (see `docs/trading-mechanics.md`)
3. Update documentation if formulas change

---

## Archived Knowledge Base

Previous AI context files have been archived to `docs/_archive/`. The main `docs/` folder now serves both human developers and AI agents.
