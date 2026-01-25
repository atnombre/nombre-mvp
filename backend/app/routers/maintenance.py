"""
Maintenance Router

Exposes endpoints for cron jobs (e.g. Supabase Edge Functions or pg_cron)
to trigger daily maintenance tasks.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from ..services.maintenance_service import run_all_maintenance
from ..config import get_settings

router = APIRouter()

async def verify_cron_secret(x_cron_secret: str = Header(None)):
    """
    Verify the request comes from an authorized cron job.
    """
    settings = get_settings()
    # If CRON_SECRET is not set in env, we default to a hardcoded one or fail
    # For MVP, let's assume if it's not set, we use a default "nombre-cron-secret"
    expected_secret = getattr(settings, "cron_secret", "nombre-cron-secret")
    
    if x_cron_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Unauthorized cron execution")
    return True


@router.post("/run-daily", response_model=dict)
async def trigger_daily_maintenance(
    authorized: bool = Depends(verify_cron_secret)
):
    """
    Trigger the daily maintenance tasks.
    Should be called once every 24 hours (e.g. at 00:00 UTC).
    """
    try:
        results = await run_all_maintenance()
        return {
            "status": "success",
            "message": "Daily maintenance completed successfully",
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from datetime import datetime
