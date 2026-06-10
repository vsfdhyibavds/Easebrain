# Unified Frontend + Backend Deployment Guide

This document explains how EaseBrain's frontend and backend are unified into a single deployment.

## Architecture

```
User Browser
    ↓
https://easebrain.render.com (Single URL)
    ↓
Flask Backend (port 8000)
    ├── /api/* → API endpoints
    ├── /       → Serves index.html (React app)
    └── /assets → CSS, JS, images from React build
```

## How It Works

### 1. Frontend Build
```bash
npm run build  # Creates frontend-ease-brain/dist/
```

Output:
- `index.html` - Main React app
- `assets/` - Bundled JS, CSS
- Other static files

### 2. Copy to Backend
```bash
cp -r frontend-ease-brain/dist/* backend-ease-brain/public/
```

### 3. Backend Serves Both
The Flask app (`backend-ease-brain/app.py`) has a catch-all route:

```python
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve React frontend for all non-API routes"""
    if path.startswith("api/"):
        return handle_api(...)  # Handle API

    # Serve frontend file
    if os.path.isfile(frontend_path):
        return send_from_directory(frontend_path, path)

    # For SPA routing, serve index.html
    return send_from_directory(frontend_path, "index.html")
```

**Result:**
- `GET /` → returns React app
- `GET /app/dashboard` → returns React app (client-side routing)
- `GET /api/users` → returns API response
- `GET /assets/bundle.js` → returns JavaScript file

## Local Development

### Option 1: Unified Build (Recommended for testing production behavior)

```bash
# From project root
./build.sh

# Then start backend
cd backend-ease-brain
python app.py
```

Access at: `http://localhost:5000`

### Option 2: Separate Dev Servers (Faster iteration)

**Terminal 1 - Backend:**
```bash
cd backend-ease-brain
python app.py  # Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-ease-brain
npm run dev  # Runs on http://localhost:5173
```

Frontend dev server automatically proxies API calls to backend via `vite.config.js`.

## Deployment to Render

### Prerequisites

1. **Generate Secret Keys:**
```bash
python -c "import secrets; print('SECRET_KEY:', secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY:', secrets.token_hex(32))"
```

2. **Environment Variables to Set in Render Dashboard:**
   - `SECRET_KEY` - Generated above
   - `JWT_SECRET_KEY` - Generated above
   - `SENDGRID_API_KEY` - Your SendGrid API key
   - `SENDER_EMAIL` - Verified sender email
   - `DATABASE_URL` - PostgreSQL connection string (auto-set if using Render DB)

### Deploy Steps

1. **Connect Repository:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configuration:**
   - Service name: `easebrain`
   - Root directory: (leave empty - uses `render.yaml`)
   - Runtime: Python
   - Build command: (auto-read from `render.yaml`)
   - Start command: (auto-read from `render.yaml`)

3. **Environment Variables:**
   - Add secrets from Prerequisites above
   - `FRONTEND_URL`: Your Render URL (e.g., `https://easebrain-xxxxx.onrender.com`)

4. **Database:**
   - Create PostgreSQL database in Render
   - Render auto-sets `DATABASE_URL`

5. **Deploy:**
   - Click "Deploy"
   - Watch build logs
   - Build should take 5-10 minutes

### Deployment Flow

```
1. Render pulls code
   ↓
2. Build phase:
   - npm install & npm run build (frontend)
   - pip install (backend)
   - Copy dist → backend/public
   ↓
3. Pre-deploy phase:
   - flask db upgrade (migrations)
   - python seed_roles.py (seed data)
   ↓
4. Start phase:
   - gunicorn app:app (Flask server)
   ↓
5. Health check: GET /api/health
   - If healthy → goes live
   - If fails → keeps previous version
```

### Accessing Your App

After deployment succeeds:
- **Frontend:** https://easebrain-xxxxx.onrender.com
- **API:** https://easebrain-xxxxx.onrender.com/api
- **Docs:** https://easebrain-xxxxx.onrender.com/api/docs

## File Structure After Build

