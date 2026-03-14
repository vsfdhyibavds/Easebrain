#!/usr/bin/env python
"""Simulate the full frontend reset flow"""

from dotenv import load_dotenv
from app import app
from models import User
from models.user_verification import UserVerification
import json

load_dotenv()

test_email = "test_reset@example.com"
test_password = "InitialP@ssw0rd"
new_password = "NewSecureP@ssw0rd123"

with app.test_client() as client:
    print("=" * 70)
    print("FULL RESET FLOW SIMULATION")
    print("=" * 70)

    # First, create a test user
    print("\n1️⃣  CREATE TEST USER")
    response = client.post(
        "/api/signup",
        json={
            "username": "testreset",
            "email": test_email,
            "password": test_password,
            "first_name": "Test",
            "last_name": "User",
        },
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")

    # Request password reset
    print("\n2️⃣  REQUEST PASSWORD RESET")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()}")

    # Get token from database (simulating user clicking the link)
    print("\n3️⃣ SIMULATE USER CLICKING RESET LINK")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        token = verification.token

        print(f"   Token from DB: {token}")
        print(f"   Token expires: {verification.expires_at}")
        print(f"   Token already used? {verification.is_verified}")

    # Now simulate the frontend sending the reset request
    print("\n4️⃣ SIMULATE FRONTEND RESET REQUEST")

    request_data = {"token": token, "password": new_password}

    print(f"   Request payload: {json.dumps(request_data)}")

    response = client.post(
        "/api/reset-password",
        json=request_data,
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()}")

    if response.status_code == 200:
        print("\n✅ RESET SUCCESSFUL!")
        print("\n5️⃣ TRY TO LOGIN WITH NEW PASSWORD")
        response = client.post(
            "/api/login",
            json={"email": test_email, "password": new_password},
            content_type="application/json",
        )
        print(f"   Status: {response.status_code}")
        data = response.get_json()
        if "access_token" in data:
            print("   ✅ Login successful with new password")
        else:
            print(f"   ❌ Login failed: {data}")
    else:
        print("\n❌ RESET FAILED!")
        print("\n5️⃣  CHECK DATABASE STATE")
        with app.app_context():
            user = User.query.filter_by(email=test_email).first()
            verification = UserVerification.query.filter_by(user_id=user.id).first()
            print(f"   Token in DB: {verification.token}")
            print(f"   Sent token: {token}")
            print(f"   Tokens match: {verification.token == token}")

    print("\n" + "=" * 70)
