from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import auth, users, creators, trading, portfolio, leaderboard, maintenance

settings = get_settings()

app = FastAPI(
    title="Nombre API",
    description="SocialFi Creator Stock Trading Platform",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS Configuration
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
    origins.append(origin)

# If wildcard is present, simplify
if "*" in origins:
    origins = ["*"]

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
