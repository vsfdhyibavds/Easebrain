#!/usr/bin/env python3
"""Test script to set up test data for Day 1."""

from app import app, db
from werkzeug.security import generate_password_hash
from models.user import User
from models.user_role import UserRole
from models.role import Role
from models.user_verification import UserVerification
from models.caregiver_connection import CaregiverConnection


def setup_test_data():
    """Create test users and connections for testing."""
    with app.app_context():
        # Initialize database tables
        db.create_all()

        # 1. Create a caregiver user
        print("Creating caregiver...")
        caregiver = User(
            email="caregiver@test.com",
            password_hash=generate_password_hash("CaregiverPass123!"),
            first_name="Sarah",
            last_name="Care",
            is_active=True,
        )
        db.session.add(caregiver)
        db.session.flush()

        # Create verification for caregiver
        verification = UserVerification(user_id=caregiver.id, is_verified=True)
        db.session.add(verification)

        # Get or create caregiver role
        caregiver_role = Role.query.filter_by(name="Caregiver").first()
        if not caregiver_role:
            caregiver_role = Role(
                name="Caregiver", role_type="caregiver", is_caregiver=True
            )
            db.session.add(caregiver_role)
            db.session.flush()

        # Assign caregiver role
        user_role = UserRole(
            user_id=caregiver.id, role_id=caregiver_role.id, is_active=True
        )
        db.session.add(user_role)

        # 2. Create a patient/dependent user
        print("Creating patient/dependent...")
        patient = User(
            email="patient@test.com",
            password_hash=generate_password_hash("PatientPass123!"),
            first_name="John",
            last_name="Patient",
            is_active=True,
        )
        db.session.add(patient)
        db.session.flush()

        # Create verification for patient
        patient_verification = UserVerification(user_id=patient.id, is_verified=True)
        db.session.add(patient_verification)

        # 3. Create a caregiver connection
        print("Creating caregiver connection...")
        connection = CaregiverConnection(
            caregiver_id=caregiver.id,
            patient_id=patient.id,
            relationship="Family Member",
            role="Primary Caregiver",
            is_active=True,
        )
        db.session.add(connection)

        db.session.commit()

        print(f"✓ Caregiver created: {caregiver.email}, ID: {caregiver.id}")
        print(f"✓ Patient created: {patient.email}, ID: {patient.id}")
        print("✓ Connection created between caregiver and patient")

        return caregiver.id, patient.id


if __name__ == "__main__":
    setup_test_data()
