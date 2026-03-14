#!/usr/bin/env python3
"""
Generate a fresh verification token for testing email verification.
Usage: python generate_verification_token.py <email>
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend-ease-brain"))

if len(sys.argv) < 2:
    print("Usage: python generate_verification_token.py <email>")
    sys.exit(1)

from app import app
from utils.utils import generate_token

email = sys.argv[1]

with app.app_context():
    token = generate_token(email)

    print(f"\n✅ Fresh verification token generated for: {email}")
    print("\n🔗 Verification URL:")
    print(f"   http://www.easebrain.live/api/verify/{token}")
    print("\n📋 Token expires in: 2 hours")
    print("\n💡 Token (valid until 2-hour expiry):")
    print(f"   {token}\n")
