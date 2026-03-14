#!/usr/bin/env python3
"""Test moderation API endpoints"""

import requests
import json

BASE_URL = "http://127.0.0.1:5500/api"


def test_moderation_endpoints():
    """Test all moderation endpoints"""

    print("=" * 60)
    print("MODERATION ENDPOINTS TEST")
    print("=" * 60)

    # Test 1: Create test user (signup)
    print("\n1. Creating test user...")
    signup_data = {
        "username": "testmoderator",
        "email": "moderator@test.com",
        "password": "TestPassword123!",
        "firstName": "Test",
        "lastName": "Moderator",
    }

    signup_response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    print(f"   Status: {signup_response.status_code}")

    if signup_response.status_code in [200, 201]:
        user_data = signup_response.json()
        user_id = user_data.get("user_id") or user_data.get("id")
        token = user_data.get("token")
        print(f"   ✓ User created: {user_id}")
        print(f"   ✓ Token received: {token[:20]}...")
    else:
        print(f"   ✗ Error: {signup_response.text}")
        return

    # Test 2: Create a community
    print("\n2. Creating test community...")
    community_data = {
        "name": "Mental Health Support",
        "description": "A community for mental health support and discussion",
        "subject_area": "mental_health",
        "icon": "💚",
        "color": "#10b981",
    }

    headers = {"Authorization": f"Bearer {token}"}
    community_response = requests.post(
        f"{BASE_URL}/communities", json=community_data, headers=headers
    )
    print(f"   Status: {community_response.status_code}")

    if community_response.status_code in [200, 201]:
        community = community_response.json()
        community_id = community.get("id") or community.get("community_id")
        print(f"   ✓ Community created: {community_id}")
        print(
            f"   ✓ Community data: {json.dumps(community, indent=2, default=str)[:200]}..."
        )
    else:
        print(f"   ✗ Error: {community_response.text}")
        return

    # Test 3: Create a test post
    print("\n3. Creating test community post...")
    post_data = {
        "title": "My Mental Health Journey",
        "content": "I've been struggling with anxiety lately...",
        "trigger_warning": True,
        "trigger_warning_text": "Mental health, anxiety",
    }

    post_response = requests.post(
        f"{BASE_URL}/communities/{community_id}/posts", json=post_data, headers=headers
    )
    print(f"   Status: {post_response.status_code}")

    if post_response.status_code in [200, 201]:
        post = post_response.json()
        post_id = post.get("id") or post.get("post_id")
        print(f"   ✓ Post created: {post_id}")
    else:
        print(f"   ✗ Error: {post_response.text}")
        return

    # Test 4: Get pending posts (as moderator)
    print("\n4. Testing GET /moderation/{community_id}/posts/pending...")
    pending_response = requests.get(
        f"{BASE_URL}/moderation/{community_id}/posts/pending", headers=headers
    )
    print(f"   Status: {pending_response.status_code}")
    print(
        f"   Response: {json.dumps(pending_response.json(), indent=2, default=str)[:300]}..."
    )

    # Test 5: Get flagged posts
    print("\n5. Testing GET /moderation/{community_id}/posts/flagged...")
    flagged_response = requests.get(
        f"{BASE_URL}/moderation/{community_id}/posts/flagged", headers=headers
    )
    print(f"   Status: {flagged_response.status_code}")
    print(
        f"   Response: {json.dumps(flagged_response.json(), indent=2, default=str)[:300]}..."
    )

    # Test 6: Approve a post
    print(f"\n6. Testing POST /moderation/posts/{post_id}/approve...")
    approve_response = requests.post(
        f"{BASE_URL}/moderation/posts/{post_id}/approve",
        json={"approval_notes": "Post looks good"},
        headers=headers,
    )
    print(f"   Status: {approve_response.status_code}")
    print(f"   Response: {json.dumps(approve_response.json(), indent=2, default=str)}")

    # Test 7: Get community members
    print(f"\n7. Testing GET /moderation/{community_id}/members...")
    members_response = requests.get(
        f"{BASE_URL}/moderation/{community_id}/members", headers=headers
    )
    print(f"   Status: {members_response.status_code}")
    print(
        f"   Response: {json.dumps(members_response.json(), indent=2, default=str)[:300]}..."
    )

    # Test 8: Get moderation logs
    print(f"\n8. Testing GET /moderation/{community_id}/logs...")
    logs_response = requests.get(
        f"{BASE_URL}/moderation/{community_id}/logs", headers=headers
    )
    print(f"   Status: {logs_response.status_code}")
    print(
        f"   Response: {json.dumps(logs_response.json(), indent=2, default=str)[:300]}..."
    )

    # Test 9: Get moderation settings
    print(f"\n9. Testing GET /moderation/{community_id}/settings...")
    settings_response = requests.get(
        f"{BASE_URL}/moderation/{community_id}/settings", headers=headers
    )
    print(f"   Status: {settings_response.status_code}")
    print(
        f"   Response: {json.dumps(settings_response.json(), indent=2, default=str)[:300]}..."
    )

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    test_moderation_endpoints()