```
backend-ease-brain/
├── public/                 # Frontend build output (created after build.sh)
│   ├── index.html         # React app entry point
│   ├── assets/            # Bundled JS, CSS
│   └── ...                # Other static files
├── app.py                 # Flask app with frontend serving route
├── requirements.txt       # Python dependencies
├── startup.sh             # Startup script
└── ...                    # Other backend files

frontend-ease-brain/
├── dist/                  # Built frontend (created after npm run build)
│   └── (same as backend/public)
├── src/                   # React source
├── package.json           # NPM dependencies
└── vite.config.js         # Vite configuration
```

## Troubleshooting

### Frontend Not Loading

**Problem:** Getting 404 or blank page
```
Check:
1. Frontend build exists: ls backend-ease-brain/public/index.html
2. Rebuild: ./build.sh
3. Check backend logs for errors
4. Verify VITE_BASE_URL in frontend env
```

**Local:** `http://localhost:5000`
**Production:** `https://easebrain-xxxxx.onrender.com`

### API Endpoints Not Working

**Problem:** `/api/*` returns 404
```
Check:
1. Backend is running: curl http://localhost:5000/api/health
2. Check Flask API routes are registered
3. Review backend logs
4. Verify DATABASE_URL is set
```

### Build Fails on Render

**Problem:** Build step shows errors
```
Check Render logs for:
- npm: "Could not find package.json"
  → Verify frontend-ease-brain/ path
- pip: "Could not find requirements.txt"
  → Verify backend-ease-brain/ path
- Database: "Connection refused"
  → Verify DATABASE_URL is set
```

### Performance Issues

**Optimize:**
1. **Frontend Caching:**
   - Assets are versioned in build (hash in filename)
   - Set long cache headers in Flask

2. **Backend Scaling:**
   - Increase `WEB_CONCURRENCY` in `render.yaml`
   - Use Render's "Standard" plan for better performance

3. **Database:**
   - Add indexes to frequently queried columns
   - Consider connection pooling

## Updating Code

### Update Frontend Only

```bash
# Development
cd frontend-ease-brain
npm run build
cd ../backend-ease-brain
cp -r ../frontend-ease-brain/dist/* public/

# Then restart backend manually or redeploy on Render
```

### Update Backend Only

```bash
# Just deploy - Render will rebuild and deploy
git push origin main
```

### Update Both

```bash
# Local testing
./build.sh
cd backend-ease-brain
python app.py

# Then deploy
git push origin main
```

## Performance Monitoring

Monitor on Render Dashboard:
- **CPU Usage:** Should be < 80% average
- **Memory:** Should be < 512MB
- **Build Time:** Should be 5-10 minutes
- **Deploy Time:** Should be < 2 minutes

## Cost Optimization

**Current Setup (Single Service):**
- ✅ Single Render web service (cheaper)
- ✅ Single database
- ✅ No inter-service communication
- ✅ Better for $7-12/month tier

**Alternative (Two Services):**
- Separate frontend + backend services
- More expensive but independent scaling
- Recommended only if frontend gets high traffic spike

## Next Steps

1. ✅ Set up `render.yaml` with unified build
2. ✅ Create `build.sh` script for local testing
3. ✅ Deploy to Render
4. ✅ Monitor performance
5. ⏳ Set up error tracking (Sentry)
6. ⏳ Configure CDN for static assets
7. ⏳ Set up log aggregation (DataDog, Papertrail)

## Security Checklist

- [ ] SECRET_KEY is unique and 32+ characters
- [ ] JWT_SECRET_KEY is unique and 32+ characters
- [ ] CORS_ORIGINS includes only your domain
- [ ] SendGrid API key has minimal permissions
- [ ] Database password is strong
- [ ] HTTPS is enforced (Render does this by default)
- [ ] Security headers are set (Flask middleware)
- [ ] CSRF protection is enabled

## References

- [Render Documentation](https://render.com/docs)
- [Flask Static Files](https://flask.palletsprojects.com/staticfiles/)
- [React SPA Routing](https://reactrouter.com/)
- [Gunicorn Configuration](https://docs.gunicorn.org/)
