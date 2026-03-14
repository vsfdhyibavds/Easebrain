#!/usr/bin/env python
"""Test actual reset flow with URL-encoded token"""

import os
from dotenv import load_dotenv

load_dotenv()

from app import app
from models import User
from models.user_verification import UserVerification
import json
from urllib.parse import quote, unquote

test_email = "eugenewekesa748@gmail.com"

with app.test_client() as client:
    print("=" * 70)
    print("TESTING ACTUAL RESET FLOW")
    print("=" * 70)

    # Step 1: Request password reset
    print("\n1️⃣  REQUEST PASSWORD RESET")
    response = client.post(
        "/api/forgot-password",
        json={"email": test_email},
        content_type="application/json",
    )

    # Get token from database
    print("\n2️⃣ GET TOKEN")
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        token = verification.token
        token_url_encoded = quote(token, safe="")

        print(f"   Raw token: {token}")
        print(f"   URL encoded: {token_url_encoded}")
        print(f"   Same? {token == token_url_encoded}")

    # Step 3a: Try with raw token
    print("\n3️⃣ TRY RESET WITH RAW TOKEN")
    response = client.post(
        "/api/reset-password",
        json={"token": token, "password": "newSecurePassword123!"},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()}")

    # Reset token for next test
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        verification.is_verified = False
        from extensions import db

        db.session.commit()

    # Step 3b: Try with URL encoded token
    print("\n4️⃣ TRY RESET WITH URL ENCODED TOKEN")
    response = client.post(
        "/api/reset-password",
        json={"token": token_url_encoded, "password": "newSecurePassword123!"},
        content_type="application/json",
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.get_json()}")

    # Reset token for next test
    with app.app_context():
        user = User.query.filter_by(email=test_email).first()
        verification = UserVerification.query.filter_by(user_id=user.id).first()
        verification.is_verified = False
        db.session.commit()

    # Step 3c: Try with decoded token (in case it arrives encoded)
    print("\n5️⃣ CHECK IF TOKEN GENERATES SPECIAL CHARS")
    print(f"   Does token contain +? {'%2B' in token_url_encoded}")
    print(f"   Does token contain /? {'%2F' in token_url_encoded}")

    print("\n" + "=" * 70)
