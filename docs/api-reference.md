# API Reference

Complete documentation for the Nombre backend API.

**Base URL**: `http://localhost:8000/api/v1` (development)

---

## Authentication

All authenticated endpoints require a JWT token from Supabase Auth.

```http
Authorization: Bearer <supabase_jwt_token>
```

The token is obtained after Google OAuth login via the Supabase client.

---

## Endpoints Overview

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Auth** | `POST /auth/callback` | Handle OAuth callback |
| **Users** | `GET /users/me` | Get current user profile |
| **Users** | `POST /users/faucet` | Claim initial tokens |
| **Creators** | `GET /creators` | List all creators |
| **Creators** | `GET /creators/{id}` | Get creator details |
| **Creators** | `GET /creators/{id}/price-history` | Get price history |
| **Creators** | `GET /creators/youtube/search` | Search YouTube channels |
| **Creators** | `POST /creators/youtube/add` | Add creator from YouTube |
| **Trading** | `POST /trade/quote` | Get price quote |
| **Trading** | `POST /trade/execute` | Execute a trade |
| **Trading** | `GET /trade/history` | Get transaction history |
| **Portfolio** | `GET /portfolio` | Get portfolio breakdown |
| **Leaderboard** | `GET /leaderboard` | Get ROI rankings |

---

## Auth & Users

### POST /auth/callback

Handle OAuth callback and create/update user profile.

**Request:**
```json
{
  "access_token": "string",
  "provider": "google"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "nmbr_balance": 0.0,
    "portfolio_value": 0.0,
    "faucet_claimed": false
  },
  "is_new_user": true
}
```

---

### GET /users/me

