#!/usr/bin/env python3
"""Quick API test to verify all endpoints are working."""

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


def test_dependents_get(token):
    """Test GET dependents endpoint."""
    print("\n=== Testing Dependents GET ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/caregiver/dependents", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data.get("dependents", [])


def test_dependents_put(token, dependent_id):
    """Test PUT (update) dependent endpoint."""
    print("\n=== Testing Dependents PUT (Update) ===")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Updated Patient Name",
        "date_of_birth": "1975-01-01",
        "medical_history": "Updated medical history",
    }
    response = requests.put(
        f"{BASE_URL}/caregiver/dependents/{dependent_id}", json=payload, headers=headers
    )
    print(f"Status: {response.status_code}")
    if response.text:
        data = response.json()
        print(json.dumps(data, indent=2))
    return response


def test_dependents_delete(token, dependent_id):
    """Test DELETE dependent endpoint."""
    print("\n=== Testing Dependents DELETE ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(
        f"{BASE_URL}/caregiver/dependents/{dependent_id}", headers=headers
    )
    print(f"Status: {response.status_code}")
    if response.text:
        data = response.json()
        print(json.dumps(data, indent=2))
    return response


if __name__ == "__main__":
    print("Testing EaseBrain API endpoints...")

    # Test login
    token = test_login()
    if not token:
        print("Failed to get token!")
        exit(1)

    # Test get dependents
    dependents = test_dependents_get(token)

    # Test update and delete if we have dependents
    if dependents:
        dependent_id = dependents[0]["id"]
        test_dependents_put(token, dependent_id)
        # Note: Uncomment to test delete (it will soft-delete the dependent)
        # test_dependents_delete(token, dependent_id)

    print("\n✓ API tests complete!")
