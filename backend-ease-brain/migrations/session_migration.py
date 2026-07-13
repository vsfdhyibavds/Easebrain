"""
Database migration script to add session and audit log tables.
Run this after updating models/session.py to create the tables.

Usage:
  python
  from extensions import db
  from app import app
  with app.app_context():
      db.create_all()
"""

from extensions import db


def create_session_tables():
    """Create session and audit log tables if they don't exist."""
    db.create_all()
    print("✅ Session and audit log tables created successfully!")


def seed_initial_roles():
    """
    Seed initial roles into the database.
    Run this once after creating roles table.
    """
    from models.role import Role

    # Check if roles already exist
    admin_role = Role.query.filter_by(name="admin").first()
    if admin_role:
        print("ℹ️  Roles already exist, skipping seed")
        return

    # Create role types
    roles_to_create = [
        # Admin roles
        {"name": "admin", "role_type": "admin", "is_caregiver": False},
        {"name": "moderator", "role_type": "admin", "is_caregiver": False},
        # Caregiver roles
        {"name": "therapist", "role_type": "caregiver", "is_caregiver": True},
        {"name": "counselor", "role_type": "caregiver", "is_caregiver": True},
        {"name": "coach", "role_type": "caregiver", "is_caregiver": True},
        {"name": "psychologist", "role_type": "caregiver", "is_caregiver": True},
        {"name": "psychiatrist", "role_type": "caregiver", "is_caregiver": True},
        {
            "name": "clinical_social_worker",
            "role_type": "caregiver",
            "is_caregiver": True,
        },
        {"name": "peer_support", "role_type": "caregiver", "is_caregiver": True},
        {"name": "life_coach", "role_type": "caregiver", "is_caregiver": True},
        {"name": "nutritionist", "role_type": "caregiver", "is_caregiver": True},
        {"name": "care_coordinator", "role_type": "caregiver", "is_caregiver": True},
        # User roles
        {"name": "client", "role_type": "user", "is_caregiver": False},
        {"name": "patient", "role_type": "user", "is_caregiver": False},
    ]

    for role_data in roles_to_create:
        role = Role(**role_data)
        db.session.add(role)

    db.session.commit()
    print(f"✅ Seeded {len(roles_to_create)} initial roles")


def assign_admin_to_first_user():
    """
    Utility function to assign admin role to the first user in the system.
    Useful for development - assign admin to your test user.
    """
    from models.user import User
    from models.user_role import UserRole
    from models.role import Role

    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        print("❌ Admin role not found. Run seed_initial_roles() first.")
        return

    first_user = User.query.first()
    if not first_user:
        print("❌ No users found in database")
        return

    # Check if user already has admin role
    existing = UserRole.query.filter_by(
        user_id=first_user.id, role_id=admin_role.id
    ).first()

    if existing:
        print(f"ℹ️  User {first_user.username} already has admin role")
        return

    # Assign admin role
    user_role = UserRole(user_id=first_user.id, role_id=admin_role.id)
    db.session.add(user_role)
    db.session.commit()
    print(f"✅ Assigned admin role to user: {first_user.username}")


def create_test_users_with_roles():
    """
    Create test users with different roles for development.
    Only creates if they don't already exist.
    """
    from models.user import User
    from models.user_role import UserRole
    from models.role import Role
    from werkzeug.security import generate_password_hash

    test_users = [
        {
            "username": "admin_test",
            "email": "admin@test.com",
            "password": "AdminTest123!",
            "roles": ["admin"],
        },
        {
            "username": "therapist_test",
            "email": "therapist@test.com",
            "password": "TherapistTest123!",
            "roles": ["therapist"],
        },
        {
            "username": "client_test",
            "email": "client@test.com",
            "password": "ClientTest123!",
            "roles": ["client"],
        },
    ]

    created_count = 0

    for user_data in test_users:
        # Check if user exists
        existing = User.query.filter_by(email=user_data["email"]).first()
        if existing:
            print(f"ℹ️  User {user_data['username']} already exists")
            continue

        # Create user
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=generate_password_hash(user_data["password"]),
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()  # Get user ID

        # Assign roles
        for role_name in user_data["roles"]:
            role = Role.query.filter_by(name=role_name).first()
            if role:
                user_role = UserRole(user_id=user.id, role_id=role.id)
                db.session.add(user_role)

        created_count += 1

    db.session.commit()
    print(f"✅ Created {created_count} test users with roles")


# To run these in your Flask shell:
#
# flask shell
# >>> from migrations.session_migration import *
# >>> create_session_tables()
# >>> seed_initial_roles()
# >>> create_test_users_with_roles()
# >>> assign_admin_to_first_user()
