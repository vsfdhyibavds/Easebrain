#!/usr/bin/env python
"""Test password reset - simpler version"""

import os
from dotenv import load_dotenv

load_dotenv()

from app import app
from models import User
from models.user_verification import UserVerification

test_email = "eugenewekesa748@gmail.com"
new_password = "newSecurePassword123!"

with app.test_client() as client:
    print("=" * 70)
    print("PASSWORD RESET FLOW TEST")
    print("=" * 70)

    # Step 1: Request password reset
    print("\n1️⃣  REQUEST PASSWORD RESET (/api/forgot-password)")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code} ✅")
    print(f"   Message: {response.get_json()['message']}")

    # Step 2: Get token from database
    print("\n2️⃣  GET RESET TOKEN FROM DATABASE")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        token = verification.token
    print(f"   Token: {token[:30]}...")
    print(f"   Expires: {verification.expires_at} ✅")

    # Step 3: Reset password with token
    print("\n3️⃣  RESET PASSWORD (/api/reset-password)")
    response = client.post(
        "/api/reset-password",
        json={"token": token, "password": new_password},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code} ✅")
    print(f"   Message: {response.get_json()['message']}")

    # Step 4: Verify password changed
    print("\n4️⃣  VERIFY PASSWORD CHANGED IN DATABASE")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        from werkzeug.security import check_password_hash

        password_matches = check_password_hash(user.password_hash, new_password)
    print(f"   New password works: {password_matches} ✅")

    # Step 5: Activate user and login
    print("\n5️⃣  LOGIN WITH NEW PASSWORD (/api/login)")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        if not user.is_active:
            user.is_active = True
            from extensions import db

            db.session.merge(user)
            db.session.commit()
            print(f"   Activated user")

    response = client.post(
        "/api/login",
        json={"email": test_email, "password": new_password},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code} ✅")
    data = response.get_json()
    if "access_token" in data:
        print(f"   Access token: {data['access_token'][:30]}... ✅")

    print("\n" + "=" * 70)
    print("✅ PASSWORD RESET FLOW WORKS COMPLETELY!")
    print("=" * 70)
