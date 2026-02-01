from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""
    
    # YouTube API
    youtube_api_key: str = ""
    
    # CORS
    cors_origins: str = ""
    
    # App Settings
    debug: bool = False
    faucet_amount: float = 10000.0
    protocol_fee_pct: float = 1.0  # Base fee (used after decay)
    
    # Dynamic Fee Settings (Early Entry Mitigation)
    # Fee starts at max_fee_pct and decays to protocol_fee_pct
    # as more tokens are bought from the initial supply.
    max_fee_pct: float = 10.0  # Starting fee for very early trades
    fee_decay_threshold: float = 500_000  # Fee normalizes after this many tokens are bought
    initial_token_supply: float = 9_000_000  # Initial pool token supply
    
    # Security
    cron_secret: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
