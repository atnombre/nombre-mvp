# Nombre

> **Trade Your Favorite Creators Like Stocks**

Nombre is a SocialFi platform where fans can invest in their favorite YouTubers using play money ($NMBR tokens). Creator "stock" prices are driven by real YouTube performance metrics and market demand.

![Status](https://img.shields.io/badge/status-MVP-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 What is Nombre?

Nombre turns **creator reputation into a tradable asset**. Each creator has their own token with prices determined by:

1. **Creator Performance Index (CPI)** - A 0-1000 score based on YouTube metrics (subscribers, views, momentum)
2. **Market Demand** - An AMM bonding curve (x × y = k) where buying increases price and selling decreases it

**Current Phase**: MVP / Closed Beta  
Users compete on a leaderboard using play money to achieve the highest portfolio ROI.

---

## ✨ Features

- 🔐 **Google OAuth** - Quick sign-up via Supabase Auth
- 💰 **Faucet System** - New users receive 10,000 $NMBR to start trading
- 📈 **Real-time Trading** - Buy/sell creator tokens with instant price updates
- 📊 **Portfolio Tracking** - Monitor holdings, P&L, and ROI
- 🏆 **Leaderboard** - Compete for the best returns
- 📺 **YouTube Integration** - Add any creator via YouTube Data API
- 📱 **Mobile Responsive** - Full experience on any device

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account
- YouTube Data API key (optional, for adding creators)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nombre-mvp.git
cd nombre-mvp

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Setup

Create `.env` in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
YOUTUBE_API_KEY=your-youtube-api-key
FAUCET_AMOUNT=10000.0
PROTOCOL_FEE_PCT=1.0
```

### Running the App

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start frontend
npm run dev
```

Visit **http://localhost:5173** to see the app.

---

## 📁 Project Structure

```
nombre-mvp/
├── docs/                      # 📖 Documentation (you are here)
│   ├── architecture.md        # System design & tech stack
│   ├── getting-started.md     # Detailed setup guide
│   ├── api-reference.md       # Backend API documentation
│   ├── database-schema.md     # PostgreSQL tables & relationships
│   ├── trading-mechanics.md   # CPI, bonding curve, formulas
│   ├── design-system.md       # UI/UX guidelines & components
│   └── development/           # Dev guides & scripts
├── src/                       # Frontend (React + TypeScript)
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Route pages
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client
│   └── stores/                # Zustand state management
├── backend/                   # Backend (Python FastAPI)
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Pydantic schemas
│   │   └── utils/             # Helpers (CPI calculation)
│   └── scripts/               # Maintenance scripts
└── supabase/                  # Database migrations
    └── migrations/
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, tech stack, data flow |
| [Getting Started](docs/getting-started.md) | Full setup guide with Supabase & OAuth |
| [API Reference](docs/api-reference.md) | All backend endpoints with examples |
| [Database Schema](docs/database-schema.md) | Tables, relationships, RLS policies |
| [Trading Mechanics](docs/trading-mechanics.md) | CPI formula, bonding curve, portfolio math |
| [Design System](docs/design-system.md) | Colors, typography, components |

---

## 🔧 Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Vite | Modern SPA with type safety |
| **Styling** | CSS-in-JS + Tailwind | Component-scoped dark theme |
| **Backend** | Python FastAPI | Async API with auto-docs |
| **Database** | Supabase (PostgreSQL) | BaaS with real-time subscriptions |
| **Auth** | Supabase Auth | Google OAuth, JWT sessions |
| **Charts** | Recharts | Interactive price charts |

---

## 🎮 How Trading Works

1. **CPI Calculation**: Each creator gets a score (0-1000) based on:
   - 30% - Subscriber count (stability)
   - 60% - 30-day views (momentum)
   - 10% - Lifetime views (credibility)

2. **Initial Price**: `price = (CPI × 100) / 9,000,000`

3. **Bonding Curve**: Uses constant product formula `x × y = k`
   - Buying removes tokens from pool → price increases
   - Selling adds tokens back → price decreases

4. **Fee**: 1% protocol fee on all trades

See [Trading Mechanics](docs/trading-mechanics.md) for detailed formulas.

---

## 🛠️ Scripts

```bash
# Reset MVP (clear all trades, reset users)
cd backend && python scripts/reset_mvp.py --force

# Add top YouTubers
cd backend && python scripts/add_top_youtubers.py

# Daily maintenance (snapshots, volume reset)
cd backend && python scripts/daily_maintenance.py
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Recharts](https://recharts.org) - Chart library
- [Lucide](https://lucide.dev) - Icon library