#!/usr/bin/env python
"""Seed default roles into the database"""

from app import app, db
from models.role import Role


def seed_roles():
    """Add default roles if they don't exist"""
    default_roles = [
        {"name": "Patient", "role_type": "patient", "is_caregiver": False},
        {"name": "Caregiver", "role_type": "caregiver", "is_caregiver": True},
        {"name": "Admin", "role_type": "admin", "is_caregiver": False},
        {"name": "Organization", "role_type": "organization", "is_caregiver": False},
    ]

    with app.app_context():
        for role_data in default_roles:
            # Check if role already exists
            existing = Role.query.filter_by(name=role_data["name"]).first()
            if not existing:
                role = Role(**role_data)
                db.session.add(role)
                print(f"✅ Added role: {role_data['name']}")
            else:
                print(f"⏭️  Role already exists: {role_data['name']}")

        db.session.commit()
        print("\n✅ Roles seeded successfully!")

        # List all roles
        all_roles = Role.query.all()
        print(f"\nAvailable roles ({len(all_roles)}):")
        for role in all_roles:
            print(f"  - {role.name} (ID: {role.id}, Type: {role.role_type})")


if __name__ == "__main__":
    seed_roles()
