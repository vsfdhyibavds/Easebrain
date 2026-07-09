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
db_ready=false
for i in {1..30}; do
    if python -c "from app import app, db; from sqlalchemy import text; app.app_context().push(); db.session.execute(text('SELECT 1'))" 2>/dev/null; then
        echo "✅ Database is ready"
        db_ready=true
        break
    fi
    echo "   Attempt $i/30 - Database not ready yet, waiting..."
    sleep 2
done

if [ "$db_ready" = false ]; then
    echo "❌ ERROR: Database not available after 60 seconds"
    exit 1
fi

# Run database migrations (with self-healing fallback)
echo "🗄️ Running database migrations..."
bash ./migrate_and_seed.sh

# Start Gunicorn
echo "🚀 Starting Gunicorn..."
exec gunicorn -c gunicorn_config.py app:app
