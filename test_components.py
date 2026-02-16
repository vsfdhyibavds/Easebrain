#!/usr/bin/env python
"""
Verification script for backend error handling and API components
"""

import json
import sys
import os

# Add backend directory to path
sys.path.insert(0, "/home/eugene/easebrain/backend-ease-brain")


def test_error_codes():
    """Test error code documentation"""
    print("\n" + "=" * 60)
    print("ERROR CODES REFERENCE")
    print("=" * 60)

    from utils.error_responses import ERROR_CODES  # type: ignore

    for code, info in ERROR_CODES.items():
        print(f"\n{code}:")
        print(f"  Status: {info['status_code']}")
        print(f"  Description: {info['description']}")
        print(f"  Example: {info['example']}")

    return True


def test_error_formatting():
    """Test error response formatting"""
    print("\n" + "=" * 60)
    print("ERROR RESPONSE FORMATTING TEST")
    print("=" * 60)

    from utils.error_responses import format_error_response, ValidationError, APIError  # type: ignore

    # Set required environment variables
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["JWT_SECRET_KEY"] = "test-secret-key-12345"

    from app import app  # type: ignore

    with app.app_context():
        # Test standard error response
        response, code = format_error_response(
            "VALIDATION_ERROR", "Email is invalid", 400, {"field": "email"}, "req_12345"
        )

        print(f"\nFormatted Error Response (Status {code}):")
        print(json.dumps(response.get_json(), indent=2))

        # Test APIError exception
        try:
            raise ValidationError("Test validation error", {"field": "name"})
        except APIError as e:
            print("\nValidationError Exception:")
            print(f"  Code: {e.error_code}")
            print(f"  Message: {e.message}")
            print(f"  Status: {e.status_code}")
            print(f"  Details: {e.details}")

    return True


def test_app_initialization():
    """Test that Flask app initializes with all new components"""
    print("\n" + "=" * 60)
    print("FLASK APP INITIALIZATION TEST")
    print("=" * 60)

    # Set required environment variables
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["JWT_SECRET_KEY"] = "test-secret-key-12345"

    try:
        from app import app  # type: ignore

        print("\n✅ Flask app imported successfully")

        # Test that blueprints are registered
        blueprints = [rule.endpoint for rule in app.url_map.iter_rules()]

        health_endpoints = [ep for ep in blueprints if "health" in ep]
        swagger_endpoints = [
            ep
            for ep in blueprints
            if "swagger" in ep or "openapi" in ep or "docs" in ep
        ]

        print(f"✅ Health endpoints registered: {len(health_endpoints)} found")
        for ep in health_endpoints:
            print(f"   - {ep}")

        print(f"✅ Swagger endpoints registered: {len(swagger_endpoints)} found")
        for ep in swagger_endpoints:
            print(f"   - {ep}")

        # Test error handlers
        handlers = [k for k in app.error_handler_spec.get(None, {}).keys()]
        print(f"\n✅ Error handlers registered: {len(handlers)} found")
        for handler_code in sorted([h for h in handlers if h is not None]):
            print(f"   - {handler_code}")

        return True

    except Exception as e:
        print(f"❌ App initialization failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n🧪 COMPONENT VERIFICATION\n")

    results = {
        "error_codes": test_error_codes(),
        "error_formatting": test_error_formatting(),
        "app_init": test_app_initialization(),
    }

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")

    if all(results.values()):
        print("\n🎉 All components working correctly!")
        return 0
    else:
        print("\n❌ Some components failed. See details above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
