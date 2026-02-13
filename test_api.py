#!/usr/bin/env python3
"""Quick API test to verify endpoints are working."""

import requests
import json

BASE_URL = "http://localhost:5500/api"


def test_login():
    """Test login endpoint."""
    print("\n=== Testing Login ===")
    response = requests.post(
        f"{BASE_URL}/login",
        json={"email": "caregiver@test.com", "password": "CaregiverPass123!"},
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data.get("access_token")


def test_dependents(token):
    """Test dependents endpoint."""
    print("\n=== Testing Dependents GET ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/caregiver/dependents", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data.get("dependents", [])


def test_create_dependent(token):
    """Test creating a dependent."""
    print("\n=== Testing Dependents POST ===")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Test Patient",
        "date_of_birth": "1980-01-01",
        "medical_history": "Test medical history",
    }
    response = requests.post(
        f"{BASE_URL}/caregiver/dependents", json=payload, headers=headers
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data


if __name__ == "__main__":
    print("Testing EaseBrain API endpoints...")

    # Test login
    token = test_login()
    if not token:
        print("Failed to get token!")
        exit(1)

    # Test get dependents
    dependents = test_dependents(token)

    # Test create dependent
    # result = test_create_dependent(token)

    print("\n✓ API tests complete!")
