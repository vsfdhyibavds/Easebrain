#!/usr/bin/env python
"""Check email verification status"""

import os
from dotenv import load_dotenv

load_dotenv()

from app import app
from models import User
from models.user_verification import UserVerification
from datetime import datetime


def check_verification(email):
    with app.app_context():
        user = User.query.filter_by(email=email).first()

        if not user:
            print(f"❌ User not found: {email}")
            return

        print(f"✅ User found: {user.email}")
        print(f"   User ID: {user.id}")
        print(f"   Password set: {bool(user.password_hash)}")

        verification = UserVerification.query.filter_by(user_id=user.id).first()

        if not verification:
            print(f"❌ No verification record found")
            return

        print(f"✅ Verification record found:")
        print(f"   Verified: {verification.is_verified}")
        print(f"   Token: {verification.token[:20]}...")
        print(f"   Created: {verification.created_at}")
        print(f"   Expires: {verification.expires_at}")
        is_expired = verification.expires_at < datetime.utcnow()
        print(f"   Expired: {is_expired}")


if __name__ == "__main__":
    check_verification("eugenewekesa748@gmail.com")
