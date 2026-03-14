# 🚀 EaseBrain Deployment & Domain Configuration Guide

## Overview

Your EaseBrain application is fully configured for the `http://www.easebrain.live/` domain. This guide walks you through the complete deployment process.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                    │
│                  http://www.easebrain.live                  │
│                                                               │
│  - Static HTML/CSS/JS served from CDN or static host        │
│  - API calls proxy to /api/* (via Vite dev server)          │
│  - Environment: VITE_BASE_URL fallback to env var           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Proxy
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Flask/Gunicorn)                   │
│             http://www.easebrain.live/api                   │
│                                                               │
│  - Flask API endpoints                                      │
│  - Authentication (JWT)                                     │
│  - Database: PostgreSQL (Render)                            │
│  - Email: SendGrid                                          │
└─────────────────────────────────────────────────────────────┘
```

## Production Domain Configuration

### Current Configuration

| Component | URL | Platform |
|-----------|-----|----------|
| Frontend | `http://www.easebrain.live` | Render/Vercel/Netlify |
| Backend API | `http://www.easebrain.live/api` | Render |
| Database | PostgreSQL | Render (Free Tier) |
| Email | SendGrid | Third-party |

### Environment Variables Configured

#### Backend (`backend-ease-brain/.env`)
```env
FRONTEND_URL=http://www.easebrain.live
VERIFY_BASE_URL=http://www.easebrain.live
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
SENDGRID_API_KEY=your-sendgrid-key
DATABASE_URL=postgresql://user:pass@host/db
```

#### Frontend (`frontend-ease-brain/.env`)
```env
VITE_BASE_URL=http://www.easebrain.live/api
VITE_API_BASE_URL=http://www.easebrain.live/api
```

## Step-by-Step Deployment

### 1️⃣ Phase One: Domain & DNS Setup

#### Option A: If you own the domain

```bash
# 1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
# 2. Navigate to DNS Settings
# 3. Add/Update these records:

Type    TTL  Name                 Value
────────────────────────────────────────────────
A       3600 www.easebrain.live   <Your-Server-IP>
CNAME   3600 easebrain.live       www.easebrain.live

# 4. Wait for DNS propagation (5-30 minutes)
# 5. Test: nslookup www.easebrain.live
```

#### Option B: If you're pointing an existing domain

```bash
# Update your domain registrar's DNS to point to your server
# Examples:
#   - Render app URL (if deploying there)
#   - CloudFlare CNAME
#   - Your VPS IP address
```

### 2️⃣ Phase Two: Backend Deployment (Render)

#### Step 1: Push code to GitHub
```bash
cd /home/eugene/easebrain

# Already done! Your code is at:
# https://github.com/vsfdhyibavds/Easebrain

git push origin main
```

#### Step 2: Connect Render to GitHub Repository

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub account and select `vsfdhyibavds/Easebrain`

#### Step 3: Configure Render Service

1. **Name**: `easebrain-backend`
2. **Root Directory**: (leave empty, because render.yaml is in root)
3. **Environment**: `Python 3`
4. **Region**: Oregon (or your preference)
5. **Plan**: Free Tier (or Starter if needed)

#### Step 4: Set Environment Variables

In Render Dashboard → Environment Variables, add:

```
SECRET_KEY=your-generated-secret-key
JWT_SECRET=your-generated-jwt-secret
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDER_EMAIL=your-email@example.com
FRONTEND_URL=http://www.easebrain.live
VERIFY_BASE_URL=http://www.easebrain.live
```

> **Important**: Use the values from `backend-ease-brain/.env` (except localhost ones)

#### Step 5: Deploy

1. Click "Create Web Service"
2. Render automatically deploys from `render.yaml`
3. Watch the build logs
4. Once deployed, you'll get a URL like: `https://easebrain-backend.onrender.com`

#### Step 6: Configure Custom Domain

While your app is deploying:

1. Go to Settings → Custom Domain
2. Enter: `www.easebrain.live`
3. Follow instructions to update DNS (if not already done)
4. Enable SSL (automatic with Let's Encrypt)

### 3️⃣ Phase Three: Frontend Deployment

#### Option A: Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. From project root
vercel

# 3. Configure:
#    - Select frontend-ease-brain folder
#    - Set VITE_BASE_URL environment variable
#    - Point custom domain to www.easebrain.live
```

#### Option B: Deploy to Netlify

```bash
# 1. Build frontend
cd frontend-ease-brain
npm run build

# 2. Go to netlify.com
# 3. Drag & drop the 'dist' folder, or connect GitHub
# 4. Configure environment variables
# 5. Deploy
```

#### Option C: Serve from Render (All-in-one)

```bash
# Update render.yaml to serve static frontend alongside API
# See advanced configuration below
```

### 4️⃣ Phase Four: Testing

#### Test Backend
```bash
# Test API is accessible
curl http://www.easebrain.live/api/health

# Expected response:
# {"status": "ok"}
```

#### Test Frontend
```bash
# Open browser
http://www.easebrain.live

# Expected: EaseBrain login page appears
```

#### Test Authentication Flow
```bash
# 1. Sign up for new account
# 2. Verify email (check verification link format in email)
# 3. Should see correct domain: http://www.easebrain.live/api/verify/{token}
# 4. Login with credentials
# 5. Access dashboard/features
```

#### Test CORS
```bash
# From browser console:
fetch('http://www.easebrain.live/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: 'test'})
})
.then(r => r.json())
.then(d => console.log(d))
```

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup www.easebrain.live

# Use a DNS checker online:
# https://toolbox.googleapps.com/apps/checkmx/

# Wait up to 48 hours for global propagation
```

### CORS Errors
- **Error**: `Access to XMLHttpRequest blocked by CORS policy`
- **Solution**:
  1. Check `backend-ease-brain/app.py` CORS configuration
  2. Ensure frontend URL is in `cors_origins` list
  3. Restart backend service

### Verification Email Not Working
- **Error**: Verification link broken or pointing to wrong URL
- **Solution**:
  1. Check `VERIFY_BASE_URL` env var
  2. Check email template in `backend-ease-brain/resources/`
  3. Verify format: `http://www.easebrain.live/api/verify/{token}`

### API Endpoint 404
- **Error**: `GET /api/users 404 Not Found`
- **Solution**:
  1. Check render.yaml `startCommand` path
  2. Verify routes are in correct paths
  3. Check backend logs: `render.com → Logs`

### Frontend Not Loading
- **Error**: Blank page or 404
- **Solution**:
  1. Check build completed successfully
  2. Verify custom domain DNS
  3. Clear browser cache: `Shift + Refresh`
  4. Check browser console for errors

## Advanced Configurations

### SSL/TLS Certificate

```bash
# Render provides automatic SSL via Let's Encrypt
# No additional setup needed!

# If using custom infrastructure:
# 1. Use Certbot with Let's Encrypt
# 2. Install: sudo apt install certbot python3-certbot-nginx
# 3. Renew: certbot renew --dry-run
```

### Custom Email Domain

```bash
# Update SENDER_EMAIL in environment:
# Instead of: jude98892@gmail.com
# Use: noreply@easebrain.live

# Configure:
# 1. SendGrid → Settings → Sender Authentication
# 2. Add domain: easebrain.live
# 3. Update DNS with provided records
# 4. Update SENDER_EMAIL in Render dashboard
```

### Database Backups

```bash
# Render PostgreSQL includes automatic backups
# View in Dashboard → Database → Backups

# Manual backup:
pg_dump $DATABASE_URL > backup.sql

# Restore:
psql $DATABASE_URL < backup.sql
```

### Monitoring

```bash
# Check logs
curl https://api.render.com/v1/services/{service-id}/logs

# Monitor health
curl http://www.easebrain.live/api/health

# Set up alerts in Render dashboard
```

## Rollback Plan

If something goes wrong:

```bash
# 1. Local rollback
git revert <commit-hash>
git push origin main

# 2. Render auto-redeploys from latest push
# 3. Check logs at render.com
# 4. If needed, rebuild specific commit:
#    git push origin <commit-hash>:main --force
```

## Maintenance

### Update Dependencies
```bash
# Backend
cd backend-ease-brain
pip list --outdated
pip install -U package-name

# Frontend
cd frontend-ease-brain
npm update
```

### Database Migrations
```bash
# Handled automatically by render.yaml buildCommand
# But manual migration:
cd backend-ease-brain
source venv/bin/activate
flask db upgrade
```

### Security Updates
```bash
# Check for vulnerabilities
pip audit
npm audit

# Update packages
pip install --upgrade pip
npm audit fix
```

## Support Resources

- **Render Docs**: https://render.com/docs
- **Flask Deployment**: https://flask.palletsprojects.com/deployment/
- **Vite Build**: https://vitejs.dev/guide/build.html
- **SendGrid Integration**: https://sendgrid.com/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/

## Configuration Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `render.yaml` | Render deployment config | ✅ Configured |
| `backend-ease-brain/.env` | Backend secrets | ✅ Configured |
| `backend-ease-brain/app.py` | Flask CORS & config | ✅ Configured |
| `frontend-ease-brain/.env` | Frontend env vars | ✅ Configured |
| `frontend-ease-brain/vite.config.js` | Build & dev config | ✅ Configured |
| `DOMAIN_SETUP.md` | Domain documentation | ✅ Created |
| `configure-domain.sh` | Config verification script | ✅ Created |

---

**Next Steps:**
1. ✅ Code pushed to GitHub
2. ⏳ Connect Render to GitHub repo
3. ⏳ Configure domain DNS
4. ⏳ Set environment variables
5. ⏳ Deploy and test

**Questions?** Check the troubleshooting section or review `DOMAIN_SETUP.md`
