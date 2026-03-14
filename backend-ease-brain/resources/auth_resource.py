import re
import sys
from flask_restful import Resource, reqparse
from flask_jwt_extended import get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, UserVerification, Role, UserRole
from extensions import db
from utils.send_email import send_email_notification
from utils.auth_helpers import get_user_roles, get_user_role_types
from utils.audit_logger import log_auth_event
from flask import url_for, request, current_app
from datetime import datetime
import secrets
from datetime import timedelta


class PasswordResetResource(Resource):
    """Handle forgot password request - sends reset email"""

    def post(self):
        """Send password reset email to user"""
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip()  # Strip whitespace from email

        if not email:
            return {"message": "Email is required"}, 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            # Don't reveal if email exists or not for security
            return {
                "message": "If this email exists, a password reset link has been sent."
            }, 200

        # Create/update password reset token (use UserVerification model with a flag)
        # For now, we'll create a new verification record or update existing
        verification = UserVerification.query.filter_by(user_id=user.id).first()

        if not verification:
            verification = UserVerification(user_id=user.id)
            db.session.add(verification)
        else:
            # Regenerate token for password reset
            verification.token = secrets.token_urlsafe(32)
            verification.expires_at = datetime.utcnow() + timedelta(
                hours=1
            )  # 1 hour for reset
            verification.is_verified = False  # Use for tracking if reset was used

        db.session.commit()

        # Construct reset URL with both token and email
        frontend_url = current_app.config.get("FRONTEND_URL", "http://www.easebrain.live")
        reset_url = f"{frontend_url}/reset-password?token={verification.token}&email={user.email}"

        # Send password reset email
        subject = "Reset Your Password"
        recipient_name = user.first_name or user.username

        email_sent = send_email_notification(
            recipient_email=user.email,
            subject=subject,
            template_data={
                "recipient_name": recipient_name,
                "subject": subject,
                "verification_url": reset_url,
                "plain_text": f"Hello {recipient_name},\n\nClick the link below to reset your password:\n{reset_url}\n\nThis link expires in 1 hour.\n\nThanks!",
            },
        )

        if email_sent:
            current_app.logger.info(f"✅ Password reset email sent to {user.email}")
        else:
            current_app.logger.warning(
                f"⚠️ Failed to send password reset email to {user.email}"
            )

        log_auth_event("password_reset_request", user.email, status="success")

        return {
            "message": "If this email exists, a password reset link has been sent."
        }, 200


class PasswordResetConfirmResource(Resource):
    """Handle password reset confirmation with token"""

    def post(self):
        """Confirm password reset with token"""
        data = request.get_json(silent=True) or {}
        token = (data.get("token") or "").strip()  # Strip whitespace from token
        new_password = data.get("password")

        if not token or not new_password:
            return {"message": "Token and new password are required"}, 400

        # Find the verification record by token
        verification = UserVerification.query.filter_by(token=token).first()

        if not verification:
            return {"message": "Invalid or expired reset token"}, 400

        if verification.is_token_expired():
            return {"message": "Reset token has expired"}, 400

        # Get user and reset password
        user = verification.user
        user.password_hash = generate_password_hash(new_password)
        verification.is_verified = True  # Mark as used

        db.session.commit()

        log_auth_event("password_reset_confirm", user.email, status="success")

        return {"message": "Password reset successfully. You can now log in."}, 200


class SignupResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "username",
        required=True,
        type=str,
        help="Username is required",
        location="json",
    )
    parser.add_argument(
        "email", required=True, type=str, help="Email is required", location="json"
    )
    parser.add_argument(
        "password",
        required=True,
        type=str,
        help="Password is required",
        location="json",
    )
    parser.add_argument("first_name", type=str, location="json")
    parser.add_argument("last_name", type=str, location="json")
    parser.add_argument("phone_number", type=str, location="json")
    parser.add_argument("location", type=str, location="json")
    parser.add_argument("date_of_birth", type=str, location="json")
    parser.add_argument("organization_id", type=int, location="json")
    parser.add_argument(
        "role_id", type=int, help="Role ID for the user", location="json"
    )

    def post(self):
        # Log raw incoming request for debugging differences between curl and browser requests
        try:
            raw = request.get_data(as_text=True)
        except Exception:
            raw = "<unreadable>"
        hdrs = {k: v for k, v in request.headers.items()}
        current_app.logger.debug(f"[SignUp] Raw headers: {hdrs}")
        current_app.logger.debug(f"[SignUp] Raw body: {raw}")

        try:
            data = self.parser.parse_args()
        except Exception as e:
            error_msg = f"[SignUp] Parser error: {str(e)}"
            print(error_msg, file=sys.stderr)
            sys.stderr.flush()
            current_app.logger.error(error_msg)
            return {"message": f"Invalid request format: {str(e)}"}, 400

        debug_msg = f"[SignUp] Received data: {data}"
        print(debug_msg, file=sys.stderr)
        sys.stderr.flush()
        current_app.logger.info(debug_msg)

        try:
            # Validate email format
            if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
                log_auth_event(
                    "signup",
                    data["email"],
                    status="failure",
                    details="Invalid email format",
                )
                return {"message": "Invalid email format"}, 400

            # Ensure username, email and phone number are unique
            if User.query.filter_by(username=data["username"]).first():
                log_auth_event(
                    "signup",
                    data["email"],
                    status="failure",
                    details="Username already taken",
                )
                return {"message": "Username already taken"}, 400
            if User.query.filter_by(email=data["email"]).first():
                log_auth_event(
                    "signup",
                    data["email"],
                    status="failure",
                    details="Email already registered",
                )
                return {"message": "Email already registered"}, 400
            if (
                data.get("phone_number")
                and User.query.filter_by(phone_number=data["phone_number"]).first()
            ):
                log_auth_event(
                    "signup",
                    data["email"],
                    status="failure",
                    details="Phone number already registered",
                )
                return {"message": "Phone number already registered"}, 400

            # Validate role_id if provided
            role_id = data.get("role_id")
            if role_id:
                role = Role.query.get(role_id)
                if not role:
                    log_auth_event(
                        "signup",
                        data["email"],
                        status="failure",
                        details="Invalid role selected",
                    )
                    return {"message": "Invalid role selected"}, 400

            # Hash password
            hashed_password = generate_password_hash(data["password"])

            # Create new user
            user = User(
                username=data["username"],
                email=data["email"],
                password_hash=hashed_password,
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                phone_number=data.get("phone_number"),
                location=data.get("location"),
                date_of_birth=data.get("date_of_birth"),
                organization_id=data.get("organization_id"),
                is_active=False,
            )
            db.session.add(user)
            db.session.commit()

            # Assign role if provided
            if role_id:
                user_role = UserRole(user_id=user.id, role_id=role_id)
                db.session.add(user_role)
                db.session.commit()

            # Create a verification record
            verification = UserVerification(user_id=user.id)
            db.session.add(verification)
            db.session.commit()

            # Construct verification URL
            verification_url = url_for(
                "emailverificationresource",
                token=verification.token,
                _external=True,
            )

            # Send verification email
            subject = "Please verify your email"
            recipient_name = user.first_name or user.username
            email_sent = send_email_notification(
                recipient_email=user.email,
                subject=subject,
                template_data={
                    "recipient_name": recipient_name,
                    "subject": subject,
                    "verification_url": verification_url,
                    "plain_text": f"Hello {recipient_name},\nPlease verify your email by clicking the link below:\n {verification_url}\n\nThanks!",
                },
            )

            if email_sent:
                current_app.logger.info(
                    f"✅ Verification email sent successfully to {user.email}"
                )
            else:
                current_app.logger.warning(
                    f"⚠️ Failed to send verification email to {user.email}"
                )

            # Generate access token with role claims
            additional_claims = {
                "roles": get_user_roles(user.id),
                "role_types": get_user_role_types(user.id),
            }
            access_token = create_access_token(
                identity=user.id, additional_claims=additional_claims
            )

            # Build a minimal user payload manually to avoid any serializer lazy-loads.
            user_payload = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": user.phone_number,
                "location": user.location,
                "date_of_birth": user.date_of_birth,
                "is_active": bool(user.is_active),
                "organization_id": user.organization_id,
                "roles": get_user_roles(user.id),
                "role_types": get_user_role_types(user.id),
            }

            log_auth_event("signup", user.email, status="success")
            return {
                "message": "User registered successfully. Please check your email to verify your account.",
                "user": user_payload,
                "access_token": access_token,
            }, 201
        except Exception as e:
            error_msg = f"[SignUp] Error during registration: {str(e)}"
            print(error_msg, file=sys.stderr)
            import traceback

            traceback.print_exc(file=sys.stderr)
            sys.stderr.flush()
            current_app.logger.error(error_msg, exc_info=True)
            log_auth_event(
                "signup", data.get("email", "unknown"), status="failure", details=str(e)
            )
            return {"message": f"Registration failed: {str(e)}"}, 400


