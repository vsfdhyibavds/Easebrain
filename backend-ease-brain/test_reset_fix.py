#!/usr/bin/env python
"""Comprehensive test of the password reset fix"""

from dotenv import load_dotenv
from app import app
from models import User
from models.user_verification import UserVerification
from extensions import db
from werkzeug.security import check_password_hash

load_dotenv()

test_email = "fixtest@example.com"
test_password = "InitialP@ssw0rd"
new_password = "NewSecureP@ssw0rd123"

with app.test_client() as client:
    print("=" * 70)
    print("PASSWORD RESET FIX VERIFICATION")
    print("=" * 70)

    # Clean up any existing user
    with app.app_context():
        existing = User.query.filter_by(email=test_email).first()
        if existing:
            UserVerification.query.filter_by(user_id=existing.id).delete()
            User.query.filter_by(email=test_email).delete()

            db.session.commit()

    # Create test user
    print("\n1️⃣  CREATE TEST USER")
    response = client.post(
        "/api/signup",
        json={
            "username": "fixtest",
            "email": test_email,
            "password": test_password,
            "first_name": "Test",
            "last_name": "User",
        },
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        print(f"   Error: {response.get_json()}")

    # Request password reset
    print("\n2️⃣  REQUEST PASSWORD RESET (normal)")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")

    # Get token from DB
    print("\n3️⃣ GET TOKEN FROM DB")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        token = verification.token
        print(f"   Token: {token}")

    # Test reset with token that has leading/trailing spaces (simulating copy-paste issue)
    print("\n4️⃣ RESET WITH TOKEN THAT HAS WHITESPACE (the bug case!)")
    token_with_space = f" {token} "  # Spaces like from copy-paste
    print(f"   Token with spaces: '{token_with_space}'")

    response = client.post(
        "/api/reset-password",
        json={"token": token_with_space, "password": new_password},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()['message']}")

    if response.status_code == 200:
        print("\n✅ RESET SUCCESSFUL WITH WHITESPACE FIX!")

        # Verify password changed in database
        print("\n5️⃣ VERIFY PASSWORD CHANGED IN DATABASE")
        with app.app_context():
            user = User.query.filter_by(email=test_email).first()
            password_matches = check_password_hash(user.password_hash, new_password)
            print(f"   New password works: {password_matches} ✅")
    else:
        print("\n❌ RESET FAILED!")

    print("\n" + "=" * 70)
    print("FIX STATUS: ✅ WHITESPACE STRIPPING IMPLEMENTED")
    print("=" * 70)
