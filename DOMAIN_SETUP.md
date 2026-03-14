# EaseBrain Domain Configuration Guide

## Current Domain Setup: `http://www.easebrain.live`

### Architecture Overview

```
User Browser
     ↓
www.easebrain.live
     ↓
   ┌─────────────────────────────────────┐
   │   Frontend (React/Vite)             │
   │   - Static assets served via CDN    │
   │   - API calls proxy to /api         │
   └──────────────┬──────────────────────┘
                  │
                  ↓
   ┌─────────────────────────────────────┐
   │   Backend (Flask/Gunicorn)          │
   │   - API endpoints at /api/*         │
   │   - Database: PostgreSQL (Render)   │
   └─────────────────────────────────────┘
```

### Deployment Platforms

#### Backend

- **Platform**: Render.com
- **Service**: Flask + Gunicorn
- **URL**: `http://www.easebrain.live/api`
- **Config File**: `render.yaml`

#### Frontend

- **Platform**: Render/Vercel/Your choice
- **Build**: `npm run build` (Vite)
- **Output**: `frontend-ease-brain/dist/`

### Environment Variables Required

#### Backend (`backend-ease-brain/.env` or Render Dashboard)

```
FRONTEND_URL=http://www.easebrain.live
VERIFY_BASE_URL=http://www.easebrain.live
FLASK_ENV=production
SECRET_KEY=<your-secret-key>
JWT_SECRET=<your-jwt-secret>
SENDGRID_API_KEY=<your-sendgrid-key>
DATABASE_URL=postgresql://user:pass@host/db
```

#### Frontend (`frontend-ease-brain/.env` or build-time)

```
VITE_BASE_URL=http://www.easebrain.live/api
VITE_API_BASE_URL=http://www.easebrain.live/api
```

### DNS Configuration Steps

1. **Register Domain** (or point existing domain)
   - Domain: `easebrain.live`
   - Registrar: GoDaddy, Namecheap, etc.

2. **Point DNS Records**

   ```
   Type    Name              Value
   ─────────────────────────────────────
   A       www.easebrain.live    <Your-Server-IP>
   CNAME   easebrain.live        www.easebrain.live
   ```

3. **SSL/TLS Certificate**
   - Use Let's Encrypt (free)
   - Or configure through hosting provider (Render auto-provides)

### Setup Checklist

- [ ] Domain registered and DNS records configured
- [ ] Backend environment variables set in Render dashboard
- [ ] Frontend environment variables configured at build time
- [ ] CORS origins updated in `backend-ease-brain/app.py` (✅ Already done)
- [ ] Verification email base URL set to domain (✅ Already done)
- [ ] Frontend build and deploy to production
- [ ] Test domain at `http://www.easebrain.live`

### Testing

```bash
# Test backend connectivity
curl http://www.easebrain.live/api/health

# Test frontend
curl -I http://www.easebrain.live

# Test email verification link format
# Should be: http://www.easebrain.live/api/verify/{token}
```

### Troubleshooting

| Issue                        | Solution                                            |
| ---------------------------- | --------------------------------------------------- |
| CORS errors                  | Check `CORS_origins` in `backend-ease-brain/app.py` |
| API not responding           | Verify `VERIFY_BASE_URL` environment variable       |
| Verification emails broken   | Check email template uses correct domain            |
| Frontend can't reach backend | Ensure proxy config points to correct URL           |

### Files Already Configured ✅

- ✅ `render.yaml` - Backend deploy config
- ✅ `backend-ease-brain/app.py` - CORS configuration
- ✅ `backend-ease-brain/.env` - Domain env vars
- ✅ `frontend-ease-brain/.env` - API URL
- ✅ `frontend-ease-brain/vite.config.js` - API proxy
- ✅ `generate_verification_token.py` - Verification link format
