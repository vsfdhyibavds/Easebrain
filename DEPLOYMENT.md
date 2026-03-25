# EaseBrain Deployment Guide

## Overview

This guide walks you through deploying EaseBrain on Render.com. The application consists of:
- **Backend**: Python Flask API with PostgreSQL database
- **Frontend**: React application with Vite

## Prerequisites

1. **Render.com Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **SendGrid Account**: For email functionality (optional but recommended)
4. **Environment Variables**: Securely generate and store configuration values

## Quick Start - Deploy on Render

### Step 1: Connect Your GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Link GitHub account"
3. Authorize Render to access your repositories
4. Select the `easebrain` repository

### Step 2: Create Services from render.yaml

1. Click "Infrastructure" in the left sidebar
2. Click "Import from Git"
3. Choose the repository containing render.yaml
4. Click "Preview" to see what will be created
5. Click "Create" to deploy

Render will automatically create:
- PostgreSQL database
- Backend API service
- Frontend static service

### Step 3: Configure Environment Variables

#### Backend Service Secrets

Go to the **easebrain-backend** service settings and add these environment variables:

**Required Secrets** (under "Secret files" or "Environment"):
- `SECRET_KEY` - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `JWT_SECRET_KEY` - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `SENDGRID_API_KEY` - From [SendGrid dashboard](https://app.sendgrid.com/settings/api_keys)
- `SENDER_EMAIL` - Email verified in SendGrid (e.g., noreply@yourdomain.com)

Example values to generate:
```bash
# Run these locally in the backend directory
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

**Optional Environment Variables**:
- `OPENAI_API_KEY` - If using LLM for danger detection
- `FLASK_ENV` - Should be "production"
- `FLASK_DEBUG` - Should be "0"
- `WEB_CONCURRENCY` - Number of Gunicorn workers (default: 2)

#### Frontend Service Configuration

The frontend service automatically gets:
- `VITE_BASE_URL=https://easebrain-backend.onrender.com/api` (set during build)
- `NODE_ENV=production`

### Step 4: Verify Database Connection

1. Go to **easebrain-backend** → "Environment"
2. Verify `DATABASE_URL` is set (Render auto-populates this)
3. Database should be created automatically from migrations

### Step 5: Test the Deployment

1. Visit your frontend URL: `https://easebrain-frontend.onrender.com`
2. Check the backend health: `https://easebrain-backend.onrender.com/api/health`
3. Check detailed health: `https://easebrain-backend.onrender.com/api/health/detailed`

## Post-Deployment Configuration

### 1. Update SendGrid

If you haven't already:
1. Go to [SendGrid](https://sendgrid.com)
2. Create a free account
3. Verify your sender domain or single sender email
4. Generate an API key under Settings → API Keys
5. Add the API key to Render environment as `SENDGRID_API_KEY`

### 2. Configure Email Verification

Email verification links should point to your frontend:
- Render will use the `FRONTEND_URL` from render.yaml
- Links will be: `https://www.easebrain.live/verify?token=...`

### 3. Enable CORS

The backend CORS is configured for:
- Local development: `http://localhost:*`
- Production: `https://www.easebrain.live` and `FRONTEND_URL` env var

If you're using a different domain, update the backend's `cors_origins` in `app.py`.

### 4. Database Migrations

Migrations run automatically during deployment:
```yaml
buildCommand: FLASK_ENV=production python -m flask db upgrade
```

To manually run migrations:
```bash
cd backend-ease-brain
flask db upgrade
```

## Troubleshooting

### Database Connection Issues

**Error: `could not connect to server`**
- Verify `DATABASE_URL` is set correctly in environment
- Check that PostgreSQL service is running
- Wait a few seconds for the database to start

**Error: `relation "user" does not exist`**
- Migrations haven't run yet
- Check build logs for migration errors
- Manually trigger a rebuild from Render dashboard

### Build Failures

**Error: `npm not found` or `pip not found`**
- Check you're on the correct runtime (Node for frontend, Python for backend)
- Verify package.json or requirements.txt exists

**Error: `VITE_BASE_URL not set`**
- The frontend build command sets this automatically
- If building locally, set it before running `npm run build`

### Email Not Sending

**Error: `Unauthorized (401)`**
- Verify `SENDGRID_API_KEY` is correct in Render
- API key may have expired or been revoked
- Check SendGrid API keys haven't hit rate limits

**Error: `invalid sender email`**
- Sender email isn't verified in SendGrid
- Log in to SendGrid and verify the email domain or single sender

### CORS Errors in Frontend

**Error: `Access to XMLHttpRequest blocked by CORS`**
- Backend CORS settings don't allow the frontend domain
- Update `cors_origins` in `backend-ease-brain/app.py`
- Restart the backend service

## Monitoring & Maintenance

### View Logs

1. Go to service details in Render dashboard
2. Click "Logs" tab
3. Filter by service (backend/frontend)

### Restart Services

1. Go to service details
2. Click "Actions" → "Restart instance"

### Scale Backend

1. Go to **easebrain-backend** settings
2. Increase "Plan" to Standard or Pro for more resources
3. Increase `WEB_CONCURRENCY` for more worker processes

### Monitor Health

Backend exposes health endpoints:
- `/api/health` - Simple health check
- `/api/health/detailed` - Detailed system status

Frontend serves static files with long cache headers:
- HTML: No cache (max-age=0)
- Assets: 1-year cache with immutable flag

## Updating the Application

### Push Code Changes

```bash
git add .
git commit -m "Update for deployment"
git push origin main  # or your branch
```

### Automatic Redeploy

Render automatically redeploys when you push to the connected branch.

### Manual Redeploy

1. Go to service details
2. Click "Actions" → "Clear build cache and redeploy"

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `FLASK_ENV` | Yes | `production` | Set Flask environment |
| `SECRET_KEY` | Yes | `<32-char string>` | Session encryption key |
| `JWT_SECRET_KEY` | Yes | `<32-char string>` | JWT token signing key |
| `DATABASE_URL` | Yes | Auto-set by Render | PostgreSQL connection string |
| `SENDGRID_API_KEY` | No | `SG.xxx` | Email service API key |
| `SENDER_EMAIL` | No | `noreply@easebrain.live` | Verified sender email |
| `FRONTEND_URL` | Yes | `https://www.easebrain.live` | Frontend domain for redirects |
| `VERIFY_BASE_URL` | Yes | `https://www.easebrain.live/verify` | Email verification URL |
| `WEB_CONCURRENCY` | No | `2` | Gunicorn worker count |

### Frontend (.env)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_BASE_URL` | Yes | `https://api.easebrain.live/api` | Backend API URL |
| `NODE_ENV` | Yes | `production` | Node environment |

## Database Schema

Migrations are applied automatically. Current schema includes:
- Users, Roles, User Roles
- Conversations, Messages
- Communities, User Communities
- Caregiver Connections, Notes
- Reminders, Safety Plans
- Settings, Reactions

See `backend-ease-brain/migrations/versions/` for migration details.

## Security Best Practices

1. **Store Secrets Safely**
   - Never commit `.env` files
   - Use Render's environment variable dashboard
   - Rotate API keys regularly

2. **Production Secrets**
   - Different SECRET_KEY and JWT_SECRET_KEY for each environment
   - Store SendGrid API key securely
   - Enable HTTPS (automatic on Render)

3. **CORS & Origins**
   - Only allow trusted frontend domains
   - Update for custom domains
   - Remove development localhost origin in production

4. **Database Backups**
   - Enable PostgreSQL backups in Render (paid plans)
   - Backup frequency: Daily recommended for production
   - Test restore procedures regularly

## Advanced Configuration

### Custom Domain

1. In Render dashboard, go to service settings
2. Click "Custom domains"
3. Add your domain (e.g., api.easebrain.live)
4. Update DNS records per Render's instructions
5. Update `FRONTEND_URL` and CORS accordingly

### SSL Certificate

Render provides automatic free SSL/TLS via Let's Encrypt.
- Automatic renewal
- No manual configuration needed

### Rate Limiting

Backend includes rate limiting (configurable in `app.py`):
- Default: 60 requests per minute per IP
- Adjust `RATE_LIMIT_PER_MINUTE` environment variable

## Getting Help

- **Render Support**: help@render.com
- **EaseBrain Issues**: Check GitHub repository issues
- **SendGrid Docs**: sendgrid.com/docs
- **Flask Docs**: flask.palletsprojects.com

---

**Last Updated**: March 2026
**Tested On**: Render Free Tier
**Python**: 3.12
**Node**: 18.x
