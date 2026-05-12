#!/bin/bash
# Comprehensive fix script for Render deployment issues

echo "🔧 Starting EaseBrain deployment fix..."

# Step 1: Fix missing dependencies in requirements.txt
echo "📦 Updating requirements.txt with all dependencies..."
cd backend-ease-brain
pip freeze > requirements.txt
cd ..

# Step 2: Create a startup script that handles environment variable issues gracefully
echo "📝 Creating robust startup script..."
cat > backend-ease-brain/startup.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting EaseBrain backend..."

# Check required environment variables
if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY is not set"
    echo "   Please set SECRET_KEY in Render dashboard"
    exit 1
fi

if [ -z "$JWT_SECRET_KEY" ]; then
    echo "❌ ERROR: JWT_SECRET_KEY is not set"
    echo "   Please set JWT_SECRET_KEY in Render dashboard"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    echo "   Render should auto-set this from PostgreSQL service"
    exit 1
fi

echo "✅ All required environment variables are set"

# Wait for database to be ready (retry logic)
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if python -c "from app import app, db; app.app_context().push(); db.session.execute('SELECT 1')" 2>/dev/null; then
        echo "✅ Database is ready"
        break
    fi
    echo "   Attempt $i/30 - Database not ready yet, waiting..."
    sleep 2
done

# Run database migrations
echo "🗄️ Running database migrations..."
flask db upgrade || echo "⚠️ Migration failed, but continuing..."

# Seed roles if needed
echo "🌱 Seeding default roles..."
python seed_roles.py || echo "⚠️ Role seeding failed, but continuing..."

# Start Gunicorn
echo "🚀 Starting Gunicorn..."
exec gunicorn -c gunicorn_config.py app:app
EOF

chmod +x backend-ease-brain/startup.sh

# Step 3: Create a .env file template for local testing
echo "📋 Creating .env template..."
cat > backend-ease-brain/.env.example << 'EOF'
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
FLASK_DEBUG=0

# Secret Keys (Generate these locally for testing)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database (Render auto-sets this in production)
DATABASE_URL=postgresql://user:password@localhost:5432/easebrain

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-key
SENDER_EMAIL=noreply@easebrain.live

# Frontend URL
FRONTEND_URL=https://www.easebrain.live
VERIFY_BASE_URL=https://www.easebrain.live/verify

# JWT Configuration
JWT_ACCESS_TOKEN_EXPIRES=86400
JWT_TOKEN_LOCATION=headers
JWT_HEADER_NAME=Authorization
JWT_HEADER_TYPE=Bearer

# Other Settings
SQLALCHEMY_TRACK_MODIFICATIONS=False
WEB_CONCURRENCY=2
EOF

# Step 4: Update render.yaml to use the startup script
echo "📝 Updating render.yaml..."
cat > render.yaml << 'EOF'
services:
  # Python Flask Backend API
  - type: web
    name: easebrain-backend
    rootDir: backend-ease-brain
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    preDeployCommand: flask db upgrade && python seed_roles.py
    startCommand: ./startup.sh
    envVars:
      - key: PYTHON_VERSION
        value: "3.12"
      - key: FLASK_APP
        value: app.py
      - key: FLASK_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: easebrain-db
          property: connectionString
      - key: SECRET_KEY
        sync: false
      - key: JWT_SECRET_KEY
        sync: false
      - key: SENDGRID_API_KEY
        sync: false
      - key: SENDER_EMAIL
        sync: false
      - key: FRONTEND_URL
        value: https://www.easebrain.live
      - key: VERIFY_BASE_URL
        value: https://www.easebrain.live/verify
      - key: WEB_CONCURRENCY
        value: "2"
    healthCheckPath: /api/health

  # React Frontend (Static Site)
  - type: web
    name: easebrain-frontend
    rootDir: frontend-ease-brain
    env: static
    buildCommand: npm install --production=false && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_BASE_URL
        value: https://easebrain-backend.onrender.com/api

databases:
  - name: easebrain-db
    databaseName: easebrain
    user: easebrain_user
    region: oregon
    plan: free
EOF

# Step 5: Create a deployment checklist
echo "📋 Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
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
EOF

# Step 6: Create a simple test script to verify deployment
echo "🧪 Creating deployment test script..."
cat > test-deployment.sh << 'EOF'
#!/bin/bash

BACKEND_URL="https://easebrain-backend.onrender.com"

echo "🧪 Testing EaseBrain deployment..."

# Test health endpoint
echo "📊 Testing health endpoint..."
curl -s "$BACKEND_URL/api/health" | jq .

# Test API root
echo "📊 Testing API root..."
curl -s "$BACKEND_URL/api" | jq .

# Test documentation
echo "📊 Testing API documentation..."
curl -s "$BACKEND_URL/api/docs" | head -20

echo "✅ Tests completed!"
EOF

chmod +x test-deployment.sh

echo ""
echo "✅ Fix script completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Review the changes made by this script"
echo "2. Commit and push changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Fix: Comprehensive deployment fixes for Render'"
echo "   git push origin main"
echo ""
echo "3. In Render dashboard:"
echo "   - Go to easebrain-backend → Environment"
echo "   - Add these SECRET environment variables:"
echo "     * SECRET_KEY (generate with: python -c \"import secrets; print(secrets.token_hex(32))\")"
echo "     * JWT_SECRET_KEY (generate similarly)"
echo "     * SENDGRID_API_KEY (from SendGrid dashboard)"
echo "     * SENDER_EMAIL (verified email in SendGrid)"
echo ""
echo "4. Redeploy the service:"
echo "   - Go to easebrain-backend → Manual Deploy → Deploy latest commit"
echo ""
echo "5. Check logs for any errors"
echo ""
echo "📄 Reference files created:"
echo "   - DEPLOYMENT_CHECKLIST.md (step-by-step checklist)"
echo "   - test-deployment.sh (test script to verify deployment)"
echo ""
echo "🔍 If you still see 'Instance failed' errors, check:"
echo "   - Render service logs (easebrain-backend → Logs)"
echo "   - Look for specific error messages"
echo "   - Verify all environment variables are set correctly"