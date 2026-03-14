"""
Rate limiting configuration for API endpoints.
Prevents brute force attacks on authentication endpoints.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",  # Use in-memory storage (can upgrade to Redis for production)
)


def init_rate_limiting(app):
    """Initialize rate limiting for the Flask app"""
    limiter.init_app(app)

    # Log rate limiting configuration
    app.logger.info("✅ Rate limiting initialized")
    app.logger.info("   Default limits: 200/day, 50/hour")
    app.logger.info("   Auth endpoints: 5/minute, 20/hour")


# Custom rate limit decorators for specific endpoints
LOGIN_LIMITER = "5 per minute, 20 per hour"  # Prevent brute force
SIGNUP_LIMITER = "3 per minute, 10 per hour"  # Prevent spam signups
PASSWORD_RESET_LIMITER = "3 per minute, 10 per hour"  # Prevent spam
EMAIL_VERIFY_LIMITER = "10 per minute, 100 per hour"  # Reasonable for retries
