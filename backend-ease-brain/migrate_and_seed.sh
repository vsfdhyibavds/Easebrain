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
# 5. Verify the schema is correct before finishing.

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

echo "==> Verifying migrations applied..."
python - <<'PY'
from app import app, db
from sqlalchemy import inspect, text
with app.app_context():
    inspector = inspect(db.engine)
    version_table = inspector.has_table("alembic_version")
    print(f"   Alembic version table exists: {version_table}")
    if version_table:
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            versions = [row[0] for row in result]
            print(f"   Applied migrations: {versions}")
PY

echo "==> Repairing known schema drift (roles.is_caregiver)..."
python - <<'PY'
from app import app, db
from sqlalchemy import inspect, text
with app.app_context():
    inspector = inspect(db.engine)
    if inspector.has_table("roles"):
        cols = [c["name"] for c in inspector.get_columns("roles")]
        print(f"   Current roles columns: {cols}")
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

echo "==> Verifying roles table schema..."
python - <<'PY'
from app import app, db
from models.role import Role
from sqlalchemy import inspect
with app.app_context():
    inspector = inspect(db.engine)
    if inspector.has_table("roles"):
        cols = [c["name"] for c in inspector.get_columns("roles")]
        expected = ["id", "name", "role_type", "is_caregiver"]
        missing = [c for c in expected if c not in cols]
        if missing:
            print(f"❌ FATAL: roles table is missing columns: {missing}")
            print(f"   Current columns: {cols}")
            exit(1)
        else:
            print(f"✅ roles table schema verified: {cols}")
        
        try:
            roles = Role.query.all()
            print(f"✅ Role.query.all() works: found {len(roles)} roles")
            for r in roles:
                print(f"   - {r.name} (type={r.role_type}, caregiver={r.is_caregiver})")
        except Exception as e:
            print(f"❌ FATAL: Role.query.all() failed: {e}")
            exit(1)
    else:
        print("ℹ️  roles table does not exist yet (will be created by migrations).")
PY

echo "==> Seeding default roles..."
python seed_roles.py

echo "==> Database initialization complete."
