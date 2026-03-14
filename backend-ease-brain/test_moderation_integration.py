#!/usr/bin/env python3
"""
Comprehensive test for Moderation API Integration
Tests JWT authentication and all moderation endpoints
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5500/api"


class ModerationAPITester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.community_id = None
        self.post_id = None
        self.test_user_id = None

    def print_header(self, text):
        print(f"\n{'=' * 60}")
        print(f"  {text}")
        print(f"{'=' * 60}\n")

    def print_step(self, num, text):
        print(f"  [{num}] {text}")

    def print_result(self, status, message):
        icon = "✓" if status else "✗"
        print(f"      {icon} {message}")

    def print_response(self, response, truncate=200):
        """Print JSON response, truncated if needed"""
        try:
            data = response.json()
            text = json.dumps(data, indent=2, default=str)
            if len(text) > truncate:
                print(f"      {text[:truncate]}...")
            else:
                print(f"      {text}")
        except (json.JSONDecodeError, ValueError):
            print(f"      {response.text[:truncate]}")

    # ==================== AUTHENTICATION ====================
    def test_signup(self):
        """Test user signup and token generation"""
        self.print_step(1, "Testing Signup (Create test user)")

        signup_data = {
            "username": "moderator_integration_test",
            "email": f"mod_test_{int(__import__('time').time())}@test.com",
            "password": "TestPassword123!",
            "firstName": "Mod",
            "lastName": "Tester",
        }

        try:
            response = requests.post(f"{BASE_URL}/signup", json=signup_data, timeout=5)
            print(f"      Status: {response.status_code}")

            if response.status_code in [200, 201]:
                data = response.json()
                self.user_id = data.get("user_id") or data.get("id")
                self.token = data.get("access_token") or data.get("token")

                self.print_result(True, f"User created: ID={self.user_id}")
                self.print_result(True, f"Token received: {self.token[:30]}...")
                return True
            else:
                self.print_result(False, f"Signup failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_jwt_token_validation(self):
        """Test that JWT token is correctly used in API calls"""
        self.print_step(2, "Testing JWT Token Validation")

        if not self.token:
            self.print_result(False, "No token available")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            # Test with valid token
            response = requests.get(f"{BASE_URL}/me", headers=headers, timeout=5)
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                self.print_result(True, "Valid token accepted")
            else:
                self.print_result(
                    False, f"Token validation failed: {response.status_code}"
                )
                self.print_response(response)
                return False

            # Test without token
            response = requests.get(f"{BASE_URL}/moderation/1/posts/pending", timeout=5)
            if response.status_code == 401:
                self.print_result(True, "Unauthorized access rejected (no token)")
                return True
            else:
                self.print_result(
                    False, f"Should reject without token, got {response.status_code}"
                )
                return False

        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    # ==================== COMMUNITY & POST SETUP ====================
    def test_create_community(self):
        """Create a test community"""
        self.print_step(3, "Creating Test Community")

        if not self.token:
            self.print_result(False, "No token available")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}
        community_data = {
            "name": "Integration Test Community",
            "description": "For testing moderation endpoints",
            "subject_area": "mental_health",
            "icon": "🧠",
            "color": "#10b981",
        }

        try:
            response = requests.post(
                f"{BASE_URL}/communities",
                json=community_data,
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code in [200, 201]:
                data = response.json()
                self.community_id = data.get("id") or data.get("community_id")
                self.print_result(True, f"Community created: ID={self.community_id}")
                return True
            else:
                self.print_result(False, f"Creation failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_create_post(self):
        """Create a test post"""
        self.print_step(4, "Creating Test Post")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}
        post_data = {
            "title": "Integration Test Post",
            "content": "Testing moderation workflow",
            "post_type": "discussion",
            "has_trigger_warning": False,
            "is_anonymous": False,
        }

        try:
            response = requests.post(
                f"{BASE_URL}/community/{self.community_id}/posts",
                json=post_data,
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code in [200, 201]:
                data = response.json()
                self.post_id = data.get("id") or data.get("post_id")
                self.print_result(True, f"Post created: ID={self.post_id}")
                return True
            else:
                self.print_result(False, f"Creation failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    # ==================== MODERATION ENDPOINTS ====================
    def test_get_pending_posts(self):
        """Test GET /moderation/<community_id>/posts/pending"""
        self.print_step(5, "Testing GET /moderation/{community_id}/posts/pending")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(
                f"{BASE_URL}/moderation/{self.community_id}/posts/pending",
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                self.print_result(
                    True, f"Got pending posts: {len(data.get('posts', []))} posts"
                )
                return True
            else:
                self.print_result(False, f"Request failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_get_flagged_posts(self):
        """Test GET /moderation/<community_id>/posts/flagged"""
        self.print_step(6, "Testing GET /moderation/{community_id}/posts/flagged")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(
                f"{BASE_URL}/moderation/{self.community_id}/posts/flagged",
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                self.print_result(
                    True, f"Got flagged posts: {len(data.get('posts', []))} posts"
                )
                return True
            else:
                self.print_result(False, f"Request failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_get_community_members(self):
        """Test GET /moderation/<community_id>/members"""
        self.print_step(7, "Testing GET /moderation/{community_id}/members")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(
                f"{BASE_URL}/moderation/{self.community_id}/members",
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                members = data.get("members", [])
                self.print_result(True, f"Got members: {len(members)} members")
                if members:
                    self.test_user_id = members[0].get("user_id") or members[0].get(
                        "id"
                    )
                return True
            else:
                self.print_result(False, f"Request failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_get_moderation_logs(self):
        """Test GET /moderation/<community_id>/logs"""
        self.print_step(8, "Testing GET /moderation/{community_id}/logs")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(
                f"{BASE_URL}/moderation/{self.community_id}/logs",
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                logs = data.get("logs", [])
                self.print_result(True, f"Got logs: {len(logs)} entries")
                return True
            else:
                self.print_result(False, f"Request failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def test_get_moderation_settings(self):
        """Test GET /moderation/<community_id>/settings"""
        self.print_step(9, "Testing GET /moderation/{community_id}/settings")

        if not self.token or not self.community_id:
            self.print_result(False, "Missing token or community ID")
            return False

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(
                f"{BASE_URL}/moderation/{self.community_id}/settings",
                headers=headers,
                timeout=5,
            )
            print(f"      Status: {response.status_code}")

            if response.status_code == 200:
                self.print_result(True, "Settings retrieved successfully")
                return True
            else:
                self.print_result(False, f"Request failed: {response.status_code}")
                self.print_response(response)
                return False
        except Exception as e:
            self.print_result(False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        self.print_header("MODERATION API INTEGRATION TEST SUITE")

        results = []

        # Authentication tests
        results.append(("Signup & Token", self.test_signup()))
        results.append(("JWT Validation", self.test_jwt_token_validation()))

        # Setup tests
        results.append(("Create Community", self.test_create_community()))
        results.append(("Create Post", self.test_create_post()))

        # Moderation endpoint tests
        results.append(("Get Pending Posts", self.test_get_pending_posts()))
        results.append(("Get Flagged Posts", self.test_get_flagged_posts()))
        results.append(("Get Community Members", self.test_get_community_members()))
        results.append(("Get Moderation Logs", self.test_get_moderation_logs()))
        results.append(("Get Moderation Settings", self.test_get_moderation_settings()))

        # Summary
        self.print_header("TEST SUMMARY")
        passed = sum(1 for _, result in results if result)
        total = len(results)

        for name, result in results:
            icon = "✓" if result else "✗"
            print(f"  {icon} {name}")

        print(f"\n  Passed: {passed}/{total}")

        if passed == total:
            print("\n  🎉 ALL TESTS PASSED!")
            return 0
        else:
            print(f"\n  ⚠️  {total - passed} test(s) failed")
            return 1


if __name__ == "__main__":
    tester = ModerationAPITester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
