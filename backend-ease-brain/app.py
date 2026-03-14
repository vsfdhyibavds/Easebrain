import os
import logging
from datetime import datetime, timedelta
from urllib.parse import urlparse, urljoin

from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from flask_restful import Api, Resource

from extensions import db
from resources.user_resource import UserResource, CurrentUserResource
from resources.auth_resource import (
    SignupResource,
    LoginResource,
    PasswordResetResource,
    PasswordResetConfirmResource,
)
from resources.auth_resource import (
    EmailVerificationResource,
    ResendVerificationEmailResource,
)
from resources.role_resource import RoleResource
from resources.user_role_resource import UserRoleResource
from resources.message_resource import MessageResource
from resources.conversation_resource import (
    ConversationResource,
    ConversationMessagesResource,
    TypingIndicatorResource,
    StartConversationResource,
)
from resources.reaction_resource import ReactionResource
from resources.conversation_settings_resource import ConversationSettingsResource
from resources.message_settings_resource import MessageSettingsResource
from resources.caregiver_note_resource import CaregiverNoteResource
from resources.reminder_resource import ReminderResource
from resources.caregiver_resource import (
    CaregiverReportResource,
    CaregiverHealthDataExportResource,
    CaregiverActivityResource,
    CaregiverNotificationResource,
    CaregiverDependentResource,
    CaregiverDashboardResource,
)
from resources.user_community_resource import UserCommunityResource
from resources.admin_resource import (
    AdminStatsResource,
    AdminReportsResource,
    AdminActivityFeedResource,
    AdminAnalyticsResource,
    AdminContentDistributionResource,
    AdminUsersResource,
)

from resources.organization_login_resource import (
    OrganizationRegisterResource,
    OrganizationLoginResource,
    OrganizationDashboardResource,
)
from routes.auth_routes import auth_bp
from resources.story_resource import story_bp
from resources.caregiver_connection_resource import caregiver_connection_bp
from resources.community_resource import community_bp
from resources.moderation_resource import moderation_bp
from resources.safety_plan_resource import safety_plan_bp
from models.user import User
from models.settings import UserSettings
from models.reminder import Reminder
from models.message import Message
from utils.audit_logger import configure_audit_logging
from utils.rate_limiter import init_rate_limiting
from utils.csrf_protection import csrf
from utils.health_check import health_bp
from utils.swagger_docs import swagger_bp
from utils.error_responses import (
    APIError,
    handle_api_error,
)

# Load environment variables from .env file after all imports
load_dotenv()


app = Flask(__name__)
# Configure sessions for CSRF protection
app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY", "dev-secret-change-in-production"
)
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Strict"
app.config["PERMANENT_SESSION_LIFETIME"] = 86400  # 24 hours

# Configure CORS origins based on environment
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://www.easebrain.live",
    "https://www.easebrain.live",
]

# Add production frontend URL if set
frontend_url = os.environ.get("FRONTEND_URL", "")
if frontend_url and frontend_url not in cors_origins:
    cors_origins.append(frontend_url)

CORS(
    app,
    resources={
        r"/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
    supports_credentials=True,
)

# module logger
logger = logging.getLogger(__name__)


# --- Update Email Endpoint ---
@app.route("/api/update-email", methods=["POST"])
@jwt_required()
def update_email():
    data = request.get_json()
    new_email = data.get("email")
    password = data.get("password")
    if not new_email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    if not ("@" in new_email and "." in new_email):
        return jsonify({"message": "Invalid email format."}), 400
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    # password hashing uses werkzeug.security.generate_password_hash -> stored in user.password_hash
    try:
        from werkzeug.security import check_password_hash

        if not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Incorrect password."}), 401
    except Exception:
        # Fallback in case Bcrypt was used elsewhere
        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({"message": "Incorrect password."}), 401
    if User.query.filter_by(email=new_email).first():
        return jsonify({"message": "Email already in use."}), 409
    user.email = new_email
    db.session.commit()
    return jsonify({"message": "Email updated successfully."}), 200


# Use environment variables for config
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///easebrain.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    os.environ.get("SQLALCHEMY_TRACK_MODIFICATIONS", "False") == "True"
)

