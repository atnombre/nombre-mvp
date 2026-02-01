"""
Trading Engine Service

Implements the Constant Product Market Maker (x * y = k) bonding curve
for creator token trading.
"""

from dataclasses import dataclass
from typing import Tuple
from ..config import get_settings


@dataclass
class TradeResult:
    """Result of a trade calculation."""
    input_amount: float
    output_amount: float
    fee_amount: float
    fee_pct: float  # The actual fee percentage applied
    price_per_token: float
    price_impact_pct: float
    new_nmbr_reserve: float
    new_token_supply: float
    new_price: float


class TradingEngine:
    """
    AMM Trading Engine using Constant Product formula: x * y = k
    
    Where:
    - x = $NMBR reserve in pool
    - y = Creator token supply in pool
    - k = Constant (invariant)
    
    Includes Dynamic Fee System:
    - Early trades (when few tokens have been bought) pay higher fees.
    - Fee decays from max_fee_pct to base_fee_pct as tokens are bought.
    """
    
    def __init__(self, fee_pct: float = None):
        """
        Initialize trading engine.
        
        Args:
            fee_pct: Protocol fee percentage (default from settings).
                     This is the BASE fee after decay completes.
        """
        settings = get_settings()
        self.base_fee_pct = fee_pct if fee_pct is not None else settings.protocol_fee_pct
        self.max_fee_pct = settings.max_fee_pct
        self.fee_decay_threshold = settings.fee_decay_threshold
        self.initial_token_supply = settings.initial_token_supply
    
    def calculate_dynamic_fee_pct(self, current_token_supply: float) -> float:
        """
        Calculate the dynamic fee percentage based on how many tokens
        have been bought from the initial supply.
        
        Early buyers pay higher fees (up to max_fee_pct).
        Fee decays linearly to base_fee_pct after fee_decay_threshold tokens are bought.
        
        Args:
            current_token_supply: Current tokens remaining in pool.
        
        Returns:
            Fee percentage to apply (between base_fee_pct and max_fee_pct).
        """
        tokens_bought = self.initial_token_supply - current_token_supply
        
        # Clamp to valid range
        tokens_bought = max(0, tokens_bought)
        
        if tokens_bought >= self.fee_decay_threshold:
            # Decay complete, use base fee
            return self.base_fee_pct
        
        # Linear decay: fee = max - (max - base) * (tokens_bought / threshold)
        progress = tokens_bought / self.fee_decay_threshold
        fee_range = self.max_fee_pct - self.base_fee_pct
        current_fee = self.max_fee_pct - (fee_range * progress)
        
        return current_fee
    
    def get_current_price(self, nmbr_reserve: float, token_supply: float) -> float:
        """
        Get current spot price.
        
        Price = NMBR Reserve / Token Supply
        """
        if token_supply == 0:
            return 0.0
        return nmbr_reserve / token_supply
    
    def calculate_buy(
        self,
        nmbr_amount: float,
        nmbr_reserve: float,
        token_supply: float
    ) -> TradeResult:
        """
        Calculate a buy trade (NMBR -> Creator Token).
        
        Args:
            nmbr_amount: Amount of $NMBR to spend
            nmbr_reserve: Current $NMBR in pool
            token_supply: Current tokens in pool
        
        Returns:
            TradeResult with tokens received and new pool state
        """
        # Calculate dynamic fee based on current supply
        fee_pct = self.calculate_dynamic_fee_pct(token_supply)
        
        # Calculate fee (deducted from input)
        fee_amount = nmbr_amount * (fee_pct / 100)
        nmbr_after_fee = nmbr_amount - fee_amount
        
        # Constant product: k = x * y
        k = nmbr_reserve * token_supply
        
        # New reserves after adding $NMBR
        new_nmbr_reserve = nmbr_reserve + nmbr_after_fee
        
        # Calculate new token supply to maintain k
        new_token_supply = k / new_nmbr_reserve
        
        # Tokens user receives
        tokens_received = token_supply - new_token_supply
        
        # Prices
        old_price = self.get_current_price(nmbr_reserve, token_supply)
        new_price = self.get_current_price(new_nmbr_reserve, new_token_supply)
        
        # Price impact
        price_impact = ((new_price - old_price) / old_price) * 100 if old_price > 0 else 0
        
        # Effective price per token
        price_per_token = nmbr_amount / tokens_received if tokens_received > 0 else 0
        
        return TradeResult(
            input_amount=nmbr_amount,
            output_amount=tokens_received,
            fee_amount=fee_amount,
            fee_pct=fee_pct,
            price_per_token=price_per_token,
            price_impact_pct=price_impact,
            new_nmbr_reserve=new_nmbr_reserve,
            new_token_supply=new_token_supply,
            new_price=new_price
        )
    
    def calculate_sell(
        self,
        token_amount: float,
        nmbr_reserve: float,
        token_supply: float
    ) -> TradeResult:
        """
        Calculate a sell trade (Creator Token -> NMBR).
        
        Args:
            token_amount: Amount of tokens to sell
            nmbr_reserve: Current $NMBR in pool
            token_supply: Current tokens in pool
        
        Returns:
            TradeResult with NMBR received and new pool state
        """
        # Constant product: k = x * y
        k = nmbr_reserve * token_supply
        
        # New token supply after adding tokens back
        new_token_supply = token_supply + token_amount
        
        # Calculate new $NMBR reserve
        new_nmbr_reserve = k / new_token_supply
        
        # $NMBR user receives (before fee)
        nmbr_gross = nmbr_reserve - new_nmbr_reserve
        
        # Calculate fee (deducted from output)
        # Sells use base fee (no dynamic penalty for selling)
        fee_amount = nmbr_gross * (self.base_fee_pct / 100)
        nmbr_received = nmbr_gross - fee_amount
        
        # Prices
        old_price = self.get_current_price(nmbr_reserve, token_supply)
        new_price = self.get_current_price(new_nmbr_reserve, new_token_supply)
        
        # Price impact (negative for sells)
        price_impact = ((old_price - new_price) / old_price) * 100 if old_price > 0 else 0
        
        # Effective price per token
        price_per_token = nmbr_received / token_amount if token_amount > 0 else 0
        
        return TradeResult(
            input_amount=token_amount,
            output_amount=nmbr_received,
            fee_amount=fee_amount,
            fee_pct=self.base_fee_pct,
            price_per_token=price_per_token,
            price_impact_pct=price_impact,
            new_nmbr_reserve=new_nmbr_reserve,
            new_token_supply=new_token_supply,
            new_price=new_price
        )
    
    def get_tokens_for_nmbr(
        self,
        nmbr_amount: float,
        nmbr_reserve: float,
        token_supply: float
    ) -> float:
        """
        Quick calculation: How many tokens for X $NMBR?
        """
        result = self.calculate_buy(nmbr_amount, nmbr_reserve, token_supply)
        return result.output_amount
    
    def get_nmbr_for_tokens(
        self,
        token_amount: float,
        nmbr_reserve: float,
        token_supply: float
    ) -> float:
        """
        Quick calculation: How much $NMBR for X tokens?
        """
        result = self.calculate_sell(token_amount, nmbr_reserve, token_supply)
        return result.output_amount
    
    def check_slippage(
        self,
        expected_output: float,
        actual_output: float,
        max_slippage_pct: float
    ) -> Tuple[bool, float]:
        """
        Check if trade exceeds slippage tolerance.
        
        Returns:
            (is_within_tolerance, actual_slippage_pct)
        """
        if expected_output == 0:
            return True, 0.0
        
        slippage = ((expected_output - actual_output) / expected_output) * 100
        return slippage <= max_slippage_pct, slippage


# Singleton instance
_trading_engine: TradingEngine | None = None


def get_trading_engine() -> TradingEngine:
    """Get trading engine singleton."""
    global _trading_engine
    if _trading_engine is None:
        _trading_engine = TradingEngine()
    return _trading_engine
