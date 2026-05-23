from flask_restful import Resource, reqparse
from flask import jsonify, request
from sqlalchemy import func
from datetime import datetime, timedelta
from models.user import User
from models.role import Role
from models.user_role import UserRole
from models.community import CommunityPost
from models.message import Message
from models.reminder import Reminder
from models.session import SessionToken
from models.settings import UserSettings
from extensions import db
from utils.auth_helpers import require_admin
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

logger = logging.getLogger(__name__)


def _format_datetime(value):
    return value.isoformat() if value else None


def _user_role_types(user):
    return [user_role.role.role_type for user_role in user.user_roles if user_role.role]


def _user_is_verified(user):
    return bool(user.verification and user.verification.is_verified)


class AdminStatsResource(Resource):
    """Get dashboard statistics"""

    @require_admin
    def get(self):
        try:
            # Total counts
            total_users = User.query.count()
            total_caregivers = (
                db.session.query(User)
                .join(UserRole, UserRole.user_id == User.id)
                .join(Role, Role.id == UserRole.role_id)
                .filter(Role.role_type == "caregiver")
                .filter(UserRole.is_active == True)
                .distinct()
                .count()
            )
            total_flagged_posts = (
                db.session.query(func.count(CommunityPost.id))
                .filter(CommunityPost.is_flagged_for_review == True)
                .scalar()
                or 0
            )
            active_sessions = SessionToken.query.filter(
                SessionToken.expires_at > datetime.utcnow()
            ).count()

            return jsonify(
                {
                    "total_users": total_users,
                    "total_caregivers": total_caregivers,
                    "flagged_posts": total_flagged_posts,
                    "active_sessions": active_sessions,
                }
            ), 200
        except Exception as e:
            return jsonify({"message": f"Error fetching stats: {str(e)}"}), 500


class AdminReportsResource(Resource):
    """Get flagged content reports"""

    @require_admin
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("status", type=str, default="all")
            parser.add_argument("severity", type=str, default="all")
            parser.add_argument("limit", type=int, default=20)
            args = parser.parse_args()

            # Get flagged community posts
            query = CommunityPost.query.filter(
                CommunityPost.is_flagged_for_review == True
            )

            if args["status"] != "all":
                # Assuming a status field exists, adjust as needed
                pass

            reports = (
                query.order_by(CommunityPost.created_at.desc())
                .limit(args["limit"])
                .all()
            )

            result = []
            for post in reports:
                result.append(
                    {
                        "id": post.id,
                        "title": post.title,
                        "content": post.content[:100],  # Truncate
                        "time": _format_datetime(post.created_at),
                        "severity": "high",  # Placeholder
                        "status": "pending",  # Placeholder
                        "type": "Community Post",
                        "reporter": "System",
                        "author": post.user.username if post.user else "Unknown",
                    }
                )

            return jsonify(result), 200
        except Exception as e:
            return jsonify({"message": f"Error fetching reports: {str(e)}"}), 500


class AdminActivityFeedResource(Resource):
    """Get recent admin activity"""

    @require_admin
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("limit", type=int, default=10)
            args = parser.parse_args()

            # Get recent messages (as activity proxy)
            messages = (
                Message.query.order_by(Message.created_at.desc())
                .limit(args["limit"])
                .all()
            )

            activity = []

            # Add messages as activity
            for msg in messages:
                activity.append(
                    {
                        "id": msg.id,
                        "action": "Message sent",
                        "user": msg.sender.username if msg.sender else "Unknown",
                        "timestamp": _format_datetime(msg.created_at),
                        "icon": "FaBell",
                        "color": "text-blue-600",
                    }
                )

            # Sort by timestamp descending
            activity.sort(key=lambda x: x["timestamp"], reverse=True)
            return jsonify(activity[: args["limit"]]), 200
        except Exception as e:
            return jsonify({"message": f"Error fetching activity: {str(e)}"}), 500


class AdminAnalyticsResource(Resource):
    """Get analytics data for charts"""

    @require_admin
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("time_range", type=str, default="week")
            args = parser.parse_args()

            time_range = args["time_range"]

            if time_range == "week":
                days = 7
            elif time_range == "month":
                days = 30
            else:
                days = 365

            # Generate daily/weekly user data
            analytics_data = []
            for i in range(days, 0, -1):
                date = datetime.utcnow() - timedelta(days=i)
                user_count = User.query.count()
                session_count = SessionToken.query.filter(
                    SessionToken.issued_at <= date
                ).count()

                label = date.strftime("%a" if days == 7 else "%b %d")
                analytics_data.append(
                    {
                        "label": label,
                        "users": user_count,
                        "sessions": session_count,
                        "date": date.isoformat(),
                    }
                )

            return jsonify(analytics_data), 200
        except Exception as e:
            return jsonify({"message": f"Error fetching analytics: {str(e)}"}), 500