# ⚠️ CRITICAL: JWT_SECRET_KEY MUST be explicitly set - no fallback
jwt_secret = os.environ.get("JWT_SECRET_KEY")
if not jwt_secret:
    raise ValueError(
        "❌ CRITICAL: JWT_SECRET_KEY environment variable is not set. "
        "This is required for secure token generation. "
        "Set it in your .env file or environment."
    )
app.config["JWT_SECRET_KEY"] = jwt_secret

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
    os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 86400)
)  # seconds
app.config["JWT_TOKEN_LOCATION"] = [os.environ.get("JWT_TOKEN_LOCATION", "headers")]
app.config["JWT_HEADER_NAME"] = os.environ.get("JWT_HEADER_NAME", "Authorization")
app.config["JWT_HEADER_TYPE"] = os.environ.get("JWT_HEADER_TYPE", "Bearer")
app.config["JWT_COOKIE_SECURE"] = (
    os.environ.get("FLASK_ENV", "development") == "production"
)
app.config["JWT_COOKIE_CSRF_PROTECT"] = (
    os.environ.get("JWT_COOKIE_CSRF_PROTECT", "True") == "True"
)
app.config["BUNDLE_ERRORS"] = os.environ.get("BUNDLE_ERRORS", "True") == "True"

# Initialize extensions
## db is imported from extensions
api = Api(app, prefix="/api")
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

# Initialize audit logging
configure_audit_logging(app)

# Initialize rate limiting
init_rate_limiting(app)

# Initialize CSRF protection
csrf.init_app(app)

# Log environment variables for email configuration on startup
logger.info("=" * 60)
logger.info("EMAIL CONFIGURATION STATUS:")
logger.info(
    f"  SENDGRID_API_KEY: {'✅ SET' if os.getenv('SENDGRID_API_KEY') else '❌ NOT SET'}"
)
logger.info(
    f"  SENDER_EMAIL: {'✅ SET' if os.getenv('SENDER_EMAIL') else '❌ NOT SET'}"
)
logger.info(f"  MOCK_EMAIL_MODE: {os.getenv('MOCK_EMAIL_MODE', 'disabled')}")
logger.info("=" * 60)


# Global error handlers: return JSON for API consumers instead of HTML error pages.
@app.errorhandler(Exception)
def handle_unexpected_error(error):
    """Catch unhandled exceptions and return JSON so frontend XHRs don't get HTML.

    This is intentionally generic and minimal: it logs the exception and returns
    a small JSON body. We avoid changing auth/resource code — this simply
    ensures API consumers receive JSON on failures instead of an HTML error page.
    """
    logger.exception("Unhandled exception: %s", error)
    if isinstance(error, HTTPException):
        # Preserve HTTPExceptions (they have useful code and description)
        response = jsonify({"error": error.description})
        response.status_code = error.code
        return response
    # Generic 500 for other exceptions
    return jsonify({"error": "internal_server_error"}), 500


def is_safe_url(target):
    """Return True if the target URL is safe for redirects (same-origin).

    This helper is useful when the app accepts a `next` query parameter or
    similar and must avoid open redirects. It allows relative paths and
    same-origin absolute URLs only.
    """
    host_url = urlparse(request.host_url)
    redirect_url = urlparse(urljoin(request.host_url, target))
    return (
        redirect_url.scheme in ("http", "https")
        and host_url.netloc == redirect_url.netloc
    )


