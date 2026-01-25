"""
Faucet Service

Manages initial token distribution to new users with anti-cheat protection.
"""

from typing import Tuple
from ..database import get_supabase
from ..config import get_settings


async def can_claim_faucet(
    user_id: str,
    device_fingerprint: str
) -> Tuple[bool, str]:
    """
    Check if user can claim faucet tokens.
    
    Anti-cheat checks:
    1. Has this user already claimed?
    2. Is this device fingerprint already used?
    
    Returns:
        (can_claim, reason_code)
    """
    supabase = get_supabase()
    
    # Check 1: Has user already claimed?
    user_response = supabase.table("users").select(
        "faucet_claimed"
    ).eq("id", user_id).single().execute()
    
    if user_response.data and user_response.data.get("faucet_claimed"):
        return False, "ALREADY_CLAIMED"
    
    # Check 2: Is device already used?
    device_response = supabase.table("users").select("id").eq(
        "device_fingerprint", device_fingerprint
    ).neq("id", user_id).execute()
    
    if device_response.data and len(device_response.data) > 0:
        return False, "DEVICE_BLOCKED"
    
    return True, "OK"


async def claim_faucet(
    user_id: str,
    device_fingerprint: str
) -> Tuple[bool, float, str]:
    """
    Claim faucet tokens for a user.
    
    Returns:
        (success, new_balance, error_code)
    """
    settings = get_settings()
    supabase = get_supabase()
    
    # Check if can claim
    can_claim, reason = await can_claim_faucet(user_id, device_fingerprint)
    
    if not can_claim:
        return False, 0.0, reason
    
    # Get current balance
    user_response = supabase.table("users").select(
        "nmbr_balance"
    ).eq("id", user_id).single().execute()
    
    current_balance = float(user_response.data.get("nmbr_balance", 0))
    new_balance = current_balance + settings.faucet_amount
    
    # Update user: add balance, mark faucet claimed, store fingerprint
    supabase.table("users").update({
        "nmbr_balance": new_balance,
        "faucet_claimed": True,
        "device_fingerprint": device_fingerprint
    }).eq("id", user_id).execute()
    
    return True, new_balance, "OK"
