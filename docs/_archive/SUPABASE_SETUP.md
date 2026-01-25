# Supabase Setup Guide

Follow these steps to set up Supabase for the Nombre MVP.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `nombre-mvp`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

---

## Step 2: Get API Credentials

Once your project is ready:

1. Go to **Settings** → **API** (in the left sidebar)
2. Copy these values:

| Key | Where to find |
|-----|---------------|
| **Project URL** | Under "Project URL" |
| **anon public** | Under "Project API keys" |
| **service_role** | Under "Project API keys" (click "Reveal") |

> ⚠️ **Keep `service_role` secret!** Never expose it in frontend code.

---

## Step 3: Create Environment Files

### Frontend `.env`
Create `/nombre-mvp-1/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:8000
```

### Backend `.env`
Create `/nombre-mvp-1/backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CORS_ORIGINS=http://localhost:5173
DEBUG=true
FAUCET_AMOUNT=10000.0
PROTOCOL_FEE_PCT=1.0
```

---

## Step 4: Run Database Migrations

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"** (or Cmd+Enter)
5. Repeat for `supabase/migrations/002_seed_data.sql`

You should see "Success" after each migration.

---

## Step 5: Enable Google OAuth

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **"Enable Sign in with Google"**
4. You'll need to set up Google OAuth credentials:

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Choose **"Web application"**
6. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

### Add to Supabase

1. Back in Supabase Auth settings
2. Paste the **Client ID** and **Client Secret**
3. Click **"Save"**

---

## Step 6: Configure Auth Redirect

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173`

---

## Step 7: Verify Setup

### Check Tables
Go to **Table Editor** - you should see:
- `users`
- `creators` (with 8 sample creators)
- `pools`
- `user_holdings`
- `transactions`
- `price_history`

### Test API Connection
```bash
curl https://your-project-id.supabase.co/rest/v1/creators \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

Should return the sample creators.

---

## Troubleshooting

### "Invalid API key"
- Check that you copied the full key (they're long!)
- Make sure you're using `anon` key in frontend, `service_role` in backend

### "Table doesn't exist"
- Run the migrations again in SQL Editor
- Check for any errors in the query output

### "OAuth redirect error"
- Verify redirect URLs in both Supabase and Google Console
- Make sure Site URL is set correctly

---

## Next Steps

After setup is complete, let me know and we'll:
1. Test the connection
2. Build the CreatorProfile trading page