# Register blueprints with /api prefix to match Flask-RESTful API resources
app.register_blueprint(
    auth_bp, url_prefix="/api"
)  # Signup, login, password reset, etc.
app.register_blueprint(story_bp, url_prefix="/api")  # /api/stories
app.register_blueprint(caregiver_connection_bp, url_prefix="/api")  # /api/caregivers
app.register_blueprint(community_bp, url_prefix="/api/community")  # /api/community
app.register_blueprint(moderation_bp, url_prefix="/api")  # /api/moderation
app.register_blueprint(safety_plan_bp, url_prefix="/api")  # /api/safety-plans
app.register_blueprint(
    health_bp, url_prefix="/api"
)  # /api/health and /api/health/detailed
app.register_blueprint(
    swagger_bp, url_prefix="/api"
)  # /api/docs, /api/openapi.json, /api/error-codes


class Index(Resource):
    def get(self):
        return {"message": "Welcome to Ease Brain"}


api.add_resource(Index, "/")
api.add_resource(UserResource, "/users", "/users/<int:user_id>")
api.add_resource(CurrentUserResource, "/me")
api.add_resource(SignupResource, "/signup")
api.add_resource(LoginResource, "/login")
api.add_resource(
    EmailVerificationResource, "/verify-email", endpoint="emailverificationresource"
)
api.add_resource(ResendVerificationEmailResource, "/resend-email-verification")
api.add_resource(RoleResource, "/roles", "/roles/<int:role_id>")
api.add_resource(UserRoleResource, "/user-roles", "/user-roles/<int:user_role_id>")
api.add_resource(MessageResource, "/messages", "/messages/<int:message_id>")
api.add_resource(StartConversationResource, "/messages/conversation/start")
api.add_resource(
    ConversationResource, "/conversations", "/conversations/<int:conversation_id>"
)
api.add_resource(
    ConversationMessagesResource,
    "/conversations/<int:conversation_id>/messages",
    "/conversations/<int:conversation_id>/messages/<int:message_id>",
)
api.add_resource(TypingIndicatorResource, "/conversations/<int:conversation_id>/typing")
api.add_resource(
    ReactionResource,
    "/conversations/<int:conversation_id>/messages/<int:message_id>/reactions",
    "/conversations/<int:conversation_id>/messages/<int:message_id>/reactions/<int:reaction_id>",
)
api.add_resource(
    ConversationSettingsResource, "/conversations/<int:conversation_id>/settings"
)
api.add_resource(
    MessageSettingsResource,
    "/conversations/<int:conversation_id>/pinned-messages",
    "/conversations/<int:conversation_id>/messages/<int:message_id>/pin",
)
api.add_resource(
    CaregiverNoteResource, "/caregiver-notes", "/caregiver-notes/<int:note_id>"
)
api.add_resource(ReminderResource, "/reminders", "/reminders/<int:reminder_id>")
api.add_resource(CaregiverReportResource, "/caregiver/reports/generate")
api.add_resource(CaregiverHealthDataExportResource, "/caregiver/health-data/export")
api.add_resource(
    CaregiverActivityResource, "/caregiver/activities/<int:activity_id>/<string:action>"
)
api.add_resource(CaregiverNotificationResource, "/caregiver/notifications")
api.add_resource(
    CaregiverDependentResource,
    "/caregiver/dependents",
    "/caregiver/dependents/<int:dependent_id>",
)
api.add_resource(CaregiverDashboardResource, "/caregiver/dashboard")
api.add_resource(
    UserCommunityResource,
    "/user-communities",
    "/user-communities/<int:user_community_id>",
)
api.add_resource(OrganizationRegisterResource, "/organization/register")

# Admin resources
api.add_resource(AdminStatsResource, "/admin/stats")
api.add_resource(AdminReportsResource, "/admin/reports")
api.add_resource(AdminActivityFeedResource, "/admin/activity")
api.add_resource(AdminAnalyticsResource, "/admin/analytics")
api.add_resource(AdminContentDistributionResource, "/admin/content-distribution")
api.add_resource(AdminUsersResource, "/admin/users")
api.add_resource(OrganizationLoginResource, "/organization/login")
api.add_resource(OrganizationDashboardResource, "/organization/dashboard")
api.add_resource(PasswordResetResource, "/forgot-password")
api.add_resource(PasswordResetConfirmResource, "/reset-password")


