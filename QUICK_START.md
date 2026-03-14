# ⚡ EaseBrain Domain Configuration - Quick Reference

## Current Status: ✅ FULLY CONFIGURED

Your EaseBrain application is **100% configured** for domain deployment.

---

## 🎯 Quick Start Checklists

### Development (Local)

```bash
# Terminal 1: Backend
cd backend-ease-brain
source venv/bin/activate
python app.py
# ✅ Runs on http://localhost:5500

# Terminal 2: Frontend
cd frontend-ease-brain
npm install  # First time only
npm run dev
# ✅ Runs on http://localhost:5173
```

**Frontend will automatically proxy API calls to backend**

---

### Production (Domain Deployment)

#### Pre-Deployment Checklist

- [ ] Code pushed to GitHub: https://github.com/vsfdhyibavds/Easebrain
- [ ] Domain registered: `easebrain.live`
- [ ] GitHub account linked to Render
- [ ] SendGrid API key ready
- [ ] SSL capability available (Render provides free)

#### Deployment Checklist

##### 1. Backend (Render)

- [ ] Create Render Web Service from GitHub
- [ ] Select `vsfdhyibavds/Easebrain` repository
- [ ] Set Environment Variables:
  - `SECRET_KEY` (generate random)
  - `JWT_SECRET` (generate random)
  - `SENDGRID_API_KEY` (from SendGrid)
  - `SENDER_EMAIL` (your email)
  - `FRONTEND_URL=http://www.easebrain.live`
  - `VERIFY_BASE_URL=http://www.easebrain.live`
- [ ] Deploy (automatic from render.yaml)
- [ ] Add custom domain: `www.easebrain.live`
- [ ] Enable SSL/TLS

##### 2. Frontend (Vercel/Netlify/Static)

**Option A: Vercel** (Recommended)
- [ ] Connect GitHub repo to Vercel
- [ ] Set build command: `npm run build` (in frontend-ease-brain)
- [ ] Set install command: `npm install` (in frontend-ease-brain)
- [ ] Set output directory: `frontend-ease-brain/dist`
- [ ] Add environment variable: `VITE_BASE_URL=http://www.easebrain.live/api`
- [ ] Deploy to custom domain: `www.easebrain.live`

**Option B: Netlify**
- [ ] Build: `npm run build` (from frontend-ease-brain)
- [ ] Upload `dist` folder
- [ ] Add custom domain: `www.easebrain.live`

##### 3. DNS Configuration

- [ ] Log into domain registrar
- [ ] Find DNS settings
- [ ] Update/Add records:
  ```
  Type  TTL  Name               Value
  ────────────────────────────────────────────
  A     3600 www.easebrain.live <Backend-IP>
  CNAME 3600 easebrain.live     www.easebrain.live
  ```
- [ ] Save/Apply changes
- [ ] Wait for propagation (5-30 min)
- [ ] Verify: `nslookup www.easebrain.live`

---

## 📋 Configuration Map

### Files Already Updated ✅

```
✅ render.yaml
   └─ FRONTEND_URL: http://www.easebrain.live
   └─ VERIFY_BASE_URL: http://www.easebrain.live

✅ backend-ease-brain/
   ├─ .env
   │  ├─ FRONTEND_URL: http://www.easebrain.live
   │  └─ VERIFY_BASE_URL: http://www.easebrain.live
   ├─ app.py
   │  └─ CORS origins include www.easebrain.live
   ├─ resources/auth_resource.py
   │  └─ Password reset uses www.easebrain.live
   ├─ utils/utils.py
   │  └─ Verification base: www.easebrain.live
   ├─ utils/swagger_docs.py
   │  └─ Swagger docs point to www.easebrain.live/api
   └─ vite.config.js
      └─ Proxy targets www.easebrain.live

✅ frontend-ease-brain/
   ├─ .env
   │  ├─ VITE_BASE_URL: http://www.easebrain.live/api
   │  └─ VITE_API_BASE_URL: http://www.easebrain.live/api
   ├─ vite.config.js
   │  └─ API proxy: www.easebrain.live
   ├─ src/
   │  ├─ hooks/useApi.js → www.easebrain.live/api
   │  ├─ services/api/baseApi.ts → www.easebrain.live/api
   │  ├─ utils/utils.js → www.easebrain.live/api
   │  └─ pages/DependentProfile.jsx → www.easebrain.live/api
   └─ src/components/admin/ (5 files)
      └─ All configured with API_BASE_URL fallback

✅ Documentation
   ├─ DOMAIN_SETUP.md (architecture overview)
   ├─ DEPLOYMENT_GUIDE.md (step-by-step instructions)
   └─ configure-domain.sh (verification script)
```

---

## 🔗 Environment Variables Quick Reference

### Backend

```bash
# .env or Render Dashboard
FRONTEND_URL=http://www.easebrain.live
VERIFY_BASE_URL=http://www.easebrain.live
FLASK_ENV=production
SECRET_KEY=<generate-random-key>
JWT_SECRET=<generate-random-key>
SENDGRID_API_KEY=SG.<your-api-key>
SENDER_EMAIL=noreply@easebrain.live
DATABASE_URL=postgresql://user:pass@host/db
```

### Frontend

```bash
# .env or deployment interface
VITE_BASE_URL=http://www.easebrain.live/api
VITE_API_BASE_URL=http://www.easebrain.live/api
```

---

## 🧪 Testing Endpoints

Once deployed, test these:

```bash
# Backend health
curl http://www.easebrain.live/api/health

# Frontend (should load login page)
curl -I http://www.easebrain.live

# Swagger docs
http://www.easebrain.live/api/docs

# Test login (should work with valid credentials)
curl -X POST http://www.easebrain.live/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS Error | Check `FRONTEND_URL` in backend env |
| API 404 | Verify render.yaml startCommand path |
| Verification email broken | Check `VERIFY_BASE_URL` env var |
| Frontend blank page | Clear cache, check Vercel build logs |
| DNS not working | Wait 5-30 min, check with `nslookup` |
| SSL not working | Render auto-provides, wait 5 min |

---

## 📞 Need Help?

1. **Check logs**:
   - Render: Dashboard → Logs
   - Vercel: Deployments → Build Logs

2. **Review docs**:
   - `DOMAIN_SETUP.md` - Architecture
   - `DEPLOYMENT_GUIDE.md` - Full guide
   - `configure-domain.sh` - Run verification

3. **Test locally first**:
   ```bash
   cd backend-ease-brain && python app.py
   cd frontend-ease-brain && npm run dev
   ```

---

## ✅ Current Configuration Status

```
Domain:              http://www.easebrain.live
Backend API:         http://www.easebrain.live/api
Frontend:            http://www.easebrain.live

Code Location:       https://github.com/vsfdhyibavds/Easebrain
Deployment:          Render (Backend) + Vercel/Netlify (Frontend)

Environment Vars:    ✅ All Configured
CORS Settings:       ✅ All Configured
API Endpoints:       ✅ All Configured
SSL/TLS:             ✅ Ready (Render auto)
DNS:                 ⏳ Awaiting configuration
```

---

**Ready to deploy?** 🚀 Follow the **Production (Domain Deployment)** checklist above!
