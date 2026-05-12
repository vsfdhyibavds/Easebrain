# Render Deployment Checklist

## Pre-Deployment

- [ ] Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Generate JWT_SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Get SendGrid API key from SendGrid dashboard
- [ ] Verify sender email in SendGrid

## In Render Dashboard

### Backend Service Environment Variables
Go to: easebrain-backend → Environment → Add these as **Secret** variables:

- [ ] `SECRET_KEY` = (paste generated value)
- [ ] `JWT_SECRET_KEY` = (paste generated value)
- [ ] `SENDGRID_API_KEY` = (paste SendGrid key)
- [ ] `SENDER_EMAIL` = (verified email in SendGrid)

### Verify Configuration
- [ ] Check that `DATABASE_URL` is auto-set (should appear in Environment tab)
- [ ] Verify build command: `pip install -r requirements.txt`
- [ ] Verify start command: `./startup.sh`
- [ ] Verify preDeploy command: `flask db upgrade && python seed_roles.py`

## Post-Deployment

- [ ] Check service logs for startup messages
- [ ] Test health endpoint: `https://your-backend.onrender.com/api/health`
- [ ] Verify database tables were created
- [ ] Test email functionality (signup, password reset)

## Troubleshooting

If service fails to start:
1. Check logs in Render dashboard
2. Look for "ERROR:" messages
3. Verify all environment variables are set
4. Check database connection string

Common errors:
- `SECRET_KEY is not set` → Add SECRET_KEY to environment
- `JWT_SECRET_KEY is not set` → Add JWT_SECRET_KEY to environment
- `could not connect to server` → Wait for database to initialize, check DATABASE_URL
- `ModuleNotFoundError` → Update requirements.txt and redeploy
