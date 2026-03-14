import os
import re
import logging
from flask import Blueprint, request, jsonify, redirect, make_response
from models import User
from resources.serializers import serialize_user
from extensions import db
from utils.utils import send_verification_email, generate_token, verify_token
from utils.audit_logger import log_auth_event
from utils.rate_limiter import (
    limiter,
    LOGIN_LIMITER,
    SIGNUP_LIMITER,
    PASSWORD_RESET_LIMITER,
)
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)

# Constants
MIN_PASSWORD_LENGTH = 8
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


def validate_email(email):
    """Validate email format."""
    return re.match(EMAIL_REGEX, email) is not None


def validate_password(password):
    """Validate password meets minimum requirements."""
    return len(password) >= MIN_PASSWORD_LENGTH


def get_request_json():
    """Safely get JSON from request, return None if invalid."""
    try:
        return request.get_json(force=False, silent=False)
    except Exception as e:
        logger.warning(f"Invalid JSON in request: {str(e)}")
        return None


# ✅ Signup Route
@auth_bp.route("/signup", methods=["POST"])
@limiter.limit(SIGNUP_LIMITER)
def signup():
    data = get_request_json()
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request body. Expected JSON."}
        ), 400

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    # Validate inputs
    if not email or not password:
        return jsonify(
            {"success": False, "message": "Email and password are required."}
        ), 400

    if not validate_email(email):
        return jsonify({"success": False, "message": "Invalid email format."}), 400

    if not validate_password(password):
        return jsonify(
            {
                "success": False,
                "message": f"Password must be at least {MIN_PASSWORD_LENGTH} characters.",
            }
        ), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already exists."}), 400

    try:
        # Create new user
        user = User(
            email=email,
            password_hash=generate_password_hash(password),
            is_active=False,
        )
        db.session.add(user)
        db.session.commit()

        # Send verification email
        token = generate_token(email)
        send_verification_email(email, token)

        logger.info(f"User registered successfully: {email}")

        return jsonify(
            {
                "success": True,
                "message": "Signup successful. Please check your email for verification.",
            }
        ), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Signup error for {email}: {str(e)}")
        return jsonify(
            {"success": False, "message": "Signup failed. Please try again later."}
        ), 500


# ✅ Login Route
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
@limiter.limit(LOGIN_LIMITER, methods=["POST"])
def login():
    # Handle CORS preflight request
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get(
            "Origin", "*"
        )
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = request.headers.get(
            "Access-Control-Request-Headers", "Content-Type, Authorization"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 204

    data = get_request_json()
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request body. Expected JSON."}
        ), 400

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        logger.warning(
            f"Login attempt with missing credentials from IP: {request.remote_addr}"
        )
        return jsonify(
            {"success": False, "message": "Email and password are required."}
        ), 400

    try:
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            logger.warning(
                f"Failed login attempt for {email} from IP: {request.remote_addr}"
            )
            return jsonify(
                {"success": False, "message": "Invalid email or password."}
            ), 401

        if not user.is_active:
            logger.warning(f"Login attempt by unverified user: {email}")
            return jsonify(
                {
                    "success": False,
                    "message": "Please verify your email before logging in.",
                }
            ), 403

        # Get user's roles
        from models.user_role import UserRole

        user_roles = UserRole.query.filter_by(user_id=user.id, is_active=True).all()

        # Extract role names and role types
        role_names = [ur.role.name for ur in user_roles]
        role_types = list(set([ur.role.role_type for ur in user_roles]))

        # Build additional claims for JWT
        additional_claims = {
            "roles": role_names,
            "role_types": role_types,
            "is_admin": "admin" in role_types,
            "is_caregiver": "caregiver" in role_types,
        }

        # Generate token with role claims
        access_token = create_access_token(
            identity=user.id, additional_claims=additional_claims
        )
        user_data = serialize_user(user)

        # Determine primary role for frontend routing
        primary_role = None
        if "admin" in role_types:
            primary_role = "admin"
        elif "caregiver" in role_types:
            primary_role = "caregiver"
        else:
            primary_role = "user"

        logger.info(f"User logged in successfully: {email}")

        return jsonify(
            {
                "success": True,
                "message": "Login successful.",
                "access_token": access_token,
                "user": user_data,
                "role": primary_role,
            }
        ), 200

    except Exception as e:
        logger.error(f"Login error for {email}: {str(e)}")
        return jsonify(
            {"success": False, "message": "Login failed. Please try again later."}
        ), 500


