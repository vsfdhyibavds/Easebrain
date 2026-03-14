#!/usr/bin/env python3
"""
Email sending diagnostic script for EaseBrain backend.
This script helps identify and fix email delivery issues.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def check_sendgrid_config():
    """Check SendGrid configuration and provide diagnostics."""
    print("=" * 60)
    print("EMAIL SENDING DIAGNOSTIC")
    print("=" * 60)

    api_key = os.getenv("SENDGRID_API_KEY", "")
    sender_email = os.getenv("SENDER_EMAIL", "")

    print(f"\n1. SENDGRID_API_KEY: {'✓ SET' if api_key else '✗ NOT SET'}")
    if api_key:
        if api_key.startswith("SG_"):
            print("   ✓ Valid: This is a Mail API key (SG_ prefix)")
        elif api_key.startswith("SK_"):
            print("   ✗ ERROR: This is a Service Account key (SK_ prefix)")
            print("   → Service Account keys CANNOT send emails!")
            print(
                "   → Generate a Mail API key at: https://app.sendgrid.com/settings/api_keys"
            )
            print("   → Mail API keys should start with 'SG_'")
        else:
            print(f"   ? Unknown format (starts with: {api_key[:3]}...)")
            print("   → Mail API keys should start with 'SG_'")

    print(f"\n2. SENDER_EMAIL: {'✓ SET' if sender_email else '✗ NOT SET'}")
    if sender_email:
        print(f"   Email: {sender_email}")
        if "@gmail.com" in sender_email.lower():
            print("   ⚠ WARNING: Using Gmail address")
            print("   → SendGrid may block emails from unverified Gmail addresses")
            print("   → Consider using a domain you own and verify in SendGrid")
            print(
                "   → Alternative: Use SendGrid's Single Sender Verification for Gmail"
            )

    print("\n3. SENDGRID LIBRARY:")
    try:
        import sendgrid

        print(f"   ✓ Installed: version {sendgrid.__version__}")
    except ImportError:
        print("   ✗ NOT INSTALLED")
        print("   → Install with: pip install sendgrid")

    print("\n4. RECOMMENDATIONS:")
    if api_key and api_key.startswith("SK_"):
        print("   ✗ CRITICAL: Replace Service Account key with Mail API key")
        print("   1. Go to: https://app.sendgrid.com/settings/api_keys")
        print("   2. Click 'Create API Key'")
        print("   3. Name it (e.g., 'EaseBrain Production')")
        print("   4. Grant 'Full Access' or 'Mail Send' permission")
        print("   5. Copy the key (starts with SG_)")
        print("   6. Update SENDGRID_API_KEY in your .env file")
    elif api_key and api_key.startswith("SG_"):
        print("   ✓ API Key format is correct")
    else:
        print("   ✗ No valid API key found")

    if sender_email and "@gmail.com" in sender_email.lower():
        print("\n   ⚠ For Gmail sender addresses:")
        print("   1. Verify your Gmail in SendGrid Single Sender Verification:")
        print("      https://app.sendgrid.com/settings/sender_auth/senders/new")
        print("   2. OR use a domain you own and add domain authentication")
        print("   3. OR set ALLOW_UNVERIFIED_SENDER=true (not recommended)")

    print("\n5. TEST EMAIL SEND:")
    print("   After fixing the above, run:")
    print("   python test_sendgrid.py")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    check_sendgrid_config()
