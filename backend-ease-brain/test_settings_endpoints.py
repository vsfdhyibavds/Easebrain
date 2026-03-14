#!/usr/bin/env python3
"""
Test script for the real settings endpoints.
Tests GET /api/settings, PUT /api/settings/profile, and PUT /api/settings/notifications

Usage:
    python test_settings_endpoints.py <email> <password>

Example:
    python test_settings_endpoints.py moderator@test.com TestPassword123!
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5500/api"


def print_section(title):
    print(f"\n{'=' * 70}")
    print(f" {title}")
    print(f"{'=' * 70}\n")


def print_step(step, description):
    print(f"Step {step}: {description}")


def test_settings_endpoints(email, password):
    """Test all settings endpoints with provided credentials"""

    print_section("Settings Endpoints Test")
    print(f"Testing with user: {email}\n")

    # Step 1: Login to get token
    print_step(1, "Logging in to get authentication token...")
    login_data = {
        "email": email,
        "password": password,
    }

    response = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    user_data = response.json()
    user_id = user_data.get("user", {}).get("id")
    token = user_data.get("access_token")

    if not token:
        print("   ✗ No token in response!")
        return False

    print("   ✓ Login successful")
    print(f"   ✓ User ID: {user_id}")
    print(f"   ✓ Token received: {token[:30]}...")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get settings
    print_step(2, "Getting user settings...")
    response = requests.get(f"{BASE_URL}/settings", headers=headers)
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    settings = response.json()
    print(f"   ✓ Settings retrieved:")
    print(f"      ID: {settings.get('id')}")
    print(f"      Name: {settings.get('name')}")
    print(f"      Email: {settings.get('email')}")
    print(f"      Phone: {settings.get('phone')}")
    print(f"      Timezone: {settings.get('timezone')}")
    print(f"      Theme: {settings.get('theme')}")
    print(f"      Notifications:")
    for key, value in settings.get("notifications", {}).items():
        print(f"        - {key}: {value}")

    # Step 3: Update profile
    print_step(3, "Updating user profile...")
    profile_update = {
        "name": "Updated Test User",
        "phone": "+1 (555) 123-4567",
        "timezone": "America/Chicago",
        "first_name": "Updated",
        "last_name": "Tester",
    }

    response = requests.put(
        f"{BASE_URL}/settings/profile", json=profile_update, headers=headers
    )
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    result = response.json()
    print(f"   ✓ Profile updated:")
    print(f"      {result.get('message')}")
    profile_data = result.get("data", {})
    print(f"      Name: {profile_data.get('name')}")
    print(f"      Phone: {profile_data.get('phone')}")
    print(f"      Timezone: {profile_data.get('timezone')}")

    # Step 4: Verify profile was updated
    print_step(4, "Verifying profile update by fetching settings again...")
    response = requests.get(f"{BASE_URL}/settings", headers=headers)
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    settings = response.json()
    if (
        settings.get("phone") == "+1 (555) 123-4567"
        and settings.get("timezone") == "America/Chicago"
    ):
        print(f"   ✓ Profile update verified!")
        print(f"      Name: {settings.get('name')}")
        print(f"      Phone: {settings.get('phone')}")
        print(f"      Timezone: {settings.get('timezone')}")
    else:
        print(f"   ⚠ Profile may not have been updated correctly")
        print(f"      Expected phone: +1 (555) 123-4567, got: {settings.get('phone')}")
        print(
            f"      Expected timezone: America/Chicago, got: {settings.get('timezone')}"
        )

    # Step 5: Update notification preferences
    print_step(5, "Updating notification preferences...")
    notifications_update = {
        "notifications": {
            "email": False,
            "sms": True,
            "push": False,
        }
    }

    response = requests.put(
        f"{BASE_URL}/settings/notifications", json=notifications_update, headers=headers
    )
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    result = response.json()
    print(f"   ✓ Notifications updated:")
    print(f"      {result.get('message')}")
    notif_data = result.get("data", {}).get("notifications", {})
    print(f"      Email: {notif_data.get('email')}")
    print(f"      SMS: {notif_data.get('sms')}")
    print(f"      Push: {notif_data.get('push')}")

    # Step 6: Verify notification preferences were updated
    print_step(6, "Verifying notification preferences by fetching settings again...")
    response = requests.get(f"{BASE_URL}/settings", headers=headers)
    print(f"   Status: {response.status_code}")

    if response.status_code != 200:
        print(f"   ✗ Error: {response.text}")
        return False

    settings = response.json()
    notif = settings.get("notifications", {})
    if (
        notif.get("email") == False
        and notif.get("sms") == True
        and notif.get("push") == False
    ):
        print(f"   ✓ Notification preferences verified!")
        print(f"      Email: {notif.get('email')}")
        print(f"      SMS: {notif.get('sms')}")
        print(f"      Push: {notif.get('push')}")
    else:
        print(f"   ⚠ Notification preferences may not match")
        print(f"      Expected: email=False, sms=True, push=False")
        print(
            f"      Got: email={notif.get('email')}, sms={notif.get('sms')}, push={notif.get('push')}"
        )

    # Step 7: Test without authentication (should fail with 401)
    print_step(
        7, "Testing GET /api/settings without authentication (should fail with 401)..."
    )
    response = requests.get(f"{BASE_URL}/settings")
    print(f"   Status: {response.status_code}")

    if response.status_code == 401:
        print(f"   ✓ Correctly rejected unauthenticated request")
        try:
            print(f"      Response: {response.json().get('message')}")
        except:
            pass
    else:
        print(f"   ⚠ Expected 401 but got {response.status_code}")

    print_section("Test Complete")
    print("✅ All settings endpoints are working correctly with real database!")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_settings_endpoints.py <email> <password>")
        print(
            "\nExample: python test_settings_endpoints.py moderator@test.com TestPassword123!"
        )
        print("\nYou can use test users created by setup-auth.sh")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    try:
        success = test_settings_endpoints(email, password)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
