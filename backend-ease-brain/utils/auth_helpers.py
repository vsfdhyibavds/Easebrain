"""
Authentication and Authorization helper utilities for EaseBrain.
Provides decorators and utilities for role-based access control.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.user_role import UserRole
from models.role import Role


def get_user_roles(user_id):
    """
    Retrieve all active roles for a user.
    Returns: List of role names (e.g., ['therapist', 'admin'])
    """
    user_roles = UserRole.query.filter_by(user_id=user_id, is_active=True).all()
    return [ur.role.name for ur in user_roles]


def get_user_role_types(user_id):
    """
    Retrieve all active role types for a user.
    Returns: List of role_type values (e.g., ['caregiver', 'admin'])
    """
    user_roles = UserRole.query.filter_by(user_id=user_id, is_active=True).all()
    return [ur.role.role_type for ur in user_roles]


def user_has_role(user_id, role_name):
    """
    Check if a user has a specific role.
    Args:
        user_id: User ID
        role_name: Role name to check (e.g., 'therapist', 'admin')
    Returns: Boolean
    """
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return False

    user_role = UserRole.query.filter_by(
        user_id=user_id, role_id=role.id, is_active=True
    ).first()
    return user_role is not None


def user_has_role_type(user_id, role_type):
    """
    Check if a user has a role of a specific type.
    Args:
        user_id: User ID
        role_type: Role type to check (e.g., 'caregiver', 'admin')
    Returns: Boolean
    """
    user_role = (
        UserRole.query.join(Role)
        .filter(
            UserRole.user_id == user_id,
            Role.role_type == role_type,
            UserRole.is_active,
        )
        .first()
    )
    return user_role is not None


def user_is_admin(user_id):
    """Quick check if user is an admin."""
    return user_has_role_type(user_id, "admin")


def user_is_caregiver(user_id):
    """Quick check if user is a caregiver."""
    return user_has_role(user_id, "caregiver")


# ============================================================================
# DECORATORS FOR ROLE-BASED ACCESS CONTROL
# ============================================================================


def require_role(role_name):
    """
    Decorator to enforce a specific role requirement.
    Usage: @require_role('admin')
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({"message": "Unauthorized"}), 401

            if not user_has_role(user_id, role_name):
                return jsonify(
                    {"message": f"Forbidden: {role_name} role required"}
                ), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_role_type(role_type):
    """
    Decorator to enforce a role type requirement.
    Usage: @require_role_type('caregiver')
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({"message": "Unauthorized"}), 401

            if not user_has_role_type(user_id, role_type):
                return jsonify(
                    {"message": f"Forbidden: {role_type} role required"}
                ), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_any_role(*role_names):
    """
    Decorator to enforce that user has at least one of the specified roles.
    Usage: @require_any_role('admin', 'moderator')
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({"message": "Unauthorized"}), 401

            has_role = any(user_has_role(user_id, role) for role in role_names)
            if not has_role:
                return jsonify(
                    {"message": f"Forbidden: one of {role_names} role required"}
                ), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_admin(fn):
    """Shortcut decorator for admin-only endpoints."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        if not user_is_admin(user_id):
            return jsonify({"message": "Forbidden: admin role required"}), 403

        return fn(*args, **kwargs)

    return wrapper


def allow_self_or_admin(fn):
    """
    Decorator for endpoints that allow access if:
    1. User is accessing their own resource, OR
    2. User is an admin

    Expects a 'user_id' parameter in the route or request.
    Usage: @allow_self_or_admin
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"message": "Unauthorized"}), 401

        # Get the target user_id from kwargs or request
        target_user_id = kwargs.get("user_id")

        if not target_user_id:
            # Try to get from request body
            from flask import request

            target_user_id = (
                request.get_json().get("user_id") if request.is_json else None
            )

        # Allow if accessing own resource or is admin
        if int(current_user_id) == int(target_user_id) or user_is_admin(
            current_user_id
        ):
            return fn(*args, **kwargs)

        return jsonify({"message": "Forbidden"}), 403

    return wrapper


# ============================================================================
# PERMISSION CHECKING UTILITIES
# ============================================================================


def get_token_claims(token):
    """
    Extract and decode JWT claims from token.
    Useful for frontend to get user roles without extra API call.
    """
    try:
        jwt_data = get_jwt()
        return jwt_data
    except Exception:
        return {}


def create_claims_dict(user_id):
    """
    Create JWT claims dictionary for a user including their roles.
    Called during token creation to embed role info in JWT.
    """
    roles = get_user_roles(user_id)
    role_types = get_user_role_types(user_id)

    return {
        "user_id": user_id,
        "roles": roles,
        "role_types": role_types,
        "is_admin": "admin" in role_types,
        "is_caregiver": "caregiver" in role_types,
    }
