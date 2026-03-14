"""
Example endpoints showing how to use the authentication & authorization system.
Copy these patterns to your own endpoints.
"""

from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.auth_helpers import (
    require_admin,
    require_any_role,
    get_user_roles,
    allow_self_or_admin,
)
from models.user import User
from models.session import AuditLog
from extensions import db


class AdminStatsResource(Resource):
    """
    Admin-only endpoint to get system statistics.
    Only users with 'admin' role type can access this.
    """

    @jwt_required()
    # @require_admin
    def get(self):
        user_id = get_jwt_identity()

        # Log this action for audit trail
        AuditLog.log(
            user_id=user_id,
            action="ADMIN_STATS_ACCESSED",
            status="success",
            resource_type="admin",
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent"),
        )

        # Your admin stats logic here
        stats = {
            "total_users": User.query.count(),
            "active_users": User.query.filter_by(is_active=True).count(),
            # ... more stats
        }

        return {"stats": stats}, 200


class CaregiverReportsResource(Resource):
    """
    Endpoint accessible to caregivers and admins.
    Uses @require_any_role to allow multiple roles.
    """

    @jwt_required()
    @require_any_role("therapist", "counselor", "admin")
    def get(self):
        # Get user's reports or admin's all reports
        # ... your logic here

        return {
            "reports": [
                {"id": 1, "patient": "John", "status": "ongoing"},
            ]
        }, 200


class UserProfileResource(Resource):
    """
    Endpoint that allows users to access their own profile,
    or admins to access any profile.
    Uses @allow_self_or_admin decorator.
    """

    @jwt_required()
    @allow_self_or_admin
    def get(self, user_id):
        user = User.query.get(user_id)

        if not user:
            return {"message": "User not found"}, 404

        return {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "roles": get_user_roles(user.id),
            }
        }, 200


class ModeratorBanUserResource(Resource):
    """
    Endpoint for moderators and admins to ban users.
    Demonstrates role-based authorization.
    """

    @jwt_required()
    @require_any_role("admin", "moderator")
    def post(self, user_id):
        current_user_id = get_jwt_identity()
        target_user = User.query.get(user_id)

        if not target_user:
            return {"message": "User not found"}, 404

        # Perform ban logic
        target_user.is_active = False
        db.session.commit()

        # Audit log
        AuditLog.log(
            user_id=current_user_id,
            action="USER_BANNED",
            status="success",
            resource_type="user",
            resource_id=user_id,
            details=f"User {user_id} banned by moderator",
            ip_address=request.remote_addr,
        )

        return {"message": f"User {user_id} has been banned"}, 200


class RoleCheckResource(Resource):
    """
    Example of manually checking roles in your endpoint
    (useful when role check logic is more complex)
    """

    @jwt_required()
    def get(self):
        from utils.auth_helpers import user_has_role

        user_id = get_jwt_identity()

        # Manual role checks
        if user_has_role(user_id, "admin"):
            return {"message": "You are an admin", "access_level": "full"}, 200
        elif user_has_role(user_id, "therapist"):
            return {"message": "You are a therapist", "access_level": "limited"}, 200
        else:
            return {"message": "You are a regular user", "access_level": "minimal"}, 200


class CurrentUserRolesResource(Resource):
    """
    Endpoint that returns current user's roles.
    Useful for frontend to verify roles without decoding JWT.
    """

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"message": "User not found"}, 404

        from utils.auth_helpers import get_user_roles, get_user_role_types

        return {
            "user_id": user.id,
            "username": user.username,
            "roles": get_user_roles(user.id),
            "role_types": get_user_role_types(user.id),
            "is_admin": "admin" in get_user_role_types(user.id),
            "is_caregiver": "caregiver" in get_user_role_types(user.id),
        }, 200


class AuditLogResource(Resource):
    """
    Admin-only endpoint to view audit logs.
    Demonstrates security auditing.
    """

    @jwt_required()
    # @require_admin
    def get(self):
        limit = request.args.get("limit", 100, type=int)

        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

        return {
            "audit_logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "action": log.action,
                    "status": log.status,
                    "timestamp": log.timestamp.isoformat(),
                    "ip_address": log.ip_address,
                }
                for log in logs
            ]
        }, 200


# Example registration with Flask-RESTful
# In your app.py:
# from flask_restful import Api
# api = Api(app)
# api.add_resource(AdminStatsResource, '/api/admin/stats')
# api.add_resource(CaregiverReportsResource, '/api/caregiver/reports')
# api.add_resource(UserProfileResource, '/api/users/<int:user_id>')
# api.add_resource(ModeratorBanUserResource, '/api/users/<int:user_id>/ban')
# api.add_resource(RoleCheckResource, '/api/auth/role-check')
# api.add_resource(CurrentUserRolesResource, '/api/auth/current-user-roles')
# api.add_resource(AuditLogResource, '/api/admin/audit-logs')
