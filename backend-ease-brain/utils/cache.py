"""
API response caching for performance optimization.
Implements efficient caching strategies for read-heavy endpoints.
"""

from functools import wraps
from flask import request
from datetime import datetime, timedelta
import hashlib
import json


class CacheStore:
    """Simple in-memory cache store (can be upgraded to Redis)"""

    def __init__(self):
        self.cache = {}
        self.timestamps = {}

    def get(self, key):
        """Get cached value if not expired"""
        if key not in self.cache:
            return None

        # Check if expired
        if key in self.timestamps:
            if datetime.utcnow() > self.timestamps[key]:
                # Expired, remove it
                del self.cache[key]
                del self.timestamps[key]
                return None

        return self.cache[key]

    def set(self, key, value, ttl_seconds=300):
        """Set cache value with TTL"""
        self.cache[key] = value
        self.timestamps[key] = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def delete(self, key):
        """Delete cache entry"""
        self.cache.pop(key, None)
        self.timestamps.pop(key, None)

    def clear(self):
        """Clear all cache"""
        self.cache.clear()
        self.timestamps.clear()


# Global cache instances
api_cache = CacheStore()
dashboard_cache = CacheStore()


def generate_cache_key(prefix, *args, **kwargs):
    """Generate consistent cache key from function args and kwargs"""
    key_data = f"{prefix}:{json.dumps(str(args) + str(kwargs), sort_keys=True)}"
    return hashlib.md5(key_data.encode()).hexdigest()


def cached_response(ttl_seconds=300, cache_store=None):
    """
    Decorator to cache API responses.

    Usage:
        @app.route('/api/users')
        @cached_response(ttl_seconds=600)  # Cache for 10 minutes
        def get_users():
            return jsonify(users)
    """
    if cache_store is None:
        cache_store = api_cache

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Only cache GET requests
            if request.method != "GET":
                return f(*args, **kwargs)

            # Skip cache if ?no_cache=true query param
            if request.args.get("no_cache") == "true":
                return f(*args, **kwargs)

            # Generate cache key including user_id (if authenticated)
            user_id = getattr(request, "user_id", "anonymous")
            cache_key = generate_cache_key(
                f"{f.__name__}:{user_id}",
                request.path,
                request.query_string.decode(),
            )

            # Try to get from cache
            cached_value = cache_store.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Execute function and cache result
            result = f(*args, **kwargs)

            # Only cache successful responses
            if isinstance(result, tuple):
                status_code = result[1] if len(result) > 1 else 200
                if status_code == 200:
                    cache_store.set(cache_key, result, ttl_seconds)
            else:
                cache_store.set(cache_key, result, ttl_seconds)

            return result

        return decorated_function

    return decorator


def invalidate_cache_pattern(pattern):
    """Invalidate all cache entries matching pattern"""
    keys_to_delete = [key for key in api_cache.cache.keys() if pattern in key]
    for key in keys_to_delete:
        api_cache.delete(key)


def invalidate_user_cache(user_id):
    """Invalidate all cache for a specific user"""
    invalidate_cache_pattern(f":{user_id}")


class CacheInvalidator:
    """Context manager for cache invalidation on write operations"""

    def __init__(self, patterns):
        """
        Initialize with patterns to invalidate.

        Usage:
            with CacheInvalidator(["dashboard", "users"]):
                # Create/update/delete operations
                user.save()
        """
        self.patterns = patterns if isinstance(patterns, list) else [patterns]

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Invalidate cache on successful exit (no exception)
        if exc_type is None:
            for pattern in self.patterns:
                invalidate_cache_pattern(pattern)


# Cache configuration constants
CACHE_DURATIONS = {
    "STATS": 600,  # 10 minutes - dashboard stats
    "USER_DATA": 300,  # 5 minutes - user profile
    "COMMUNITY": 900,  # 15 minutes - community lists
    "SEARCH": 300,  # 5 minutes - search results
    "REMINDERS": 180,  # 3 minutes - frequently changing
}
