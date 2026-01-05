#!/usr/bin/env python3
"""
Assign a role to a user (useful for testing role-based verification).
Usage: python assign_user_role.py <user_id> <role_id>

Example: python assign_user_role.py 1 2

First, check what roles exist:
  SELECT id, name, role_type FROM roles;

Then check users:
  SELECT id, email FROM users;
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend-ease-brain"))

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(1)

# Import the Flask `app` and `db` from backend-ease-brain/app.py. Some editors
# and linters can't resolve imports that rely on runtime-modified sys.path,
# so we attempt a normal import first and fall back to loading the module by
# file path using importlib. This avoids the "Import 'app' could not be
# resolved" warning and is robust at runtime.
try:
    # Try the straightforward import (works when sys.path insertion is
    # recognized by the environment).
    from app import app, db  # type: ignore
except Exception:
    import importlib.util

    app_path = os.path.join(os.path.dirname(__file__), "backend-ease-brain", "app.py")
    spec = importlib.util.spec_from_file_location("easebrain_app", app_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore
    app = getattr(module, "app")
    db = getattr(module, "db")

user_id = int(sys.argv[1])
role_id = int(sys.argv[2])

with app.app_context():
    # Import model classes. Some editors can't resolve imports that rely on
    # runtime-modified sys.path, so try normal import first and fall back to
    # loading the module files directly from backend-ease-brain/models.
    import importlib.util

    def _load_model(name):
        path = os.path.join(
            os.path.dirname(__file__), "backend-ease-brain", "models", f"{name}.py"
        )
        spec = importlib.util.spec_from_file_location(f"models.{name}", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore
        return mod

    UserRole = getattr(_load_model("user_role"), "UserRole")
    User = getattr(_load_model("user"), "User")
    Role = getattr(_load_model("role"), "Role")

    # Verify user exists
    user = User.query.get(user_id)
    if not user:
        print(f"❌ User with ID {user_id} not found")
        sys.exit(1)

    # Verify role exists
    role = Role.query.get(role_id)
    if not role:
        print(f"❌ Role with ID {role_id} not found")
        sys.exit(1)

    # Check if assignment already exists and is active
    existing = UserRole.query.filter_by(
        user_id=user_id, role_id=role_id, is_active=True
    ).first()

    if existing:
        print(f"⚠️  User {user.email} already has active role '{role.name}'")
        sys.exit(0)

    # Create assignment
    assignment = UserRole(user_id=user_id, role_id=role_id, is_active=True)
    db.session.add(assignment)
    db.session.commit()

    print("\n✅ Role assignment created successfully!")
    print(f"   User:  {user.email} (ID: {user_id})")
    print(f"   Role:  {role.name} (ID: {role_id})")
    print(f"   Type:  {role.role_type}")
    print("   Active: Yes\n")