class LoginResource(Resource):
    def options(self):
        # Allow CORS preflight
        from flask import make_response

        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get(
            "Origin", "*"
        )
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = request.headers.get(
            "Access-Control-Request-Headers", "*"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 204

    parser = reqparse.RequestParser()
    parser.add_argument("email", required=True, type=str, help="Email is required")
    parser.add_argument(
        "password", required=True, type=str, help="Password is required"
    )

    def post(self):
        data = self.parser.parse_args()

        # Find active user
        user = User.query.filter_by(email=data["email"], is_active=True).first()
        if not user:
            log_auth_event(
                "login",
                data["email"],
                status="failure",
                details="Invalid email or account inactive",
            )
            return {
                "message": "Invalid email or account inactive. \nPlease check your inbox"
            }, 401

        # Verify password
        if not check_password_hash(user.password_hash, data["password"]):
            log_auth_event(
                "login", data["email"], status="failure", details="Invalid password"
            )
            return {"message": "Invalid password or email"}, 401

        # Create JWT token with role claims
        additional_claims = {
            "roles": get_user_roles(user.id),
            "role_types": get_user_role_types(user.id),
        }
        access_token = create_access_token(
            identity=user.id, additional_claims=additional_claims
        )

        # Build minimal user payload to avoid lazy loads
        user_payload = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "location": user.location,
            "date_of_birth": user.date_of_birth,
            "is_active": bool(user.is_active),
            "organization_id": user.organization_id,
            "roles": get_user_roles(user.id),
            "role_types": get_user_role_types(user.id),
        }

        log_auth_event("login", user.email, status="success")
        return {
            "message": "Login successful",
            "access_token": access_token,
            "user": user_payload,
        }, 200


class EmailVerificationResource(Resource):
    def get(self):
        token = (request.args.get("token") or "").strip()  # Strip whitespace from token
        if not token:
            return {"message": "Verification token is required."}, 400

        # Find the verification record
        verification = UserVerification.query.filter_by(token=token).first()

        if not verification:
            return {"message": "Invalid or expired token."}, 400

        if verification.is_verified:
            return {"message": "Email already verified."}, 200

        if verification.is_token_expired():
            return {"message": "Verification token has expired."}, 400

        # Mark verification as complete
        verification.is_verified = True
        verification.user.is_active = True  # Activate user
        verification.expires_at = (
            datetime.utcnow()
        )  # Optional: expire token immediately

        db.session.commit()

        return {"message": "Email verified successfully. You can now log in."}, 200


class ResendVerificationEmailResource(Resource):
    def post(self):
        """Resend verification email.

        Behavior:
        - If request contains a valid JWT, use that authenticated user.
        - Otherwise, accept a JSON body with { "email": "..." } and locate user by email.
        This allows the frontend to request resends without an access token while still
        protecting authenticated usage.
        """
        user = None

        # Try to get user from JWT if provided
        try:
            from flask_jwt_extended import verify_jwt_in_request_optional

            verify_jwt_in_request_optional()
            user_id = get_jwt_identity()
            if user_id:
                user = User.query.get(user_id)
        except Exception:
            # no JWT or invalid — we'll fall back to email flow below
            user = None

        # If no user from JWT, try email in JSON body
        if not user:
            data = request.get_json(silent=True) or {}
            email = (data.get("email") or "").strip()  # Strip whitespace from email
            if not email:
                return {
                    "message": "Authentication required or provide email in body."
                }, 401
            user = User.query.filter_by(email=email).first()

        if not user:
            return {"message": "User not found"}, 404

        if user.is_active:
            return {"message": "Email already verified."}, 400

        # Create new token or fetch existing one and refresh token & expiry
        verification = UserVerification.query.filter_by(
            user_id=user.id, is_verified=False
        ).first()

        if verification:
            # regenerate short token and extend expiry
            verification.token = secrets.token_urlsafe(32)
            verification.expires_at = datetime.utcnow() + timedelta(hours=24)
        else:
            verification = UserVerification(user_id=user.id)
            db.session.add(verification)

        db.session.commit()

        verification_url = url_for(
            "emailverificationresource",  # Same as your SignupResource
            token=verification.token,
            _external=True,
        )

        subject = "Resend: Please verify your email"
        recipient_name = user.first_name or user.username

        send_email_notification(
            recipient_email=user.email,
            subject=subject,
            template_data={
                "recipient_name": recipient_name,
                "subject": subject,
                "verification_url": verification_url,
                "plain_text": f"Hello {recipient_name},\nPlease verify your email by clicking the link below:\n {verification_url}\n\nThanks!",
            },
        )

        return {"message": "Verification email resent."}, 200
