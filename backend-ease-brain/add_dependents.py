#!/usr/bin/env python3
"""
Script to add dependent users to the database for testing
Run with: python add_dependents.py
"""

import sys
from datetime import datetime
from werkzeug.security import generate_password_hash
from app import app, db
from models import User, Role, UserRole


def add_dependents():
    """Add 5 dependent users to the database"""

    with app.app_context():
        # Get the patient role (dependents are patients)
        patient_role = Role.query.filter_by(name="Patient").first()
        if not patient_role:
            print("❌ 'Patient' role not found. Please create it first.")
            return False

        # Dependent data to add
        dependents_data = [
            {
                "id": 2,
                "username": "robert.smith",
                "email": "robert.smith@email.com",
                "first_name": "Robert",
                "last_name": "Smith",
                "phone_number": "+1 (555) 234-5678",
                "location": "Somewhere, CA",
                "date_of_birth": "1958-03-15",
            },
            {
                "id": 3,
                "username": "patricia.davis",
                "email": "patricia.davis@email.com",
                "first_name": "Patricia",
                "last_name": "Davis",
                "phone_number": "+1 (555) 345-6789",
                "location": "Nowhere, CA",
                "date_of_birth": "1951-07-22",
            },
            {
                "id": 4,
                "username": "james.wilson",
                "email": "james.wilson@email.com",
                "first_name": "James",
                "last_name": "Wilson",
                "phone_number": "+1 (555) 456-7890",
                "location": "Someplace, CA",
                "date_of_birth": "1956-11-08",
            },
            {
                "id": 5,
                "username": "elizabeth.brown",
                "email": "elizabeth.brown@email.com",
                "first_name": "Elizabeth",
                "last_name": "Brown",
                "phone_number": "+1 (555) 567-8901",
                "location": "Somewhere Else, CA",
                "date_of_birth": "1961-05-30",
            },
        ]

        added_count = 0
        for dependent in dependents_data:
            # Check if user already exists
            existing_user = User.query.filter(
                (User.email == dependent["email"])
                | (User.username == dependent["username"])
            ).first()

            if existing_user:
                print(
                    f"⚠️  User '{dependent['first_name']} {dependent['last_name']}' already exists (ID: {existing_user.id})"
                )
                continue

            # Create new user
            user = User(
                username=dependent["username"],
                email=dependent["email"],
                password_hash=generate_password_hash("password123"),
                first_name=dependent["first_name"],
                last_name=dependent["last_name"],
                phone_number=dependent["phone_number"],
                location=dependent["location"],
                date_of_birth=dependent["date_of_birth"],
                is_active=True,
            )

            db.session.add(user)
            db.session.flush()  # Get the ID without committing

            # Assign patient role
            user_role = UserRole(user_id=user.id, role_id=patient_role.id)
            db.session.add(user_role)

            print(
                f"✅ Added: {dependent['first_name']} {dependent['last_name']} (ID: {user.id}, Email: {dependent['email']})"
            )
            added_count += 1

        if added_count > 0:
            db.session.commit()
            print(
                f"\n✅ Successfully added {added_count} dependent(s) to the database!"
            )
            return True
        else:
            print("\n⚠️  No new dependents were added.")
            return False


if __name__ == "__main__":
    try:
        success = add_dependents()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)
