# Code Review - Identified Fixes

## Overview

This document lists code issues found during review where there are missing glues/connections in the code logic. These are not features planned for later (Phase 2/3), but actual bugs or incomplete implementations in the current codebase.

---

## 1. Portfolio Service - Invalid Supabase Join Query

**File:** `backend/app/services/portfolio_service.py` (lines 55-57)

**Issue:** The Supabase query attempts to join `pools(current_price)` directly from `user_holdings`, but `user_holdings` table only has a foreign key to `creators`, not to `pools`. The join path should go through `creators` to `pools`.

**Current Code:**
```python
response = supabase.table("user_holdings").select(
    "*, creators(id, display_name, avatar_url, token_symbol), pools(current_price)"
).eq("user_id", user_id).gt("token_amount", 0).execute()
```

**Problem:** `user_holdings` → `creators` (via `creator_id`) → `pools` (via `pools.creator_id`), but the current query tries to join `pools` directly from `user_holdings` which won't work.

**Fix:** Change the query to properly nest the join through `creators`:
```python
response = supabase.table("user_holdings").select(
    "*, creators(id, display_name, avatar_url, token_symbol, pools(current_price))"
).eq("user_id", user_id).gt("token_amount", 0).execute()
```

Then update the data access:
```python
creator = row.get("creators", {})
pool = creator.get("pools", {})
if isinstance(pool, list):
    pool = pool[0] if pool else {}
```

---

## 2. BuySellPanel - Sell Mode Cannot Access User Holdings

**File:** `src/components/trading/BuySellPanel.tsx` (lines 67-71, 128-132)

**Issue:** When in "sell" mode, the component shows "0 {token_symbol}" and the MAX button doesn't work because the user's holdings for the specific creator are not passed or fetched.

**Current Code:**
```tsx
// Line 67-71
const handleMaxClick = () => {
    if (mode === 'buy') {
        setAmount(userBalance.toString());
    }
    // For sell, would need user's holding of this token  <-- TODO comment but not implemented
};

// Line 128-132
<span style={{ color: '#FFFFFF', fontWeight: 500 }}>
    {mode === 'buy'
        ? `${formatNumber(userBalance)} NMBR`
        : `0 ${creator.token_symbol}` // TODO: Get from holdings  <-- Always shows 0
    }
</span>
```

**Fix:** 
1. Add `userHolding` prop to `BuySellPanel` that contains the user's holding for this creator
2. Pass it from `CreatorProfile` (which has access to `user.holdings` from authStore)
3. Update the display and MAX button to use the actual holding amount

---

## 3. Missing Price History Recording After Trades

**File:** `backend/app/routers/trading.py`

**Issue:** After executing a trade, the pool's `current_price` is updated, but no record is inserted into the `price_history` table. This means the `PriceChart` component will have no data to display since no price history is being recorded.

**Missing Code:** After updating the pool in both buy and sell sections, there should be an insert into `price_history`:

```python
# Record price history point
supabase.table("price_history").insert({
    "pool_id": pool_id,
    "price": result.new_price,
    "volume": nmbr_amount,  # or result.output_amount for sells
    "timestamp": datetime.utcnow().isoformat()
}).execute()
```

---

## 4. Missing holder_count Update After Trades

**File:** `backend/app/routers/trading.py`

**Issue:** The `pools.holder_count` field exists in the schema and is displayed in the UI, but it's never updated when users buy (new holder) or sell all their tokens (holder removed).

**Missing Logic:**
- **On Buy:** If this is a new holding (not existing), increment `holder_count`
- **On Sell:** If user sold all tokens (holding deleted), decrement `holder_count`

---

## 5. Users RPC Function May Fail Without Auth Context

**File:** `backend/app/routers/users.py` (lines 33-36)

**Issue:** The code calls a Supabase RPC function `get_user_rank` which runs in SQL. When the backend uses `service_role` key, the RPC might not have the auth context expected by RLS policies.

**Current Code:**
```python
rank_response = supabase.rpc("get_user_rank", {"user_id": current_user["id"]}).execute()
if rank_response.data:
    rank = rank_response.data
```

**Potential Issue:** This might return the rank correctly since it's using `service_role`, but the error handling is weak. If it fails, `rank` stays `None` silently.

**Suggested Fix:** Add explicit error handling:
```python
try:
    rank_response = supabase.rpc("get_user_rank", {"user_id": current_user["id"]}).execute()
    rank = rank_response.data if rank_response.data else None
except Exception as e:
    print(f"Failed to get user rank: {e}")
    rank = None
```

---

## 6. Slippage Check Logic Does Nothing Useful

**File:** `backend/app/routers/trading.py` (lines 126-128, 249-251)

**Issue:** The slippage check is called but the result is never used to block the trade if slippage exceeds tolerance.

**Current Code:**
```python
is_ok, actual_slippage = engine.check_slippage(
    result.output_amount, result.output_amount, request.max_slippage_pct
)
# Note: is_ok is never checked!
```

**Problem:** The same value is passed twice (`result.output_amount` for both expected and actual), which means slippage is always 0, and even if it weren't, the trade proceeds regardless.

**Fix:** 
1. The expected output should come from a quote or pre-calculation
2. Add a check: `if not is_ok: raise HTTPException(status_code=400, detail="Slippage tolerance exceeded")`

---

## Summary

| # | Issue | Severity | Files Affected |
|---|-------|----------|----------------|
| 1 | Invalid Supabase join query | High | `portfolio_service.py` |
| 2 | Sell mode shows 0 holdings | Medium | `BuySellPanel.tsx`, `CreatorProfile.tsx` |
| 3 | No price history recording | Medium | `trading.py` |
| 4 | holder_count never updated | Low | `trading.py` |
| 5 | Weak RPC error handling | Low | `users.py` |
| 6 | Slippage check is ineffective | Medium | `trading.py` |

---

**Next Steps:** Please review these findings and let me know which fixes you'd like me to implement.
