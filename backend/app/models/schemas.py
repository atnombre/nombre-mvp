from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


# ============ User Schemas ============

class UserBase(BaseModel):
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    auth_id: str


class UserResponse(UserBase):
    id: str
    username: Optional[str] = None
    nmbr_balance: float
    portfolio_value: float
    total_invested: float
    roi_pct: float = 0.0
    rank: Optional[int] = None
    faucet_claimed: bool = False
    is_admin: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserWithHoldings(UserResponse):
    holdings: List["HoldingResponse"] = []


# ============ Creator Schemas ============

class CreatorBase(BaseModel):
    youtube_channel_id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None


class CreatorResponse(CreatorBase):
    id: str
    subscriber_count: int = 0
    view_count_30d: int = 0
    view_count_lifetime: int = 0
    video_count: int = 0
    cpi_score: float = 0.0
    token_symbol: str
    is_verified: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreatorWithPool(CreatorResponse):
    pool: Optional["PoolResponse"] = None


class CreatorListItem(BaseModel):
    """Lightweight creator for list views."""
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    subscriber_count: int
    token_symbol: str
    current_price: float
    price_change_24h: float
    market_cap: float
    volume_24h: float


# ============ Pool Schemas ============

class PoolResponse(BaseModel):
    id: str
    creator_id: str
    token_supply: float
    nmbr_reserve: float
    current_price: float
    price_24h_ago: Optional[float] = None
    price_change_24h: float = 0.0
    volume_24h: float = 0.0
    market_cap: float = 0.0
    holder_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Holding Schemas ============

class HoldingResponse(BaseModel):
    creator_id: str
    creator_name: str
    avatar_url: Optional[str] = None
    token_symbol: str
    token_amount: float
    avg_buy_price: float
    current_price: float
    current_value: float
    cost_basis: float
    pnl: float
    pnl_pct: float
    allocation_pct: float = 0.0
    
    class Config:
        from_attributes = True


# ============ Trading Schemas ============

class TradeQuoteRequest(BaseModel):
    creator_id: str
    type: str = Field(..., pattern="^(buy|sell)$")
    amount: float = Field(..., gt=0)
    amount_type: str = Field(default="nmbr", pattern="^(nmbr|token)$")


class TradeQuoteResponse(BaseModel):
    type: str
    input_amount: float
    input_currency: str
    output_amount: float
    output_currency: str
    price_per_token: float
    price_impact_pct: float
    fee_amount: float
    fee_pct: float
    expires_at: datetime


class TradeExecuteRequest(BaseModel):
    creator_id: str
    type: str = Field(..., pattern="^(buy|sell)$")
    amount: float = Field(..., gt=0)
    amount_type: str = Field(default="nmbr", pattern="^(nmbr|token)$")
    max_slippage_pct: float = Field(default=1.0, ge=0, le=50)


class TransactionResponse(BaseModel):
    id: str
    type: str
    token_amount: float
    nmbr_amount: float
    price_per_token: float
    fee_amount: float
    slippage_pct: float
    price_impact_pct: float = 0.0
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionWithCreator(TransactionResponse):
    creator_name: str
    token_symbol: str


class TradeExecuteResponse(BaseModel):
    success: bool
    transaction: TransactionResponse
    new_balance: float
    new_holding: Optional[HoldingResponse] = None


# ============ Portfolio Schemas ============

class PortfolioResponse(BaseModel):
    total_value: float
    total_invested: float
    total_pnl: float
    roi_pct: float
    nmbr_balance: float
    holdings: List[HoldingResponse]


# ============ Leaderboard Schemas ============

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    total_valuation: float  # portfolio_value + nmbr_balance
    portfolio_value: float
    nmbr_balance: float
    roi_pct: float
    total_invested: float


class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    my_rank: Optional[int] = None
    total_users: int


# ============ Faucet Schemas ============

class FaucetRequest(BaseModel):
    device_fingerprint: str


class FaucetResponse(BaseModel):
    success: bool
    amount_claimed: float
    new_balance: float


class UsernameRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")


class UsernameResponse(BaseModel):
    success: bool
    username: str


# ============ Price History ============

class PricePoint(BaseModel):
    timestamp: datetime
    price: float
    volume: float = 0.0


class PriceHistoryResponse(BaseModel):
    prices: List[PricePoint]


# ============ Error Response ============

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


# Forward references for nested models
UserWithHoldings.model_rebuild()
CreatorWithPool.model_rebuild()
