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
echo "   DATABASE_URL=$DATABASE_URL"

# Wait for database to be ready (retry logic)
echo "⏳ Waiting for database to be ready..."
db_ready=false
for i in {1..30}; do
    db_output=$(python -c "
from app import app, db
from sqlalchemy import text
with app.app_context():
    try:
        db.session.execute(text('SELECT 1'))
        print('OK')
    except Exception as e:
        print(str(e))
" 2>&1)
    
    if [ "$db_output" = "OK" ]; then
        echo "✅ Database is ready"
        db_ready=true
        break
    fi
    
    echo "   Attempt $i/30 - Database not ready yet, waiting..."
    
    # Detect specific hostname resolution failure
    if echo "$db_output" | grep -qi "could not translate host name"; then
        echo ""
        echo "❌ FATAL: Database hostname cannot be resolved"
        echo "   This usually means the Render PostgreSQL database was deleted or recreated."
        echo ""
        echo "   ACTION REQUIRED:"
        echo "   1. Go to Render Dashboard → Databases"
        echo "   2. Check if 'easebrain-db' exists"
        echo "   3. If missing, recreate it or create a new PostgreSQL database"
        echo "   4. Update the web service 'DATABASE_URL' environment variable:"
        echo "      - Go to easebrain-backend → Environment"
        echo "      - Update DATABASE_URL with the new connection string"
        echo "      - Or re-link the database from the 'fromDatabase' dropdown"
        echo ""
        echo "   Current DATABASE_URL: $DATABASE_URL"
        echo ""
        exit 1
    fi
    
    sleep 2
done

if [ "$db_ready" = false ]; then
    echo "❌ ERROR: Database not available after 60 seconds"
    echo "   Please check Render dashboard → Databases"
    exit 1
fi

# Run database migrations (with self-healing fallback)
echo "🗄️ Running database migrations..."
bash ./migrate_and_seed.sh

# Start Gunicorn
echo "🚀 Starting Gunicorn..."
exec gunicorn -c gunicorn_config.py app:app
