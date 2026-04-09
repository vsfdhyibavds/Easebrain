# Render Deployment Guide for EaseBrain

This guide covers deploying the EaseBrain platform to Render.com, including both the Flask backend API and React frontend.

## 📋 Prerequisites

- Render account (https://render.com)
- GitHub repository with this code
- Domain name (optional but recommended for production)
- SendGrid account for email service
- OpenAI API key (optional, for LLM-enhanced danger detection)

## 🚀 Deployment Steps

### 1. Connect Your GitHub Repository to Render

1. Log in to your Render dashboard
2. Click **New +** → **Blueprint**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account
5. Select the repository: `your-username/easebrain`
6. Confirm Render detects `render.yaml` and creates:
   - `easebrain-backend` (`env: python`, `rootDir: backend-ease-brain`)
   - `easebrain-frontend` (`env: static`, `rootDir: frontend-ease-brain`)
   - `easebrain-db` (PostgreSQL)

### 2. Create a PostgreSQL Database

1. In Render dashboard: **New +** → **PostgreSQL**
2. Configure:
   - **Name:** `easebrain-db`
   - **Database:** `easebrain`
   - **User:** `easebrain_user`
   - **Region:** Oregon (same as service)
   - **PostgreSQL Version:** 15 (or latest)
   - **Plan:** Standard ($12/month recommended for production)
3. Render will auto-create environment variables
4. Wait for database to initialize (~5 minutes)

### 3. Render Configuration File

The `render.yaml` file is already configured and includes:

```yaml
services:
  - type: web
    name: easebrain-backend
    env: python
    rootDir: backend-ease-brain
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn -c gunicorn_config.py app:app
  - type: web
    name: easebrain-frontend
    env: static
    rootDir: frontend-ease-brain
    buildCommand: npm install --production=false && npm run build
    staticPublishPath: dist
```

**Key Features:**
- Separate backend and frontend services with explicit runtimes
- Uses per-service `rootDir` to avoid runtime auto-detection issues
- Uses Gunicorn for production WSGI
- Frontend served as a static site

### 4. Set Required Environment Variables

In Render dashboard for the backend service, go to **Environment**:

#### Critical Variables (Must Set):

1. **SECRET_KEY**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **JWT_SECRET_KEY**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. **SendGrid Configuration:**
   - `SENDGRID_API_KEY`: From SendGrid Dashboard
   - `SENDER_EMAIL`: Verified sender email in SendGrid

#### Optional Variables:

- `OPENAI_API_KEY`: If using LLM-enhanced danger detection
- `LLM_PROVIDER`: Set to `openai` to enable LLM features
- `LOG_LEVEL`: Set to `debug` for troubleshooting

#### Auto-Set Variables (by Render):

- `DATABASE_URL`: Automatically set from PostgreSQL service
- `FLASK_ENV=production`
- `FLASK_DEBUG=0`
- `PYTHON_VERSION=3.12`

Use the `.env.render.example` file as a template for all available variables.

### 5. Application Configuration

**Backend Build Command:**
```bash
pip install -r requirements.txt
```

**Frontend Build Command:**
```bash
npm install --production=false && npm run build
```

**Start Command:**
```bash
gunicorn -c gunicorn_config.py app:app
```

Uses `gunicorn_config.py` for production optimization:
- Worker pool sizing based on CPU count
- Memory leak prevention
- Proper timeouts

### 6. Custom Domain (Optional)

1. In Render service settings, click **Settings**
2. Go to **Custom Domains**
3. Add your domain (e.g., `www.easebrain.live`)
4. Follow DNS setup instructions
5. Render auto-provisions SSL certificate

## 📝 Verification After Deployment

### 1. Check Deployment Status
- In Render dashboard, check **Logs**
- Look for `Gunicorn started` message
- Verify database migrations completed

### 2. Test API Endpoints

```bash
# Health check
curl https://your-domain/api/health

# Get API documentation
curl https://your-domain/api/docs
```

### 3. Test Frontend
- Visit `https://your-domain` in browser
- Should load React app
- Check browser console for any errors

### 4. Test Email Sending
- Use a test endpoint: `POST /api/test-email`
- Verify emails arrive in inbox

## 🔍 Troubleshooting

### Build Failures

**Problem:** `npm install` fails in build command

```
Solution: Update Node version in render.yaml if needed:
  - Add: NODEJS_VERSION=18 to envVars
```

**Problem:** Database migration fails

```
Solution: Check logs for migration errors
- Manual fix: SSH into service and run `flask db current`
- May need to create initial migration if none exists
```

### Runtime Issues

**Problem:** `504 Service Unavailable` or timeouts

```
Solution: Check Gunicorn workers
1. Verify WEB_CONCURRENCY is set (2-4 workers)
2. Check service logs for crashes
3. Increase timeout in gunicorn_config.py if needed
```

**Problem:** `Cannot find module` errors

```
Solution: Ensure requirements.txt is updated
- Run: pip freeze > requirements.txt locally
- Commit change and re-deploy
```

**Problem:** Email not sending

```
Solution: Verify SendGrid setup
1. Check SENDGRID_API_KEY is set correctly
2. Verify SENDER_EMAIL is validated in SendGrid
3. Check email logs in SendGrid dashboard
4. Look for error messages in Render logs
```

### Frontend Issues

**Problem:** Frontend not loading or shows 404

```
Solution:
1. Check frontend build completed: npm run build ran successfully
2. Verify dist folder exists after build
3. Look for 'Frontend build not found' message in logs
4. Try rebuilding with: render-cli deploy --clear-build-cache
```

**Problem:** API calls from frontend fail with CORS error

```
Solution:
1. Check CORS origins in app.py include your domain
2. Verify FRONTEND_URL environment variable is set correctly
3. Check browser console Network tab for actual response
```

## 🔄 Redeployment

### Manual Redeploy

1. In Render dashboard → Service name
2. Click **Manual Deploy** → **Deploy latest commit**

### Automatic Redeploy

Configure in **Settings** → **Auto-Deploy**:
- Select branch (`main` recommended)
- Auto-deploy on push enabled

### Full Rebuild (Clear Cache)

```bash
render-cli deploy --clear-build-cache
```

## 🛡️ Security Checklist

- [ ] `FLASK_ENV` set to `production`
- [ ] `FLASK_DEBUG` set to `0`
- [ ] Both `SECRET_KEY` and `JWT_SECRET_KEY` are cryptographically random
- [ ] SendGrid API key stored as environment variable (not in code)
- [ ] Database user has least-privilege permissions
- [ ] HTTPS enforced (Render auto-redirects HTTP → HTTPS)
- [ ] CORS origins only include your legitimate domains
- [ ] Session cookies marked as `Secure` and `HttpOnly`

## 📊 Performance Optimization

### Gunicorn Workers
- **Free plan:** 1 worker
- **Standard plan:** 2-4 workers (set via `WEB_CONCURRENCY`)
- **Pro plan:** 4+ workers

Render recommends: `2 * CPU_count + 1`

### Database Connections
- SQLAlchemy connection pooling is enabled
- Pool size auto-tuned in production
- Connection timeout: 30s

### Frontend Caching
- Static assets served with cache headers
- React build optimized with tree-shaking
- Gzip compression enabled

## 🗄️ Database Management

### Backup

Render automatically backs up PostgreSQL:
- Daily backups retained for 7 days
- Manual backup: Go to database service → Download backup

### Connect Locally

```bash
# Get connection string from Render database service
# Use with pgAdmin or psql
psql postgresql://user:password@host:5432/easebrain
```

### Migrations

Migrations are not configured to run automatically in the current `render.yaml`. Create and apply them locally:

```bash
# Locally
cd backend-ease-brain
flask db migrate -m "Description of change"
flask db upgrade
git add migrations/
git commit -m "Add migration"
git push
```

If you want automatic migration on deploy, add a Render pre-deploy command for the backend:

```bash
flask db upgrade
```

## 📖 Useful Resources

- [Render Documentation](https://render.com/docs)
- [Flask Deployment](https://flask.palletsprojects.com/deployment/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)
- [React Production Build](https://react.dev/learn/deployment)
- [SendGrid Integration](https://sendgrid.com/docs/)

## 🆘 Getting Help

1. Check Render service **Logs** for specific errors
2. Review application error logs at `/logs` directory
3. Verify environment variables are set correctly
4. Check database connectivity: `flask shell` → `db.session.execute(sqlalchemy.text('SELECT 1'))`
5. Re-read this guide's troubleshooting section

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring/alerts in Render dashboard
2. Configure custom domain DNS
3. Set up SendGrid email templates
4. Configure OpenAI API for LLM features (optional)
5. Set up analytics and monitoring
6. Plan database optimization based on usage
7. Schedule regular backups

---

**Last Updated:** March 2026
**EaseBrain Version:** Phase B (Danger Detection & LLM Integration)
