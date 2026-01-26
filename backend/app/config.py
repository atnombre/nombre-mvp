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
    protocol_fee_pct: float = 1.0
    
    # Security
    cron_secret: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
