# How to Fix the Render Deployment

## Problem
Render is NOT reading the `render.yaml` configuration. Instead, it's auto-detecting the project and running a default build command that looks for `src/package.json`.

## Root Cause
The services were likely created manually in the Render dashboard instead of importing the infrastructure from `render.yaml`.

## Solution - Correct Way to Deploy

### Step 1: Delete Current Services (Optional but Recommended)
1. Go to Render Dashboard
2. Delete the current services that are failing (both frontend and database if created manually)
3. Keep the database data or export it first

### Step 2: Import Infrastructure from render.yaml

1. **In Render Dashboard**, go to your account's main page
2. Click **"New +"** → **"Infrastructure"**
3. Select **"Import from Git"**
4. Choose your GitHub repository (vsfdhyibavds/Easebrain)
5. Render will automatically detect `render.yaml` at the root
6. Click **"Preview"** to see what will be created:
   - PostgreSQL Database (easebrain-db)
   - Python Backend (easebrain-backend)
   - Node Frontend (easebrain-frontend)
7. Click **"Create"** to deploy all services together

### Step 3: Configure Secrets
1. Go to **easebrain-backend** → **Settings** → **Environment**
2. Add these **Secret** environment variables:
   - `SECRET_KEY=<value from your .env>`
   - `JWT_SECRET_KEY=<value from your .env>`
   - `SENDGRID_API_KEY=<value from your .env>`
   - `SENDER_EMAIL=<value from your .env>`

### Step 4: Wait for Deployment
- Backend: 5-10 minutes
- Frontend: 5-10 minutes
- Database: Auto-initialized by migrations

## Alternative: Fix Current Service

If you don't want to delete and re-create, you can manually fix the environment:

### For Frontend Service (Manual Fix):
1. Go to **easebrain-frontend** → **Settings**
2. Change **Build Command** to:
   ```
   cd frontend-ease-brain && npm install && npm run build
   ```
3. Change **Start Command** to:
   ```
   npx serve -s dist -l 3000
   ```
4. Ensure **Root Directory** is empty (use default "/")
5. Click "Save" and Render will auto-redeploy

### For Backend Service (Manual Fix):
1. Go to **easebrain-backend** → **Settings**
2. Change **Build Command** to:
   ```
   cd backend-ease-brain && pip install -r requirements.txt && flask db upgrade
   ```
3. Change **Start Command** to:
   ```
   cd backend-ease-brain && gunicorn -c gunicorn_config.py app:app
   ```
4. Ensure **Root Directory** is empty (use default "/")
5. Click "Save" and Render will auto-redeploy

## Verification

After deployment:
```bash
# Test backend health
curl https://easebrain-backend.onrender.com/api/health

# Should return:
# {"status": "ok"}
```

## Why This Happened

Render's behavior:
1. When you manually create a service, it auto-detects the runtime (Node, Python, etc.)
2. It then runs a **default build command** for that runtime
3. For Node, the default is: `npm install; npm run build`
4. This **ignores your render.yaml configuration**

The solution is to either:
- Import from `render.yaml` (recommended - automatic)
- OR manually configure the build/start commands to match render.yaml

## Next Steps

1. **Delete** the current failing service
2. **Import from Git** and select `render.yaml`
3. **Configure secrets** in Render dashboard
4. **Wait** for automatic deployment

This will ensure all services (database, backend, frontend) deploy together with correct configurations.
