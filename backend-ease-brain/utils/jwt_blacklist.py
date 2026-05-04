"""
JWT Token Blacklist for Revocation.
Implements token revocation so that users can log out and invalidate their tokens immediately.
Uses Redis for production, in-memory for development.
"""

import os
from datetime import datetime, timedelta
from flask_jwt_extended import get_jwt

# Check for Redis availability
try:
    import redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class TokenBlacklist:
    """Manages JWT token blacklist for revocation"""

    def __init__(self):
        self.use_redis = REDIS_AVAILABLE and os.environ.get("REDIS_URL")
        self.redis_client = None
        self.memory_blacklist = set()  # Fallback for development

        if self.use_redis:
            try:
                self.redis_client = redis.from_url(os.environ.get("REDIS_URL"))
                self.redis_client.ping()
            except Exception as e:
                print(f"⚠️  Redis connection failed: {e}. Using in-memory blacklist.")
                self.use_redis = False

    def add_token_to_blacklist(self, jti, expires_at):
        """
        Add a token to the blacklist.
        Args:
            jti: JWT ID (unique identifier for the token)
            expires_at: datetime when the token expires
        """
        if self.use_redis:
            # Calculate TTL: expire the blacklist entry when the token expires
            ttl = int((expires_at - datetime.utcnow()).total_seconds())
            if ttl > 0:
                self.redis_client.setex(f"blacklist:{jti}", ttl, "revoked")
        else:
            self.memory_blacklist.add(jti)

    def is_token_blacklisted(self, jti):
        """
        Check if a token is blacklisted.
        Args:
            jti: JWT ID to check
        Returns:
            True if blacklisted, False otherwise
        """
        if self.use_redis:
            return bool(self.redis_client.exists(f"blacklist:{jti}"))
        else:
            return jti in self.memory_blacklist

    def clear_memory_blacklist(self):
        """Clear in-memory blacklist (for testing)"""
        self.memory_blacklist.clear()


# Global blacklist instance
token_blacklist = TokenBlacklist()


def init_token_blacklist(app):
    """Initialize token blacklist and register revocation callback"""

    @app.before_request
    def check_token_revocation():
        """Check if current token is blacklisted"""
        # Only check for protected endpoints
        from flask_jwt_extended import verify_jwt_in_request
        from flask import request

        try:
            # Only check JWT-protected endpoints
            if request.endpoint and request.method != "OPTIONS":
                verify_jwt_in_request(optional=True)
                if get_jwt():
                    jti = get_jwt().get("jti")
                    if jti and token_blacklist.is_token_blacklisted(jti):
                        return {"message": "Token has been revoked"}, 401
        except Exception:
            # Not a JWT endpoint, continue
            pass


def revoke_token(jti, expires_at):
    """
    Revoke a JWT token immediately.
    Args:
        jti: JWT ID from the token
        expires_at: Token expiration time
    """
    token_blacklist.add_token_to_blacklist(jti, expires_at)
