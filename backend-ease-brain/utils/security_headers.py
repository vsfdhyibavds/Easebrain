"""
Security Headers Configuration for Flask.
Implements industry best-practice HTTP security headers to protect against
common web vulnerabilities.
"""

import os
from flask import request


def init_security_headers(app):
    """Initialize security headers for the Flask application"""

    @app.after_request
    def set_security_headers(response):
        """Add security headers to all responses"""

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS protection (deprecated but still useful for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # HSTS (HTTP Strict Transport Security) - force HTTPS
        if os.environ.get("FLASK_ENV") == "production":
            # max-age: 1 year in seconds, includeSubDomains, preload
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # Content Security Policy (CSP)
        # SECURITY: Adjust these directives based on your application's needs
        csp_directives = {
            "default-src": ["'self'"],  # Default: only allow same-origin
            "script-src": ["'self'", "'unsafe-inline'"],  # Allow scripts from same-origin and inline (adjust as needed)
            "style-src": ["'self'", "'unsafe-inline'"],  # Allow styles from same-origin and inline
            "img-src": ["'self'", "data:", "https:"],  # Allow images from same-origin, data URIs, and HTTPS
            "font-src": ["'self'", "data:"],  # Allow fonts from same-origin and data URIs
            "connect-src": ["'self'"],  # Allow XHR/WebSocket connections to same-origin
            "frame-ancestors": ["'none'"],  # Prevent embedding in frames
            "base-uri": ["'self'"],  # Restrict base URL
            "form-action": ["'self'"],  # Restrict form submission
        }

        # Allow frontend domain in production
        frontend_url = os.environ.get("FRONTEND_URL", "")
        if frontend_url and os.environ.get("FLASK_ENV") == "production":
            frontend_domain = frontend_url.replace("https://", "").replace("http://", "").split("/")[0]
            csp_directives["default-src"] = ["'self'", frontend_domain]
            csp_directives["connect-src"] = ["'self'", frontend_domain]

        csp_header = "; ".join(
            f"{key} {' '.join(values)}" for key, values in csp_directives.items()
        )
        response.headers["Content-Security-Policy"] = csp_header

        # Referrer Policy - control how much referrer information is shared
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (formerly Feature Policy)
        # SECURITY: Restrict access to sensitive browser features
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
            "magnetometer=(), microphone=(), payment=(), usb=()"
        )

        # Cache control for sensitive endpoints
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response

    app.logger.info("✅ Security headers initialized")
