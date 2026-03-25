# Render Deployment Checklist

## Pre-Deployment Steps

Before pushing to Render, complete these tasks:

### 1. Local Testing
- [ ] Run `bash setup-dev.sh` to set up local environment
- [ ] Update `.env` files with test values
- [ ] Run `flask db upgrade` to test migrations locally
- [ ] Test backend: `python app.py` should start without errors
- [ ] Test frontend: `npm run dev` should start the dev server
- [ ] Test API calls from frontend to backend

### 2. Environment Variables - Generate Secure Values

**In your terminal, run these commands:**

```bash
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

**Save these values for Render dashboard**

### 3. SendGrid Setup
- [ ] Create SendGrid account (free tier available)
- [ ] Verify a sender email or domain
- [ ] Generate API key from Settings → API Keys
- [ ] Copy API key (you won't see it again!)
- [ ] Verify sender email in SendGrid dashboard

### 4. Database
- [ ] Ensure all migrations are in `backend-ease-brain/migrations/versions/`
- [ ] Test migrations locally: `flask db upgrade`
- [ ] No uncommitted changes to migration files

### 5. Code Cleanup
- [ ] Remove debug print statements
- [ ] Remove test/development files not needed in production
- [ ] Ensure `.gitignore` includes `.env` (not tracked)
- [ ] Commit all changes to git

### 6. Documentation
- [ ] Update README with deployment instructions
- [ ] Document any custom environment variables
- [ ] List any external dependencies (SendGrid, etc.)

## Render.com Deployment Steps

### Step 1: Create Render Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub account
- [ ] Authorize Render to access repositories

### Step 2: Deploy Infrastructure
- [ ] In Render Dashboard, click "Infrastructure"
- [ ] Click "Import from Git"
- [ ] Select your repository
- [ ] Click "Preview" to review services
- [ ] Review:
  - [ ] PostgreSQL database settings
  - [ ] Backend service configuration
  - [ ] Frontend service configuration
- [ ] Click "Create"

### Step 3: Configure Secrets (Backend Service)

Go to **easebrain-backend** → Settings → Environment

Add these as **Secret** environment variables (not regular vars):

Required Secrets:
- [ ] `SECRET_KEY` = (generated value from step 2)
- [ ] `JWT_SECRET_KEY` = (generated value from step 2)
- [ ] `SENDGRID_API_KEY` = (from SendGrid)
- [ ] `SENDER_EMAIL` = (verified email in SendGrid)

Optional Secrets:
- [ ] `OPENAI_API_KEY` = (if using LLM features)

### Step 4: Verify Environment Variables

Double-check these are set (Render May auto-set):
- [ ] `FLASK_ENV` = `production`
- [ ] `FLASK_DEBUG` = `0`
- [ ] `PYTHON_VERSION` = `3.12`
- [ ] `DATABASE_URL` = (auto-populated by Render)
- [ ] `FRONTEND_URL` = `https://www.easebrain.live` (or your domain)
- [ ] `VERIFY_BASE_URL` = `https://www.easebrain.live/verify`
- [ ] `WEB_CONCURRENCY` = `2`

### Step 5: Wait for Deployment
- [ ] Backend service builds and deploys (5-10 minutes)
- [ ] Frontend service builds and deploys (5-10 minutes)
- [ ] Database initializes and migrations run
- [ ] Check build logs for errors

### Step 6: Test Services

Test Backend Health:
```bash
curl https://easebrain-backend.onrender.com/api/health
```

Expected response:
```json
{"status": "ok"}
```

Test Frontend:
- [ ] Visit `https://easebrain-frontend.onrender.com`
- [ ] Page loads without errors
- [ ] Frontend console (F12) has no CORS errors
- [ ] Can attempt to log in (may fail if db not initialized)

### Step 7: Configure Custom Domain (Optional)

For `easebrain.live`:

**Backend API:**
- [ ] In backend service, click "Settings"
- [ ] Scroll to "Custom domains"
- [ ] Add `api.easebrain.live`
- [ ] Update DNS CNAME record
- [ ] Wait for SSL certificate (automatic)

**Frontend:**
- [ ] In frontend service, click "Settings"
- [ ] Scroll to "Custom domains"
- [ ] Add `www.easebrain.live`
- [ ] Update DNS CNAME record
- [ ] Wait for SSL certificate (automatic)

### Step 8: Update CORS & URLs

If using custom domains, update backend CORS:
- [ ] Edit `backend-ease-brain/app.py`
- [ ] Update `cors_origins` list with new domains
- [ ] Commit and push
- [ ] Service auto-redeploys

### Step 9: Test Full Flow

- [ ] Signup page loads
- [ ] Try to create account
- [ ] Check email is received (send grid)
- [ ] Verify email link works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can perform core actions

## Post-Deployment

### Monitoring
- [ ] Set up Slack/email notifications
- [ ] Monitor error logs weekly
- [ ] Check database size monthly

### Backups
- [ ] Enable PostgreSQL automatic backups (paid plans)
- [ ] For free tier: manual backups recommended
- [ ] Test backup restore process

### Updates
- [ ] Set update frequency for dependencies
- [ ] Test updates locally before deploying
- [ ] Keep Python and Node versions current

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails: `pip: command not found` | Runtime set to Python, not Node |
| Build fails: `npm: command not found` | Runtime set to Node, not Python |
| Database connection error | Wait for database to start, verify DATABASE_URL |
| CORS errors in frontend | Update `cors_origins` in app.py, redeploy |
| Email not sending | Verify SENDGRID_API_KEY, check SendGrid logs |
| 502 Bad Gateway | Check backend logs, restart service |
| Frontend blank page | Check VITE_BASE_URL, verify build succeeded |

## Support Resources

- **Render Docs**: https://render.com/docs
- **Flask Docs**: https://flask.palletsprojects.com
- **SendGrid API**: https://sendgrid.com/docs/api-reference
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

## Rollback Plan

If deployment fails:
1. Go to service → Logs
2. Identify error from build logs
3. Fix locally and test with `bash render-build-test.sh`
4. Commit and push - Render auto-redeploys
5. Or click "Actions" → "Clear build cache and redeploy"

## Success Criteria

✅ **Deployment is successful when:**
- [ ] Both services show "Live" status in Render
- [ ] Backend `/api/health` returns 200 OK
- [ ] Frontend loads and displays content
- [ ] No CORS errors in browser console
- [ ] Can log in and access protected pages
- [ ] Email verification works (if SendGrid configured)
- [ ] No errors in service logs

---

**Last Updated**: March 2026
**Template Version**: 1.0
