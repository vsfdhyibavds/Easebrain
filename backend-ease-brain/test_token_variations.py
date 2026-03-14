#!/usr/bin/env python
"""Test password reset with token manipulation checks"""

from dotenv import load_dotenv
from app import app
from models import User
from models.user_verification import UserVerification
from extensions import db
from urllib.parse import quote

load_dotenv()

test_email = "tokentest@example.com"
test_password = "InitialP@ssw0rd"

with app.test_client() as client:
    print("=" * 70)
    print("TOKEN MANIPULATION TEST")
    print("=" * 70)

    # Create user
    print("\n1️⃣  CREATE TEST USER")
    response = client.post(
        "/api/signup",
        json={
            "username": "tokentest",
            "email": test_email,
            "password": test_password,
            "first_name": "Test",
            "last_name": "User",
        },
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")

    # Request reset
    print("\n2️⃣  REQUEST PASSWORD RESET")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")

    # Get token
    print("\n3️⃣ GET TOKEN FROM DB")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        original_token = verification.token

        print(f"   Original token: {original_token}")
        print(f"   Token chars: {list(original_token)}")

    # Test various manipulations that could happen
    manipulations = {
        "original": original_token,
        "double_encoded": quote(quote(original_token, safe=""), safe=""),
        "spaces_added_start": " " + original_token,
        "spaces_added_end": original_token + " ",
        "newline_added": original_token + "\n",
    }

    print("\n4️⃣  TEST TOKEN VARIATIONS")
    for name, test_token in manipulations.items():
        print(f"\n   Testing '{name}':")
        print(f"   Token: '{test_token}'")

        # Reset token for fresh test
        with app.app_context():
            user = User.query.filter_by(email=test_email).first()
            verification = UserVerification.query.filter_by(user_id=user.id).first()
            verification.is_verified = False

            db.session.commit()

        response = client.post(
            "/api/reset-password",
            json={"token": test_token, "password": "NewSecureP@ssw0rd123"},
            content_type="application/json",
        )
        print(f"   Status: {response.status_code}")
        if response.status_code != 200:
            print(f"   Error: {response.get_json()['message']}")

    print("\n" + "=" * 70)