Get current authenticated user's profile with holdings.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "nmbr_balance": 8500.0,
  "portfolio_value": 2340.50,
  "total_invested": 1500.0,
  "roi_pct": 56.03,
  "rank": 12,
  "faucet_claimed": true,
  "holdings": [
    {
      "creator_id": "uuid",
      "creator_name": "PewDiePie",
      "token_symbol": "PEWDS",
      "token_amount": 1500.0,
      "current_value": 1840.50,
      "avg_buy_price": 1.00,
      "current_price": 1.23,
      "pnl": 340.50,
      "pnl_pct": 23.0
    }
  ]
}
```

---

### POST /users/faucet

Claim initial $NMBR tokens (one-time per user).

**Request:**
```json
{
  "device_fingerprint": "string"
}
```

**Response:**
```json
{
  "success": true,
  "amount_claimed": 10000.0,
  "new_balance": 10000.0
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `FAUCET_ALREADY_CLAIMED` | User already claimed tokens |
| 403 | `DEVICE_ALREADY_USED` | Device fingerprint blocked |

---

## Creators

### GET /creators

List all creators with pagination and sorting.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 20 | Results per page |
| `offset` | int | 0 | Pagination offset |
| `sort_by` | string | `market_cap` | Sort field: `price_change_24h`, `volume_24h`, `market_cap`, `cpi_score` |
| `order` | string | `desc` | Sort order: `asc`, `desc` |
| `search` | string | - | Search by name or symbol |

**Response:**
```json
{
  "creators": [
    {
      "id": "uuid",
      "username": "@pewdiepie",
      "display_name": "PewDiePie",
      "avatar_url": "https://...",
      "subscriber_count": 111000000,
      "token_symbol": "PEWDS",
      "current_price": 1.23,
      "price_change_24h": 5.4,
      "market_cap": 12300000.0,
      "volume_24h": 45000.0
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### GET /creators/{creator_id}

Get detailed creator profile with pool data.

**Response:**
```json
{
  "id": "uuid",
  "username": "@pewdiepie",
  "display_name": "PewDiePie",
  "avatar_url": "https://...",
  "banner_url": "https://...",
  "subscriber_count": 111000000,
  "view_count_30d": 250000000,
  "view_count_lifetime": 28000000000,
  "video_count": 4500,
  "cpi_score": 850.0,
  "token_symbol": "PEWDS",
  "is_verified": true,
  "pool": {
    "id": "uuid",
    "current_price": 1.23,
    "price_24h_ago": 1.17,
    "price_change_24h": 5.4,
    "volume_24h": 45000.0,
    "volume_all_time": 1250000.0,
    "market_cap": 12300000.0,
    "holder_count": 342,
    "token_supply": 9000000.0,
    "nmbr_reserve": 11070000.0
  }
}
```

---

### GET /creators/{creator_id}/price-history

Get historical price data for charts.

**Query Parameters:**
| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `period` | string | `24h` | `1h`, `24h`, `7d`, `30d`, `all` |

**Response:**
```json
{
  "prices": [
    {
      "timestamp": "2024-01-20T10:00:00Z",
      "price": 1.15,
      "volume": 500.0
    },
    {
      "timestamp": "2024-01-20T11:00:00Z",
      "price": 1.18,
      "volume": 750.0
    }
  ]
}
```

---

### GET /creators/youtube/search

Search YouTube channels by name or handle.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

**Response:**
```json
{
  "results": [
    {
      "channel_id": "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
      "title": "PewDiePie",
      "handle": "@pewdiepie",
      "thumbnail": "https://...",
      "subscriber_count": 111000000,
      "already_added": true
    }
  ]
}
```

---

### POST /creators/youtube/add

Add a new creator from YouTube.

**Request:**
```json
{
  "channel_id": "UC-lHJZR3Gqxm24_Vd_AJ5Yw"
}
```

**Response:**
```json
{
  "success": true,
  "creator": {
    "id": "uuid",
    "display_name": "PewDiePie",
    "token_symbol": "PEWDS",
    "cpi_score": 850.0,
    "initial_price": 0.00944
  }
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `ALREADY_EXISTS` | Creator already in database |
| 404 | `CHANNEL_NOT_FOUND` | YouTube channel not found |

---

### POST /creators/{creator_id}/refresh-stats

Refresh creator's YouTube statistics.

**Response:**
```json
{
  "success": true,
  "updated_fields": {
    "subscriber_count": 112000000,
    "view_count_30d": 260000000,
    "cpi_score": 855.0
  }
}
```

---

## Trading

### POST /trade/quote

Get a price quote before executing a trade.

**Request:**
```json
{
  "creator_id": "uuid",
  "type": "buy",
  "amount": 100.0,
  "amount_type": "nmbr"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `buy` or `sell` |
| `amount` | float | Amount to trade |
| `amount_type` | string | `nmbr` (spend/receive NMBR) or `token` (buy/sell tokens) |

**Response:**
```json
{
  "type": "buy",
  "input_amount": 100.0,
  "input_currency": "NMBR",
  "output_amount": 81.5,
  "output_currency": "PEWDS",
  "price_per_token": 1.227,
  "price_impact_pct": 0.02,
  "fee_amount": 1.0,
  "fee_pct": 1.0,
  "expires_at": "2024-01-20T10:05:00Z"
}
```

---

### POST /trade/execute

Execute a trade (buy or sell).

**Request:**
```json
{
  "creator_id": "uuid",
  "type": "buy",
  "amount": 100.0,
  "amount_type": "nmbr",
  "max_slippage_pct": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "type": "buy",
    "token_amount": 81.3,
    "nmbr_amount": 100.0,
    "price_per_token": 1.23,
    "fee_amount": 1.0,
    "created_at": "2024-01-20T10:02:30Z"
  },
  "new_balance": 8400.0,
  "new_holding": {
    "token_amount": 81.3,
    "current_value": 100.0
  }
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INSUFFICIENT_BALANCE` | Not enough $NMBR for buy |
| 400 | `INSUFFICIENT_TOKENS` | Not enough tokens for sell |
| 400 | `SLIPPAGE_EXCEEDED` | Price moved beyond tolerance |
| 404 | `CREATOR_NOT_FOUND` | Invalid creator_id |

---

### GET /trade/history

Get user's transaction history.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 20 | Results per page |
| `offset` | int | 0 | Pagination offset |
| `creator_id` | uuid | - | Filter by creator |

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "creator_id": "uuid",
      "creator_name": "PewDiePie",
      "token_symbol": "PEWDS",
      "type": "buy",
      "token_amount": 81.3,
      "nmbr_amount": 100.0,
      "price_per_token": 1.23,
      "fee_amount": 1.0,
      "created_at": "2024-01-20T10:02:30Z"
    }
  ],
  "total": 45
}
```

---

## Portfolio

### GET /portfolio

Get detailed portfolio breakdown.

**Response:**
```json
{
  "total_value": 12340.50,
  "total_invested": 10000.0,
  "total_pnl": 2340.50,
  "roi_pct": 23.4,
  "nmbr_balance": 5000.0,
  "holdings": [
    {
      "creator_id": "uuid",
      "creator_name": "PewDiePie",
      "avatar_url": "https://...",
      "token_symbol": "PEWDS",
      "token_amount": 1500.0,
      "avg_buy_price": 1.00,
      "current_price": 1.23,
      "current_value": 1845.0,
      "cost_basis": 1500.0,
      "pnl": 345.0,
      "pnl_pct": 23.0,
      "allocation_pct": 14.95
    }
  ]
}
```

---

## Leaderboard

### GET /leaderboard

Get ROI-based leaderboard rankings.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 100 | Results per page |
| `offset` | int | 0 | Pagination offset |

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "display_name": "CryptoKing",
      "avatar_url": "https://...",
      "roi_pct": 156.4,
      "portfolio_value": 25640.0,
      "total_invested": 10000.0
    }
  ],
  "my_rank": 12,
  "total_users": 450
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "You don't have enough $NMBR for this trade.",
    "details": {
      "required": 100.0,
      "available": 50.0
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Action not allowed |
| `NOT_FOUND` | 404 | Resource not found |
| `INSUFFICIENT_BALANCE` | 400 | Not enough $NMBR |
| `INSUFFICIENT_TOKENS` | 400 | Not enough tokens to sell |
| `SLIPPAGE_EXCEEDED` | 400 | Price moved too much |
| `FAUCET_ALREADY_CLAIMED` | 400 | Already claimed tokens |
| `DEVICE_ALREADY_USED` | 403 | Device fingerprint blocked |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 req/min |
| `/trade/execute` | 10 req/min |
| `/users/faucet` | 1 req/lifetime |

---

## Real-time Updates

For live data, use Supabase Realtime subscriptions:

```typescript
import { supabase } from '@/lib/supabase';

// Subscribe to pool price updates
const channel = supabase
  .channel('pools-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'pools'
  }, (payload) => {
    console.log('Price update:', payload.new);
  })
  .subscribe();
```

Tables to subscribe:
- `pools` - Price updates
- `transactions` - New trades (with filter)
- `user_holdings` - Portfolio changes

---

## API Documentation (Interactive)

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API exploration and testing.