# ✅ Email Verification
@auth_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    try:
        email = verify_token(token)
        if not email:
            logger.warning("Email verification attempted with invalid/expired token")
            return (
                "<h2>Invalid or expired token.</h2><p>Please request a new verification link.</p>",
                400,
            )

        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(f"Verification attempted for non-existent user: {email}")
            return "<h2>User not found.</h2>", 404

        if user.is_active:
            logger.info(f"User already verified: {email}")
            return "<h2>Email already verified.</h2><p>You can now log in.</p>", 200

        # Mark user as active
        user.is_active = True
        db.session.commit()
        logger.info(f"User email verified successfully: {email}")

        # Get frontend URL from environment, default to localhost for development
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/signin?verified=true")

    except Exception as e:
        db.session.rollback()
        logger.error(f"Email verification error: {str(e)}")
        return (
            "<h2>Verification failed.</h2><p>Please try again or contact support.</p>",
            500,
        )


# ✅ Check Verification Status
@auth_bp.route("/check-verification", methods=["GET"])
def check_verification():
    email = request.args.get("email", "").strip()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    try:
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"success": False, "verified": False}), 200

        return jsonify({"success": True, "verified": user.is_active}), 200

    except Exception as e:
        logger.error(f"Check verification error for {email}: {str(e)}")
        return jsonify(
            {"success": False, "message": "Failed to check verification status."}
        ), 500


# ✅ Resend Verification Email
@auth_bp.route("/resend-email-verification", methods=["POST"])
def resend_verification():
    data = get_request_json()
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request body. Expected JSON."}
        ), 400

    email = data.get("email", "").strip()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    try:
        user = User.query.filter_by(email=email).first()
        if not user:
            logger.warning(
                f"Resend verification attempt for non-existent email: {email}"
            )
            return jsonify({"success": False, "message": "User not found."}), 404

        if user.is_active:
            return jsonify(
                {"success": False, "message": "Email already verified."}
            ), 400

        # Send verification email
        token = generate_token(email)
        send_verification_email(email, token)
        logger.info(f"Verification email resent to: {email}")

        return jsonify(
            {"success": True, "message": "Verification email resent successfully."}
        ), 200

    except Exception as e:
        logger.error(f"Resend verification error for {email}: {str(e)}")
        return jsonify(
            {
                "success": False,
                "message": "Failed to resend verification. Please try again later.",
            }
        ), 500


# ✅ Switch Role Route
@auth_bp.route("/switch-role", methods=["POST"])
@jwt_required()
def switch_role():
    """
    Switch user's active role to another role they have access to.

    Expected JSON:
    {
        "role_type": "therapist"  # or "admin", "caregiver", "user", etc.
    }

    Returns: New JWT token with updated role claims
    """
    from flask_jwt_extended import get_jwt_identity
    from models.user_role import UserRole
    from models.role import Role

    try:
        data = get_request_json()
        if not data:
            return jsonify(
                {"success": False, "message": "Invalid request body. Expected JSON."}
            ), 400

        role_type = data.get("role_type", "").strip()
        if not role_type:
            return jsonify({"success": False, "message": "role_type is required."}), 400

        # Get current user ID from JWT
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            logger.warning(f"Switch role attempt for non-existent user: {user_id}")
            return jsonify({"success": False, "message": "User not found."}), 404

        # Get all active roles for this user
        user_roles = UserRole.query.filter_by(user_id=user_id, is_active=True).all()

        if not user_roles:
            logger.warning(f"Switch role attempt for user with no roles: {user_id}")
            return jsonify(
                {"success": False, "message": "User has no assigned roles."}
            ), 403

        # Check if user has the requested role_type
        user_role_types = [ur.role.role_type for ur in user_roles]
        if role_type not in user_role_types:
            logger.warning(
                f"Unauthorized switch role attempt: user {user_id} tried to switch to {role_type}"
            )
            return jsonify(
                {"success": False, "message": f"User does not have {role_type} role."}
            ), 403

        # Collect user's roles and role types
        user_roles_list = [ur.role.name for ur in user_roles]

        # Build additional claims for JWT
        additional_claims = {
            "roles": user_roles_list,
            "role_types": user_role_types,
            "current_role_type": role_type,
            "is_admin": "admin" in user_role_types,
            "is_caregiver": "caregiver" in user_role_types,
        }

        # Generate new access token with updated claims
        new_token = create_access_token(
            identity=user.id, additional_claims=additional_claims
        )

        user_data = serialize_user(user)
        logger.info(f"User {user.email} switched to {role_type} role")

        return jsonify(
            {
                "success": True,
                "message": f"Successfully switched to {role_type} role.",
                "access_token": new_token,
                "user": user_data,
                "current_role_type": role_type,
            }
        ), 200

    except Exception as e:
        logger.error(f"Switch role error: {str(e)}")
        return jsonify(
            {
                "success": False,
                "message": "Failed to switch role. Please try again later.",
            }
        ), 500
