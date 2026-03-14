#!/usr/bin/env python
"""Debug password reset token issue"""

from dotenv import load_dotenv
from app import app
from models import User
from models.user_verification import UserVerification

load_dotenv()

test_email = "eugenewekesa748@gmail.com"

with app.test_client() as client:
    print("=" * 70)
    print("DEBUGGING PASSWORD RESET TOKEN FLOW")
    print("=" * 70)

    # Step 1: Request password reset
    print("\n1️⃣  REQUEST PASSWORD RESET")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()}")

    # Step 2: Get token from database and check details
    print("\n2️⃣  CHECK TOKEN IN DATABASE")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        if user:
            print(f"   User found: {user.email}")
            print(f"   User ID: {user.id}")

            verification = UserVerification.query.filter_by(user_id=user.id).first()
            if verification:
                print("   Verification found!")
                print(f"   Token: '{verification.token}'")
                print(f"   Token length: {len(verification.token)}")
                print(f"   Token type: {type(verification.token)}")
                print(f"   Expires at: {verification.expires_at}")
                print(f"   Is verified: {verification.is_verified}")
                print(f"   Is expired: {verification.is_token_expired()}")

                # Test token lookup
                print("\n3️⃣  TEST TOKEN LOOKUP")
                test_token = verification.token
                found = UserVerification.query.filter_by(token=test_token).first()
                print(f"   Direct token lookup: {found is not None}")

                # Try with different variations
                test_variations = [
                    test_token,
                    test_token.strip(),
                    test_token.encode().decode(),
                ]

                for i, variant in enumerate(test_variations):
                    found = UserVerification.query.filter_by(token=variant).first()
                    print(f"   Variation {i} found: {found is not None}")

                # Step 3: Try reset with correct token
                print("\n4️⃣  TRY RESET WITH TOKEN FROM DB")
            else:
                print("   ❌ No verification record found!")
        else:
            print(f"   ❌ User not found: {test_email}")

    # Test direct reset with token from DB
    if user and verification:
        response = client.post(
            "/api/reset-password",
            json={"token": verification.token, "password": "newSecurePassword123!"},
            content_type="application/json",
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.get_json()}")

    print("\n" + "=" * 70)