@app.route("/verify/<token>", methods=["GET"])
def verify_token_simple(token):
    """Convenience route for manual browser verification during development.
    Performs the same activation as `EmailVerificationResource` but returns
    a human-friendly HTML response for easier manual testing.
    """
    from models import UserVerification

    verification = UserVerification.query.filter_by(token=token).first()
    if not verification:
        return (
            "<h2>Verification Failed</h2><p>Invalid or expired token.</p>",
            400,
        )
    if verification.is_verified:
        return ("<h2>Already Verified</h2><p>Your email is already verified.</p>", 200)
    if verification.is_token_expired():
        return ("<h2>Token Expired</h2><p>The verification token has expired.</p>", 400)

    verification.is_verified = True
    verification.user.is_active = True
    verification.expires_at = datetime.utcnow()
    db.session.commit()

    return (
        "<h2>Verification Successful</h2><p>Your email has been verified. You can now log in.</p>",
        200,
    )


# --- BEGIN: User Settings Endpoints ---


@app.route("/api/settings", methods=["GET"])
@jwt_required()
def get_settings():
    """
    Get current user's settings from database.
    Requires JWT authentication.
    """
    try:
        user_id = get_jwt_identity()
        user = db.session.query(User).filter_by(id=user_id).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Get or create user settings
        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()

        if not settings:
            # Create default settings if they don't exist
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)
            db.session.commit()

        # Build response with user data and settings
        response_data = {
            "id": user.id,
            "name": settings.name
            or f"{user.first_name} {user.last_name}".strip()
            or user.username,
            "email": user.email,
            "phone": settings.phone or user.phone_number or "",
            "timezone": settings.timezone or "UTC",
            "theme": settings.theme or "light",
            "notifications": {
                "email": settings.email_notifications,
                "sms": settings.sms_notifications,
                "push": settings.push_notifications,
            },
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error fetching settings: {str(e)}")
        return jsonify({"message": "Failed to fetch settings"}), 500


@app.route("/api/settings/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update user profile settings in database.
    Requires JWT authentication.
    Updates: name, phone, timezone
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        user = db.session.query(User).filter_by(id=user_id).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Get or create user settings
        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()

        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)

        # Update allowed fields
        if "name" in data:
            settings.name = data["name"]

        if "phone" in data:
            settings.phone = data["phone"]
            # Also update user's phone_number if provided
            user.phone_number = data["phone"]

        if "timezone" in data:
            settings.timezone = data["timezone"]

        # Update user's name if provided (split into first/last)
        if "first_name" in data:
            user.first_name = data["first_name"]

        if "last_name" in data:
            user.last_name = data["last_name"]

        db.session.commit()

        response_data = {
            "message": "Profile updated successfully",
            "data": {
                "id": user.id,
                "name": settings.name or f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "phone": settings.phone or user.phone_number or "",
                "timezone": settings.timezone or "UTC",
            },
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update profile"}), 500


@app.route("/api/settings/notifications", methods=["PUT"])
@jwt_required()
def update_notifications():
    """
    Update user notification preferences in database.
    Requires JWT authentication.
    Updates: email_notifications, sms_notifications, push_notifications
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        user = db.session.query(User).filter_by(id=user_id).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Get or create user settings
        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()

        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)

        # Update notification preferences
        # Support both "notifications" nested object and flat structure
        notifications = data.get("notifications", data)

        if "email" in notifications:
            settings.email_notifications = notifications["email"]

        if "sms" in notifications:
            settings.sms_notifications = notifications["sms"]

        if "push" in notifications:
            settings.push_notifications = notifications["push"]

        db.session.commit()

        response_data = {
            "message": "Notification preferences updated successfully",
            "data": {
                "notifications": {
                    "email": settings.email_notifications,
                    "sms": settings.sms_notifications,
                    "push": settings.push_notifications,
                }
            },
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error updating notifications: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update notifications"}), 500


# --- END: Sample /api/settings endpoint ---


@app.route("/api/stats", methods=["GET"])
def get_stats():
    return jsonify({"total_posts": 0, "total_users": 0, "total_comments": 0})


@app.route("/api/notes", methods=["GET"])
def get_notes():
    return jsonify([])


@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)
    reminders = (
        Reminder.query.filter(
            Reminder.user_id == current_user_id, Reminder.remind_at >= one_hour_ago
        )
        .order_by(Reminder.remind_at.desc())
        .limit(5)
        .all()
    )
    messages = (
        Message.query.filter(
            Message.user_id == current_user_id, Message.created_at >= one_hour_ago
        )
        .order_by(Message.created_at.desc())
        .limit(5)
        .all()
    )
    notifications = []
    for r in reminders:
        notifications.append(
            {
                "type": "reminder",
                "id": r.id,
                "message": f"Reminder: {r.title} at {r.remind_at.strftime('%H:%M')}",
                "timestamp": r.remind_at.isoformat(),
                "description": r.description,
            }
        )
    for m in messages:
        notifications.append(
            {
                "type": "message",
                "id": m.id,
                "message": f"New message from {getattr(m, 'sender_name', 'Unknown')}",
                "timestamp": m.created_at.isoformat(),
                "content": m.content,
            }
        )
    notifications.sort(key=lambda n: n.get("timestamp", ""), reverse=True)
    return jsonify(notifications)


@app.errorhandler(APIError)
def handle_api_exception(error):
    """Handle custom API errors with structured response"""
    return handle_api_error(error)


@app.errorhandler(400)
def handle_bad_request(error):
    """Handle 400 Bad Request"""
    from utils.error_responses import format_error_response

    return format_error_response(
        "VALIDATION_ERROR",
        "Invalid request",
        400,
        {
            "reason": str(error.description)
            if hasattr(error, "description")
            else "Bad request"
        },
    )


@app.errorhandler(401)
def handle_unauthorized_error(error):
    """Handle 401 Unauthorized"""
    from utils.error_responses import format_error_response

    return format_error_response("AUTHENTICATION_ERROR", "Authentication required", 401)


@app.errorhandler(403)
def handle_forbidden_error(error):
    """Handle 403 Forbidden"""
    from utils.error_responses import format_error_response

    return format_error_response("AUTHORIZATION_ERROR", "Insufficient permissions", 403)


@app.errorhandler(404)
def handle_not_found_error(error):
    """Handle 404 Not Found"""
    from utils.error_responses import format_error_response

    return format_error_response("NOT_FOUND_ERROR", "Resource not found", 404)


@app.errorhandler(429)
def handle_rate_limit_error(error):
    """Handle 429 Rate Limit Exceeded"""
    from utils.error_responses import format_error_response

    retry_after = None
    if hasattr(error, "description"):
        # Try to extract retry-after from rate limiter
        import re

        match = re.search(r"(\d+)", str(error.description))
        if match:
            retry_after = int(match.group(1))
    return format_error_response(
        "RATE_LIMIT_ERROR",
        "Rate limit exceeded. Please try again later.",
        429,
        {"retry_after": retry_after},
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5500))
    is_production = os.environ.get("FLASK_ENV") == "production"
    app.run(host="0.0.0.0", port=port, debug=not is_production)


# Flask CLI command to process due reminders and send notifications
@app.cli.command("send-reminder-notifications")
def send_reminder_notifications():
    """Process due reminders and send notifications."""
    with app.app_context():
        Reminder.process_due_reminders(db.session)
    print("Processed due reminders and sent notifications.")