class AdminContentDistributionResource(Resource):
    """Get content distribution metrics"""

    @require_admin
    def get(self):
        try:
            community_posts = CommunityPost.query.count()
            messages = Message.query.count()
            reminders = Reminder.query.count()

            total = community_posts + messages + reminders

            return jsonify(
                {
                    "community_posts": community_posts,
                    "messages": messages,
                    "reminders": reminders,
                    "total": total,
                    "distribution": [
                        {
                            "name": "Community Posts",
                            "value": community_posts,
                            "color": "#0891b2",
                        },
                        {
                            "name": "Messages",
                            "value": messages,
                            "color": "#8b5cf6",
                        },
                        {
                            "name": "Reminders",
                            "value": reminders,
                            "color": "#f59e0b",
                        },
                    ],
                }
            ), 200
        except Exception as e:
            return jsonify(
                {"message": f"Error fetching content distribution: {str(e)}"}
            ), 500


class AdminUsersResource(Resource):
    """Get list of users with filtering"""

    @require_admin
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("role_type", type=str, default="all")
            parser.add_argument("limit", type=int, default=20)
            parser.add_argument("offset", type=int, default=0)
            args = parser.parse_args()

            query = User.query

            if args["role_type"] != "all":
                query = (
                    query.join(UserRole, UserRole.user_id == User.id)
                    .join(Role, Role.id == UserRole.role_id)
                    .filter(Role.role_type == args["role_type"])
                    .filter(UserRole.is_active == True)
                )

            users = query.limit(args["limit"]).offset(args["offset"]).all()
            total = query.count()

            result = []
            for user in users:
                role_types = _user_role_types(user)
                result.append(
                    {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "created_at": _format_datetime(
                            getattr(user, "created_at", None)
                        ),
                        "is_verified": _user_is_verified(user),
                        "roles": role_types,
                    }
                )

            return jsonify(
                {
                    "users": result,
                    "total": total,
                    "limit": args["limit"],
                    "offset": args["offset"],
                }
            ), 200
        except Exception as e:
            return jsonify({"message": f"Error fetching users: {str(e)}"}), 500


class AdminSettingsResource(Resource):
    """Manage admin dashboard settings"""

    @jwt_required()
    def get(self):
        """Get admin settings for current user"""
        try:
            user_id = get_jwt_identity()
            settings = UserSettings.query.filter_by(user_id=user_id).first()

            if not settings:
                # Return default settings if not found
                return jsonify(
                    {
                        "success": True,
                        "data": {
                            "dashboardRefreshRate": 30,
                            "notificationsEnabled": True,
                            "emailAlerts": True,
                            "darkMode": False,
                            "autoLogoutMinutes": 60,
                            "twoFactorEnabled": True,
                            "timeFormat": "24h",
                        },
                    }
                ), 200

            settings_data = {
                "dashboardRefreshRate": getattr(settings, "dashboard_refresh_rate", 30),
                "notificationsEnabled": settings.push_notifications,
                "emailAlerts": settings.email_notifications,
                "darkMode": settings.theme == "dark",
                "autoLogoutMinutes": getattr(settings, "auto_logout_minutes", 60),
                "twoFactorEnabled": getattr(settings, "two_factor_enabled", True),
                "timeFormat": getattr(settings, "time_format", "24h"),
            }

            return jsonify({"success": True, "data": settings_data}), 200
        except Exception as e:
            logger.error(f"Error fetching admin settings: {str(e)}")
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Failed to fetch settings",
                    }
                ),
                500,
            )

    @jwt_required()
    def post(self):
        """Save admin settings for current user"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json()

            if not data:
                return (
                    jsonify({"success": False, "error": "No settings provided"}),
                    400,
                )

            # Get or create settings
            settings = UserSettings.query.filter_by(user_id=user_id).first()

            if not settings:
                settings = UserSettings(user_id=user_id)
                db.session.add(settings)

            # Update settings from request
            if "notificationsEnabled" in data:
                settings.push_notifications = data["notificationsEnabled"]
            if "emailAlerts" in data:
                settings.email_notifications = data["emailAlerts"]
            if "darkMode" in data:
                settings.theme = "dark" if data["darkMode"] else "light"

            # Store additional settings as custom attributes (requires model update)
            if "dashboardRefreshRate" in data:
                settings.dashboard_refresh_rate = data["dashboardRefreshRate"]
            if "autoLogoutMinutes" in data:
                settings.auto_logout_minutes = data["autoLogoutMinutes"]
            if "twoFactorEnabled" in data:
                settings.two_factor_enabled = data["twoFactorEnabled"]
            if "timeFormat" in data:
                settings.time_format = data["timeFormat"]

            db.session.commit()

            logger.info(f"Admin settings saved for user {user_id}")

            settings_data = {
                "dashboardRefreshRate": getattr(settings, "dashboard_refresh_rate", 30),
                "notificationsEnabled": settings.push_notifications,
                "emailAlerts": settings.email_notifications,
                "darkMode": settings.theme == "dark",
                "autoLogoutMinutes": getattr(settings, "auto_logout_minutes", 60),
                "twoFactorEnabled": getattr(settings, "two_factor_enabled", True),
                "timeFormat": getattr(settings, "time_format", "24h"),
            }

            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Settings saved successfully",
                        "data": settings_data,
                    }
                ),
                200,
            )
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving admin settings: {str(e)}")
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Failed to save settings",
                    }
                ),
                500,
            )
