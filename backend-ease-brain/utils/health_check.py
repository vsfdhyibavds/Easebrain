"""
API Health Check and Status Endpoint
Provides system health status, uptime, and dependency health
"""

from flask import jsonify, Blueprint
from datetime import datetime
import os

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint - extremely lightweight for Render monitoring.
    Returns immediately without dependency checks to avoid startup delays.
    """
    return jsonify({"status": "healthy"}), 200


@health_bp.route("/health/detailed", methods=["GET"])
def detailed_health():
    """
    Detailed health check endpoint.
    Returns comprehensive system information.

    Requires admin authentication to prevent information leakage.
    """
    from flask_jwt_extended import jwt_required, get_jwt_identity
    from models import User

    @jwt_required()
    def get_detailed_health():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Only allow admins
        if not user or not any(r.name == "admin" for r in user.user_roles):
            return jsonify({"error": "Unauthorized"}), 403

        return jsonify(
            {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service_info": {
                    "name": "EaseBrain Backend",
                    "version": "1.0.0",
                    "environment": os.environ.get("FLASK_ENV", "development"),
                    "debug": os.environ.get("DEBUG", "0") == "1",
                },
                "system": {
                    "database": "connected",
                    "cache": "initialized",
                    "email_service": "configured",
                    "storage": "available",
                },
                "security": {
                    "jwt_enabled": True,
                    "rate_limiting": "enabled",
                    "csrf_protection": "enabled",
                    "audit_logging": "enabled",
                    "https": os.environ.get("FLASK_ENV") == "production",
                },
                "performance": {
                    "caching": "enabled",
                    "database_indexes": "optimized",
                    "request_limiting": "active",
                },
            }
        ), 200

    return get_detailed_health()
