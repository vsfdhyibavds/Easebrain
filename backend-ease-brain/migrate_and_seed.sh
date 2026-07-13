#!/bin/bash
# DB initialization for EaseBrain.
# 1. Apply Alembic migrations (source of truth going forward). Migrations are
#    now committed (previously gitignored, which is what broke deploys).
# 2. If `flask db upgrade` fails (e.g. the live DB was bootstrapped earlier by
#    db.create_all() and tables already exist), fall back to db.create_all() so
#    the app can still deploy instead of failing the build.
# 3. Run an idempotent schema-drift repair: ensure roles.is_caregiver exists.
#    The live DB was built by an older db.create_all() that predates this column,
#    causing a 500 on GET /api/roles. This fixes it on every deploy.
# 4. Seed default roles (idempotent).

set -eu

echo "==> Running database migrations..."
if ! flask db upgrade; then
    echo "⚠️  flask db upgrade failed; bootstrapping schema with db.create_all()"
    python - <<'PY'
from app import app, db
with app.app_context():
    db.create_all()
    print("✅ db.create_all() bootstrap completed.")
PY
fi

echo "==> Repairing known schema drift (roles.is_caregiver)..."
python - <<'PY'
from app import app, db
from sqlalchemy import text
with app.app_context():
    inspector = db.inspect(db.engine)
    if inspector.has_table("roles"):
        cols = [c["name"] for c in inspector.get_columns("roles")]
        if "is_caregiver" not in cols:
            db.session.execute(
                text("ALTER TABLE roles ADD COLUMN is_caregiver BOOLEAN NOT NULL DEFAULT FALSE")
            )
            db.session.commit()
            print("✅ Repaired: added missing roles.is_caregiver column.")
        else:
            print("✅ roles.is_caregiver already present.")
    else:
        print("ℹ️  roles table missing (will be created by migrations/create_all).")
PY

echo "==> Seeding default roles..."
python seed_roles.py
