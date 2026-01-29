"""
Trading Router

Handles buy/sell quotes and trade execution.
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import uuid

from ..database import get_supabase
from ..models.schemas import (
    TradeQuoteRequest, TradeQuoteResponse,
    TradeExecuteRequest, TradeExecuteResponse,
    TransactionResponse, HoldingResponse,
    TransactionWithCreator
)
from ..services.trading_engine import get_trading_engine
from ..services.portfolio_service import update_avg_buy_price, update_user_portfolio_stats
from ..config import get_settings
from .auth import get_current_user

router = APIRouter()


from .auth import get_current_user

router = APIRouter()


@router.post("/quote", response_model=TradeQuoteResponse)
async def get_trade_quote(
    request: TradeQuoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a price quote before executing trade.
    """
    supabase = get_supabase()
    settings = get_settings()
    engine = get_trading_engine()
    
    # Get pool for creator
    pool_response = supabase.table("pools").select(
        "*, creators(token_symbol)"
    ).eq("creator_id", request.creator_id).single().execute()
    
    if not pool_response.data:
        raise HTTPException(status_code=404, detail="Pool not found for creator")
    
    pool = pool_response.data
    creator = pool.get("creators", {})
    token_symbol = creator.get("token_symbol", "TOKEN")
    
    nmbr_reserve = float(pool["nmbr_reserve"])
    token_supply = float(pool["token_supply"])
    
    if request.type == "buy":
        # User spending $NMBR to buy tokens
        if request.amount_type == "nmbr":
            nmbr_amount = request.amount
            result = engine.calculate_buy(nmbr_amount, nmbr_reserve, token_supply)
            
            return TradeQuoteResponse(
                type="buy",
                input_amount=nmbr_amount,
                input_currency="NMBR",
                output_amount=result.output_amount,
                output_currency=token_symbol,
                price_per_token=result.price_per_token,
                price_impact_pct=result.price_impact_pct,
                fee_amount=result.fee_amount,
                fee_pct=settings.protocol_fee_pct,
                expires_at=datetime.utcnow() + timedelta(minutes=5)
            )
        else:
            # Calculate how much NMBR needed for X tokens
            # This is a reverse calculation - iterate to find the right amount
            raise HTTPException(status_code=400, detail="Buying by token amount not yet supported")
    
    else:  # sell
        if request.amount_type == "token":
            token_amount = request.amount
            result = engine.calculate_sell(token_amount, nmbr_reserve, token_supply)
            
            return TradeQuoteResponse(
                type="sell",
                input_amount=token_amount,
                input_currency=token_symbol,
                output_amount=result.output_amount,
                output_currency="NMBR",
                price_per_token=result.price_per_token,
                price_impact_pct=result.price_impact_pct,
                fee_amount=result.fee_amount,
                fee_pct=settings.protocol_fee_pct,
                expires_at=datetime.utcnow() + timedelta(minutes=5)
            )
        else:
            raise HTTPException(status_code=400, detail="Selling by NMBR amount not yet supported")


