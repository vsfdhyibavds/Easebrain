#!/usr/bin/env python
"""Test email verification endpoint with whitespace handling"""

from dotenv import load_dotenv
from app import app
from models import User
from models.user_verification import UserVerification
from extensions import db

load_dotenv()

test_email = "verifytest@example.com"
test_password = "InitialP@ssw0rd"

with app.test_client() as client:
    print("=" * 70)
    print("EMAIL VERIFICATION WHITESPACE FIX TEST")
    print("=" * 70)

    # Clean up
    with app.app_context():
        existing = User.query.filter_by(email=test_email).first()
        if existing:
            UserVerification.query.filter_by(user_id=existing.id).delete()
            User.query.filter_by(email=test_email).delete()

            db.session.commit()

    # Create user
    print("\n1️⃣  CREATE USER")
    response = client.post(
        "/api/signup",
        json={
            "username": "verifytest",
            "email": test_email,
            "password": test_password,
            "first_name": "Test",
            "last_name": "User",
        },
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")

    # Get token
    print("\n2️⃣ GET VERIFICATION TOKEN FROM DB")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        token = verification.token
        print(f"   Token: {token}")
        print(f"   User active before: {user.is_active}")

    # Verify with token that has whitespace
    print("\n3️⃣ VERIFY EMAIL WITH TOKEN THAT HAS WHITESPACE")
    token_with_space = f" {token}\n"  # Whitespace like from copy-paste
    print(f"   Token with spaces: '{repr(token_with_space)}'")

    response = client.get(f"/api/verify-email?token={token_with_space}")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()['message']}")

    if response.status_code == 200:
        print("\n✅ EMAIL VERIFICATION WORKS WITH WHITESPACE FIX!")

        # Verify user is now active
        print("\n4️⃣ VERIFY USER IS NOW ACTIVE")
        with app.app_context():
            user = User.query.filter_by(email=test_email).first()
            print(f"   User active after: {user.is_active} ✅")
    else:
        print("\n❌ EMAIL VERIFICATION FAILED!")

    print("\n" + "=" * 70)
