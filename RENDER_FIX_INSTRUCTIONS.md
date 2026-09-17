# How to Fix the Render Deployment

## Problem
Render is NOT reading the `render.yaml` configuration. Instead, it's auto-detecting the project and running a default build command that looks for `src/package.json`.

The deploy failure from the auto-detected configuration showed two errors:
1. **Build step**: `pip install -r backend-ease-brain/requirements.txt` — ignores Poetry-managed dependencies
2. **Start step**: `gunicorn app:app` — bare `gunicorn` not found on PATH

## Root Cause
The services were likely created manually in the Render dashboard instead of importing the infrastructure from `render.yaml`.

The project now uses **Poetry** for Python dependency management via `backend-ease-brain/pyproject.toml` (and the root `pyproject.toml`). Dependencies like `gunicorn` are declared in `pyproject.toml`, **not** in `requirements.txt`. Using `pip install -r requirements.txt` will miss Poetry-specific dependency resolution, and bare `gunicorn` is not on PATH — `python -m gunicorn` must be used instead.

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
2. Set **Environment** to `Static Site`
3. Set **Root Directory** to:
   ```
   frontend-ease-brain
   ```
4. Change **Build Command** to:
   ```
   npm install --production=false && npm run build
   ```
5. Set **Publish Directory** (or Static Publish Path) to:
   ```
   dist
   ```
6. Click "Save" and Render will auto-redeploy

### For Backend Service (Manual Fix):
1. Go to **easebrain-backend** → **Settings**
2. Set **Environment** to `Python`
3. Set **Root Directory** to:
   ```
   backend-ease-brain
   ```
4. Change **Build Command** to:
    ```
    cd backend-ease-brain && poetry install --no-root
    ```
    > **Important:** Do NOT use `pip install -r requirements.txt`. The project uses Poetry (`pyproject.toml`), and `pip install` will not correctly resolve Poetry-managed dependencies or install `gunicorn` on PATH.
5. Change **Start Command** to:
    ```
    cd backend-ease-brain && python -m gunicorn -c gunicorn_config.py app:app
    ```
    > **Important:** Do NOT use bare `gunicorn`. When installed via Poetry, `gunicorn` is in the Poetry virtualenv and not on `PATH`. Use `python -m gunicorn` instead.
6. Click "Save" and Render will auto-redeploy

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
3. For Python, the default is: `pip install -r requirements.txt`
4. This **ignores your render.yaml configuration** and the Poetry-managed `pyproject.toml`
5. The default start command uses bare `gunicorn` (not `python -m gunicorn`), which fails because Poetry installs packages in a virtualenv not on `PATH`
6. Even though `gunicorn` is listed in `backend-ease-brain/requirements.txt`, `pip install` may not install it correctly in Render's environment when Poetry is the intended package manager

The code-level fix:
- `backend-ease-brain/pyproject.toml` is the source of truth for Python dependencies (Poetry)
- `render.yaml` uses `cd backend-ease-brain && poetry install --no-root` for building and `cd backend-ease-brain && python -m gunicorn` for starting
- `.render-bashrc` provides a fallback to install via Poetry when `pyproject.toml` exists

The solution is to either:
- **Re-import from `render.yaml`** (recommended - uses Poetry install and `python -m gunicorn`)
- OR manually configure the build/start commands to match the updated `render.yaml`

## Next Steps

1. **Delete** the current failing service (or manually update its build/start commands)
2. **Import from Git** and select `render.yaml` — this will auto-detect the `pyproject.toml` and use Poetry
3. **Configure secrets** in Render dashboard
4. **Wait** for automatic deployment

This will ensure all services (database, backend, frontend) deploy together with correct configurations.
