# Deployment Guide

This guide details how to deploy the Nombre MVP to production using **Vercel** (Frontend) and **Render** (Backend).

---

## 🏗 System Architecture

- **Frontend**: React + Vite (Deployed on Vercel)
- **Backend**: Python FastAPI (Deployed on Render)
- **Database**: Supabase (Cloud Hosted)

---

## 1. Prerequisites

Ensure you have the following ready:
- GitHub account (with this repository pushed)
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- [Supabase](https://supabase.com) project URL and keys

---

## 2. Backend Deployment (Render)

We will deploy the backend first to get the API URL.

### Option A: Using `render.yaml` (Blueprints)
1. In Render Dashboard, click **New +** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect `backend/render.yaml` (if it exists) and auto-configure the service.
4. Fill in the environment variables when prompted.

### Option B: Manual Setup (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your repository.
4. Configure the service:
   - **Name**: `nombre-backend`
   - **Region**: Same as your Supabase region (recommended)
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
   - **Plan**: Free

### Environment Variables (Render)
Add the following keys in the "Environment" tab:

| Key | Value | Description |
|-----|-------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase Settings |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | From Supabase Settings (Service Role) |
| `YOUTUBE_API_KEY` | `AIza...` | Google Cloud Console |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | **Update this after deploying frontend** |
| `DEBUG` | `false` | Disable debug mode in prod |
| `CRON_SECRET` | `your-secret-string` | Protection for maintenance endpoints |
| `PYTHON_VERSION` | `3.10.0` | (Optional) Force Python version |

> **Note**: Initially, you can set `CORS_ORIGINS` to `*` to test, but lock it down to your Vercel domain later properly.

---

## 3. Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your `nombre-mvp` repository.
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables (Vercel)
Expand the "Environment Variables" section:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase Settings |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings (Anon Key) |
| `VITE_API_URL` | `https://nombre-backend.onrender.com` | **Your Render Backend URL** |

5. Click **Deploy**.

---

## 4. Post-Deployment Configuration

### 4.1 Update CORS on Backend
Once your frontend is live (e.g., `https://nombre-mvp.vercel.app`), go back to Render:
1. Go to **Environment** settings.
2. Update `CORS_ORIGINS` to your actual Vercel URL.
3. Render will auto-redeploy.

### 4.2 Configure Supabase Auth
1. Go to Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g., `https://nombre-mvp.vercel.app`).
3. Add **Redirect URLs**:
   - `https://nombre-mvp.vercel.app/auth/callback`
   - `https://nombre-mvp.vercel.app/`

### 4.3 Configure Google OAuth
1. Go to Google Cloud Console -> **Credentials**.
2. Edit your OAuth 2.0 Client.
3. Add your Vercel URL to **Authorized JavaScript origins**.
4. Add `https://your-project.supabase.co/auth/v1/callback` to **Authorized redirect URIs** (should already be there).

---

## 5. Maintenance & Cron Structure

For daily maintenance tasks (updating prices, calculating leaderboard), you can use a cron job service (like GitHub Actions, cron-job.org, or Render Cron Jobs) to hit your API:

- **Endpoint**: `POST /api/v1/maintenance/daily`
- **Header**: `x-cron-secret: [Your CRON_SECRET]`

---

## Troubleshooting

- **CORS Errors**: Check `CORS_ORIGINS` in Render matches your Vercel URL exactly (no trailing slash usually best, but check browser console).
- **Infinite Loading**: Check `VITE_API_URL` in Vercel. Inspect Network tab for failed requests.
- **Auth Redirects**: Ensure Supabase "Site URL" and "Redirect URLs" are correct.
