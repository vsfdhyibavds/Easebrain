"""
CSRF (Cross-Site Request Forgery) Protection for Flask.
Implements token-based CSRF protection for state-changing operations.
"""

import secrets
from functools import wraps
from flask import request, jsonify, session, g
from datetime import timedelta


class CSRFProtector:
    """Manages CSRF token generation and validation"""

    def __init__(self, app=None, token_length=32):
        self.app = app
        self.token_length = token_length
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize CSRF protection for Flask app"""
        self.app = app
        # Configure session to support CSRF tokens
        app.config.setdefault(
            "SESSION_COOKIE_SECURE", False
        )  # Enable HTTPS in production
        app.config.setdefault("SESSION_COOKIE_HTTPONLY", True)
        app.config.setdefault("SESSION_COOKIE_SAMESITE", "Strict")

        app.before_request(self._before_request)
        app.logger.info("✅ CSRF Protection initialized")

    def _before_request(self):
        """Generate CSRF token and validate on state-changing requests"""
        # Generate token if not in session
        if "csrf_token" not in session:
            session["csrf_token"] = self._generate_token()
            session.permanent = True
            session.permanent_session_lifetime = timedelta(hours=24)

        # Store in g for easy access in templates/code
        g.csrf_token = session.get("csrf_token")

        # Enforce CSRF validation for state-changing requests
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Skip validation for exempt endpoints (e.g., /api/health, auth endpoints)
            endpoint = request.endpoint or ""
            view_fn = None
            try:
                view_fn = request.app.view_functions.get(endpoint)
            except Exception:
                view_fn = None

            if (
                (view_fn is not None and getattr(view_fn, "csrf_exempt", False))
                or endpoint.endswith("loginresource")
                or endpoint.endswith("signupresource")
                or endpoint.endswith("resendverificationemailresource")
                or endpoint.endswith("passwordresetresource")
                or endpoint.endswith("passwordresetconfirmresource")
                or endpoint.endswith("emailverificationresource")
                or endpoint in ("settings.update_profile", "settings.update_notifications", "settings.update_theme")
            ):
                return

            # Debug logging to help diagnose unexpected 403s
            try:
                app_logger = self.app.logger if self.app else None
                if app_logger and app_logger.isEnabledFor(10):  # DEBUG
                    app_logger.debug(
                        f"CSRF check: endpoint={endpoint} view_fn={view_fn} csrf_exempt={getattr(view_fn, 'csrf_exempt', False)}"
                    )
            except Exception:
                pass

            # Get token from multiple possible sources
            token = (
                request.headers.get("X-CSRF-Token")
                or request.headers.get("X-CSRFToken")
                or request.form.get("csrf_token")
            )

            # Try to get from JSON body if not in headers/form
            if not token and request.is_json:
                try:
                    data = request.get_json(silent=True)
                    if data:
                        token = data.get("csrf_token")
                except Exception:
                    pass

            # Validate token
            if not token or not self.validate_token(token):
                try:
                    app_logger = self.app.logger if self.app else None
                    if app_logger and app_logger.isEnabledFor(10):
                        app_logger.debug(
                            f"CSRF token missing/invalid. token_present={bool(token)} stored_token_present={bool(session.get('csrf_token'))}"
                        )
                except Exception:
                    pass
                return (
                    jsonify(
                        {
                            "message": "CSRF token validation failed. Please refresh and try again.",
                            "error": "csrf_validation_failed",
                        }
                    ),
                    403,
                )

    @staticmethod
    def _generate_token():
        """Generate cryptographically secure CSRF token"""
        return secrets.token_urlsafe(32)

    def get_token(self):
        """Get current CSRF token"""
        return session.get("csrf_token")

    def validate_token(self, token):
        """Validate CSRF token"""
        stored_token = session.get("csrf_token")
        if not stored_token or not token:
            return False
        # Use constant-time comparison to prevent timing attacks
        return secrets.compare_digest(stored_token, token)


# Create global CSRF protector instance
csrf = CSRFProtector()


def csrf_exempt(f):
    """Decorator to exempt endpoint from CSRF protection (use sparingly)"""
    f.csrf_exempt = True
    return f


def require_csrf_token(f):
    """
    Decorator to require CSRF token on state-changing requests.
    Token can be provided via:
    1. X-CSRF-Token header
    2. csrf_token form field
    3. X-CSRFToken header (common in JS frameworks)
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip CSRF validation for safe methods
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return f(*args, **kwargs)

        # Skip if endpoint is marked as exempt
        if getattr(f, "csrf_exempt", False):
            return f(*args, **kwargs)

        # Get token from multiple possible sources
        token = (
            request.headers.get("X-CSRF-Token")
            or request.headers.get("X-CSRFToken")
            or request.form.get("csrf_token")
            or request.get_json(silent=True, force=False).get("csrf_token")
            if request.is_json
            else None
        )

        # Validate token
        if not token or not csrf.validate_token(token):
            return (
                jsonify(
                    {
                        "message": "CSRF token validation failed. Please refresh and try again.",
                        "error": "csrf_validation_failed",
                    }
                ),
                403,
            )

        return f(*args, **kwargs)

    return decorated_function


def get_csrf_token():
    """Get CSRF token for use in frontend"""
    return g.get("csrf_token", "")
