#!/bin/bash
# Robust DB initialization for EaseBrain.
# 1. Apply Alembic migrations (source of truth for schema).
# 2. If migrations fail (e.g. orphaned alembic_version), fall back to
#    db.create_all() so missing tables are created instead of the app
#    silently shipping with a broken schema.
# 3. Seed default roles (idempotent).

set -u

echo "==> Running database migrations..."
flask db upgrade
MIGRATE_STATUS=$?

if [ "$MIGRATE_STATUS" -ne 0 ]; then
    echo "⚠️  flask db upgrade failed (exit $MIGRATE_STATUS)."
    echo "⚠️  Falling back to db.create_all() to ensure tables exist."
    python - <<'PY'
from app import app, db
with app.app_context():
    db.create_all()
    print("✅ db.create_all() completed.")
PY
fi

echo "==> Seeding default roles..."
python seed_roles.py || echo "⚠️  Role seeding reported an issue; continuing."
