from flask_restful import Resource, reqparse
from flask import jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from models.user import User
from models.role import Role
from models.community import CommunityPost
from models.message import Message
from models.reminder import Reminder
from models.session import SessionToken
from extensions import db
from utils.auth_helpers import require_admin


class AdminStatsResource(Resource):
    """Get dashboard statistics"""

    @require_admin
    def get(self):
        try:
            # Total counts
            total_users = User.query.count()
            total_caregivers = (
                db.session.query(User)
                .join(User.roles)
                .filter(Role.role_type == "caregiver")
                .distinct()
                .count()
            )
            total_flagged_posts = (
                db.session.query(func.count(CommunityPost.id))
                .filter(CommunityPost.flagged == True)
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
            query = CommunityPost.query.filter(CommunityPost.flagged == True)

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
                        "time": post.created_at.isoformat(),
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

            # Get new user registrations
            one_day_ago = datetime.utcnow() - timedelta(days=1)
            new_users = (
                User.query.filter(User.created_at >= one_day_ago)
                .order_by(User.created_at.desc())
                .limit(5)
                .all()
            )

            activity = []

            # Add user registrations
            for user in new_users:
                activity.append(
                    {
                        "id": user.id,
                        "action": "New user registered",
                        "user": user.username,
                        "timestamp": user.created_at.isoformat(),
                        "icon": "FaUsers",
                        "color": "text-teal-600",
                    }
                )

            # Add messages as activity
            for msg in messages:
                activity.append(
                    {
                        "id": msg.id,
                        "action": "Message sent",
                        "user": msg.sender.username if msg.sender else "Unknown",
                        "timestamp": msg.created_at.isoformat(),
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
                user_count = User.query.filter(User.created_at <= date).count()
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
                query = query.join(User.roles).filter(
                    Role.role_type == args["role_type"]
                )

            users = query.limit(args["limit"]).offset(args["offset"]).all()
            total = query.count()

            result = []
            for user in users:
                role_types = [role.role_type for role in user.roles]
                result.append(
                    {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "created_at": user.created_at.isoformat(),
                        "is_verified": user.is_verified,
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