@router.post("/execute", response_model=TradeExecuteResponse)
async def execute_trade(
    request: TradeExecuteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Execute a trade.
    """
    supabase = get_supabase()
    engine = get_trading_engine()
    
    # Validate input
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    if request.amount < 0.0001:
        raise HTTPException(status_code=400, detail="Amount too small. Minimum is 0.0001")
    
    if request.max_slippage_pct is None:
        request.max_slippage_pct = 5.0  # Default 5% slippage
    
    user_id = current_user["id"]
    user_balance = float(current_user.get("nmbr_balance", 0))
    
    # Get pool
    pool_response = supabase.table("pools").select(
        "*, creators(id, token_symbol, display_name, avatar_url)"
    ).eq("creator_id", request.creator_id).single().execute()
    
    if not pool_response.data:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    pool = pool_response.data
    creator = pool.get("creators", {})
    pool_id = pool["id"]
    nmbr_reserve = float(pool["nmbr_reserve"])
    token_supply = float(pool["token_supply"])
    
    if request.type == "buy":
        nmbr_amount = request.amount
        
        # Check balance
        if user_balance < nmbr_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Required: {nmbr_amount}, Available: {user_balance}"
            )
        
        # Get quote first to compare for slippage
        quote_result = engine.calculate_buy(nmbr_amount, nmbr_reserve, token_supply)
        expected_output = quote_result.output_amount
        
        # Re-fetch pool to get latest state (in case of concurrent trades)
        pool_response_fresh = supabase.table("pools").select("*").eq("id", pool_id).single().execute()
        if pool_response_fresh.data:
            nmbr_reserve = float(pool_response_fresh.data["nmbr_reserve"])
            token_supply = float(pool_response_fresh.data["token_supply"])
        
        # Calculate actual trade with current state
        result = engine.calculate_buy(nmbr_amount, nmbr_reserve, token_supply)
        
        # Check slippage against expected
        is_ok, actual_slippage = engine.check_slippage(
            expected_output, result.output_amount, request.max_slippage_pct
        )
        
        if not is_ok:
            raise HTTPException(
                status_code=400,
                detail=f"Slippage tolerance exceeded. Expected {expected_output:.4f} tokens but would receive {result.output_amount:.4f} ({actual_slippage:.2f}% slippage)"
            )
        
        # Update user balance
        new_balance = user_balance - nmbr_amount
        supabase.table("users").update({
            "nmbr_balance": new_balance,
            "total_invested": float(current_user.get("total_invested", 0)) + nmbr_amount
        }).eq("id", user_id).execute()
        
        # Update pool - include market_cap and volume_all_time
        # Market cap = current_price × total_supply (10M tokens)
        total_token_supply = 10_000_000  # Total minted tokens
        new_market_cap = result.new_price * total_token_supply
        
        supabase.table("pools").update({
            "nmbr_reserve": result.new_nmbr_reserve,
            "token_supply": result.new_token_supply,
            "current_price": result.new_price,
            "market_cap": new_market_cap,
            "volume_24h": float(pool.get("volume_24h", 0)) + nmbr_amount,
            "volume_all_time": float(pool.get("volume_all_time", 0)) + nmbr_amount
        }).eq("id", pool_id).execute()
        
        # Record price history
        supabase.table("price_history").insert({
            "pool_id": pool_id,
            "price": result.new_price,
            "volume": nmbr_amount,
        }).execute()
        
        # Update or create holding
        holding_response = supabase.table("user_holdings").select("*").eq(
            "user_id", user_id
        ).eq("creator_id", request.creator_id).execute()
        
        is_new_holder = not holding_response.data
        
        # Track the final holding values for the response
        final_token_amount = result.output_amount
        final_avg_price = result.price_per_token
        final_cost_basis = nmbr_amount
        
        if holding_response.data:
            # Update existing holding
            existing = holding_response.data[0]
            final_token_amount = float(existing["token_amount"]) + result.output_amount
            final_avg_price = update_avg_buy_price(
                float(existing["token_amount"]),
                float(existing.get("avg_buy_price", 0)),
                result.output_amount,
                result.price_per_token
            )
            final_cost_basis = float(existing.get("total_cost_basis", 0)) + nmbr_amount
            
            supabase.table("user_holdings").update({
                "token_amount": final_token_amount,
                "avg_buy_price": final_avg_price,
                "total_cost_basis": final_cost_basis
            }).eq("id", existing["id"]).execute()
        else:
            # Create new holding
            supabase.table("user_holdings").insert({
                "user_id": user_id,
                "creator_id": request.creator_id,
                "token_amount": result.output_amount,
                "avg_buy_price": result.price_per_token,
                "total_cost_basis": nmbr_amount
            }).execute()
        
        # Update holder count if new holder
        if is_new_holder:
            current_holder_count = pool.get("holder_count", 0) or 0
            supabase.table("pools").update({
                "holder_count": current_holder_count + 1
            }).eq("id", pool_id).execute()
        
        # Create transaction record
        tx_data = {
            "user_id": user_id,
            "pool_id": pool_id,
            "type": "buy",
            "token_amount": result.output_amount,
            "nmbr_amount": nmbr_amount,
            "price_per_token": result.price_per_token,
            "fee_amount": result.fee_amount,
            "slippage_pct": actual_slippage,
            "price_impact_pct": result.price_impact_pct
        }
        tx_response = supabase.table("transactions").insert(tx_data).execute()
        tx = tx_response.data[0]
        
        # Update portfolio stats
        await update_user_portfolio_stats(user_id)
        

        
        # Calculate PnL for the total holding
        current_value = final_token_amount * result.new_price
        pnl = current_value - final_cost_basis
        pnl_pct = (pnl / final_cost_basis * 100) if final_cost_basis > 0 else 0
        
        return TradeExecuteResponse(
            success=True,
            transaction=TransactionResponse(**tx),
            new_balance=new_balance,
            new_holding=HoldingResponse(
                creator_id=request.creator_id,
                creator_name=creator.get("display_name", ""),
                avatar_url=creator.get("avatar_url"),
                token_symbol=creator.get("token_symbol", ""),
                token_amount=final_token_amount,
                avg_buy_price=final_avg_price,
                current_price=result.new_price,
                current_value=current_value,
                cost_basis=final_cost_basis,
                pnl=pnl,
                pnl_pct=pnl_pct
            )
        )
    
    else:  # sell
        token_amount = request.amount
        
        # Check holding
        holding_response = supabase.table("user_holdings").select("*").eq(
            "user_id", user_id
        ).eq("creator_id", request.creator_id).single().execute()
        
        if not holding_response.data:
            raise HTTPException(status_code=400, detail="You don't own any of these tokens")
        
        holding = holding_response.data
        current_holding = float(holding["token_amount"])
        
        if current_holding < token_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient tokens. Have: {current_holding}, Selling: {token_amount}"
            )
        
        # Get quote first to compare for slippage
        quote_result = engine.calculate_sell(token_amount, nmbr_reserve, token_supply)
        expected_output = quote_result.output_amount
        
        # Re-fetch pool to get latest state (in case of concurrent trades)
        pool_response_fresh = supabase.table("pools").select("*").eq("id", pool_id).single().execute()
        if pool_response_fresh.data:
            nmbr_reserve = float(pool_response_fresh.data["nmbr_reserve"])
            token_supply = float(pool_response_fresh.data["token_supply"])
        
        # Calculate actual trade with current state
        result = engine.calculate_sell(token_amount, nmbr_reserve, token_supply)
        
        # Check slippage against expected
        is_ok, actual_slippage = engine.check_slippage(
            expected_output, result.output_amount, request.max_slippage_pct
        )
        
        if not is_ok:
            raise HTTPException(
                status_code=400,
                detail=f"Slippage tolerance exceeded. Expected {expected_output:.4f} NMBR but would receive {result.output_amount:.4f} ({actual_slippage:.2f}% slippage)"
            )
        
        # Calculate the gross NMBR value of this trade (before fee) for volume tracking
        nmbr_gross = result.output_amount + result.fee_amount
        
        # Calculate how much of total_invested to remove
        # Proportional to tokens sold vs total tokens held before sell
        avg_buy_price = float(holding.get("avg_buy_price", 0))
        invested_portion_sold = token_amount * avg_buy_price
        current_total_invested = float(current_user.get("total_invested", 0))
        new_total_invested = max(0, current_total_invested - invested_portion_sold)
        
        # Update user balance and total_invested
        new_balance = user_balance + result.output_amount
        supabase.table("users").update({
            "nmbr_balance": new_balance,
            "total_invested": new_total_invested
        }).eq("id", user_id).execute()
        
        # Update pool - include market_cap and volume_all_time
        total_token_supply = 10_000_000  # Total minted tokens
        new_market_cap = result.new_price * total_token_supply
        
        supabase.table("pools").update({
            "nmbr_reserve": result.new_nmbr_reserve,
            "token_supply": result.new_token_supply,
            "current_price": result.new_price,
            "market_cap": new_market_cap,
            "volume_24h": float(pool.get("volume_24h", 0)) + nmbr_gross,
            "volume_all_time": float(pool.get("volume_all_time", 0)) + nmbr_gross
        }).eq("id", pool_id).execute()
        
        # Record price history (use gross volume for consistency)
        supabase.table("price_history").insert({
            "pool_id": pool_id,
            "price": result.new_price,
            "volume": nmbr_gross,
        }).execute()
        
        # Update holding
        new_token_amount = current_holding - token_amount
        sold_all_tokens = new_token_amount <= 0
        
        if new_token_amount > 0:
            supabase.table("user_holdings").update({
                "token_amount": new_token_amount
            }).eq("id", holding["id"]).execute()
        else:
            # Remove holding if sold all
            supabase.table("user_holdings").delete().eq("id", holding["id"]).execute()
        
        # Update holder count if sold all tokens
        if sold_all_tokens:
            current_holder_count = pool.get("holder_count", 0) or 0
            if current_holder_count > 0:
                supabase.table("pools").update({
                    "holder_count": current_holder_count - 1
                }).eq("id", pool_id).execute()
        
        # Create transaction record
        tx_data = {
            "user_id": user_id,
            "pool_id": pool_id,
            "type": "sell",
            "token_amount": token_amount,
            "nmbr_amount": result.output_amount,
            "price_per_token": result.price_per_token,
            "fee_amount": result.fee_amount,
            "slippage_pct": actual_slippage,
            "price_impact_pct": result.price_impact_pct
        }
        tx_response = supabase.table("transactions").insert(tx_data).execute()
        tx = tx_response.data[0]
        
        # Update portfolio stats
        await update_user_portfolio_stats(user_id)
        

        
        # Calculate remaining holding info
        remaining_holding = None
        if new_token_amount > 0:
            avg_buy_price = float(holding.get("avg_buy_price", 0))
            current_value = new_token_amount * result.new_price
            cost_basis = new_token_amount * avg_buy_price
            pnl = current_value - cost_basis
            pnl_pct = (pnl / cost_basis * 100) if cost_basis > 0 else 0
            
            remaining_holding = HoldingResponse(
                creator_id=request.creator_id,
                creator_name=creator.get("display_name", ""),
                avatar_url=creator.get("avatar_url"),
                token_symbol=creator.get("token_symbol", ""),
                token_amount=new_token_amount,
                avg_buy_price=avg_buy_price,
                current_price=result.new_price,
                current_value=current_value,
                cost_basis=cost_basis,
                pnl=pnl,
                pnl_pct=pnl_pct
            )
        
        return TradeExecuteResponse(
            success=True,
            transaction=TransactionResponse(**tx),
            new_balance=new_balance,
            new_holding=remaining_holding
        )


@router.get("/history", response_model=dict)
async def get_trade_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    creator_id: str = None
):
    """
    Get user's transaction history.
    """
    supabase = get_supabase()
    
    query = supabase.table("transactions").select(
        "*, pools(creators(display_name, token_symbol))",
        count="exact"
    ).eq("user_id", current_user["id"])
    
    if creator_id:
        query = query.eq("pool_id", creator_id)
    
    response = query.order("created_at", desc=True).range(
        offset, offset + limit - 1
    ).execute()
    
    transactions = []
    for row in response.data:
        pools = row.get("pools", {})
        creator = pools.get("creators", {}) if pools else {}
        
        transactions.append({
            **row,
            "creator_name": creator.get("display_name", "Unknown"),
            "token_symbol": creator.get("token_symbol", "???")
        })
    
    return {
        "transactions": transactions,
        "total": response.count or len(transactions)
    }
