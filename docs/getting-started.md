# Getting Started

This guide walks you through setting up the Nombre development environment from scratch.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.10+ ([download](https://python.org/))
- **Git** ([download](https://git-scm.com/))
- A **Supabase** account ([sign up](https://supabase.com/))
- A **Google Cloud** project (for OAuth)
- Optional: **YouTube Data API** key (for adding creators)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/nombre-mvp.git
cd nombre-mvp
```

---

## Step 2: Create Supabase Project

### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `nombre-mvp`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

### 2.2 Get API Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:

| Key | Where to Find |
|-----|---------------|
| **Project URL** | Under "Project URL" |
| **anon public key** | Under "Project API keys" |
| **service_role key** | Under "Project API keys" (click "Reveal") |

> ⚠️ **Security Warning**: Keep the `service_role` key secret! Never expose it in frontend code or commit it to version control.

### 2.3 Run Database Migrations

1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/migrations/001_initial_schema.sql`, copy the contents
4. Paste into the editor and click **"Run"** (or Cmd/Ctrl + Enter)
5. Verify success, then repeat for `002_seed_data.sql`

You should now see these tables in the **Table Editor**:
- `users`
- `creators`
- `pools`
- `user_holdings`
- `transactions`
- `price_history`

---

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Select **"Web application"**
6. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**

### 3.2 Configure Supabase Auth

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **"Enable Sign in with Google"** ON
4. Paste the **Client ID** and **Client Secret**
5. Click **"Save"**

### 3.3 Set Auth Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173`

---

## Step 4: Configure YouTube API (Optional)

This is only needed if you want to add new creators via YouTube search.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **YouTube Data API v3**
3. Create an **API Key** (no OAuth needed)
4. Copy the key for your backend `.env`

**Quota**: Free tier provides 10,000 units/day, which is plenty for development.

---

## Step 5: Set Up Environment Variables

### 5.1 Frontend Environment

Create `.env` in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
VITE_API_URL=http://localhost:8000
```

### 5.2 Backend Environment

Create `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# YouTube (optional)
YOUTUBE_API_KEY=AIza...

# App Settings
FAUCET_AMOUNT=10000.0
PROTOCOL_FEE_PCT=1.0

# CORS (for local development)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## Step 6: Install Dependencies

### 6.1 Frontend

```bash
# From project root
npm install
```

### 6.2 Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## Step 7: Start the Development Servers

### 7.1 Start Backend

```bash
# Terminal 1 (in backend/ directory)
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### 7.2 Start Frontend

```bash
# Terminal 2 (in project root)
npm run dev
```

The app will be available at http://localhost:5173

---

## Step 8: Verify Setup

### 8.1 Test the App

1. Open http://localhost:5173 in your browser
2. Click **"Sign Up"** or **"Log In"**
3. Authenticate with Google
4. You should see the Dashboard

### 8.2 Claim Faucet

1. After signing in, you'll see a **"Claim 10,000 $NMBR"** banner
2. Click **"Claim Tokens"**
3. Your balance should update to 10,000 $NMBR

### 8.3 Make a Test Trade

1. Go to **Explore** page
2. Click on any creator
3. Enter an amount (e.g., 100 NMBR)
4. Click **"Buy"**
5. Check your **Portfolio** to see the holding

---

## Troubleshooting

### "Invalid API key"

- Verify you copied the complete key (they're long strings)
- Frontend uses `anon` key, backend uses `service_role`
- Check that the keys are in the correct `.env` file

### "Table doesn't exist"

- Run both migrations in SQL Editor
- Check for errors in the query output
- Verify tables appear in Table Editor

### "OAuth redirect error"

- Verify redirect URLs match exactly in both Google Console and Supabase
- Include the full path: `http://localhost:5173/auth/callback`
- Check Site URL is set to `http://localhost:5173`

### "CORS error" in browser console

- Ensure `CORS_ORIGINS` in backend `.env` includes your frontend URL
- Restart the backend server after changing `.env`

### Backend import errors

- Ensure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Charts show "No data"

- Run the seed script: `python scripts/seed_price_history.py`
- Make some trades to generate price history

---

## Development Tips

### Hot Reload

Both frontend (Vite) and backend (uvicorn with `--reload`) support hot reload. Save a file and see changes instantly.

### Database Inspection

Use Supabase **Table Editor** to inspect and modify data directly during development.

### API Testing

Use the Swagger UI at http://localhost:8000/docs to test API endpoints interactively.

### Real-time Debugging

Open browser DevTools → Network tab → WS to see Supabase real-time messages.

---

## Next Steps

- Read [Trading Mechanics](trading-mechanics.md) to understand the AMM
- Explore [API Reference](api-reference.md) for all endpoints
- Check [Database Schema](database-schema.md) for data model details
- See [Design System](design-system.md) for UI guidelines
