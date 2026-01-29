from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import auth, users, creators, trading, portfolio, leaderboard, maintenance, admin

settings = get_settings()

# DEBUG: Log loaded settings at startup
print(f"=== STARTUP DEBUG ===")
print(f"SUPABASE_URL: '{settings.supabase_url[:30]}...' (len={len(settings.supabase_url)})" if settings.supabase_url else "SUPABASE_URL: EMPTY!")
print(f"SUPABASE_SERVICE_KEY: '{settings.supabase_service_key[:10]}...' (len={len(settings.supabase_service_key)})" if settings.supabase_service_key else "SUPABASE_SERVICE_KEY: EMPTY!")
print(f"CORS_ORIGINS: '{settings.cors_origins}'")
print(f"=== END DEBUG ===")

app = FastAPI(
    title="Nombre API",
    description="SocialFi Creator Stock Trading Platform",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS Configuration
raw_origins = settings.cors_origins.split(",")
origins = []
for origin in raw_origins:
    origin = origin.strip()
    # Remove quotes if user added them
    origin = origin.replace('"', '').replace("'", "")
    # Remove trailing slash if present
    if origin.endswith("/"):
        origin = origin[:-1]
    if origin:  # Only add non-empty origins
        origins.append(origin)

# Check if wildcard mode
is_wildcard = "*" in origins or not origins

print(f"DEBUG CORS: origins={origins}, is_wildcard={is_wildcard}")

if is_wildcard:
    # Use regex to match any origin - this properly handles preflight
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r".*",  # Match any origin
        allow_credentials=False,   # Required when allowing all origins
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Explicit origins - enable credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(creators.router, prefix="/api/v1/creators", tags=["creators"])
app.include_router(trading.router, prefix="/api/v1/trade", tags=["trading"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["leaderboard"])
app.include_router(maintenance.router, prefix="/api/v1/maintenance", tags=["maintenance"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Nombre API is running"}


@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "debug": settings.debug
    }
