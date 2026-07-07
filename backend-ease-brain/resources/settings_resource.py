"""
Settings Resource
Handles user profile and notification preference endpoints.
Moved from app.py inline routes to keep architecture consistent.
"""

import logging
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
import sqlalchemy as sa

logger = logging.getLogger(__name__)

settings_bp = Blueprint("settings", __name__)


def _get_user_settings_columns():
    inspector = sa.inspect(db.engine)
    if not inspector.has_table("user_settings"):
        return set()
    return {col["name"] for col in inspector.get_columns("user_settings")}


def _get_user_settings_row(user_id):
    columns = _get_user_settings_columns()
    if not columns:
        return None
    metadata = sa.MetaData()
    table = sa.Table("user_settings", metadata, autoload_with=db.engine)
    stmt = sa.select(table).where(table.c.user_id == user_id)
    return db.session.execute(stmt).mappings().first()


def _ensure_user_settings_row(user_id):
    settings = _get_user_settings_row(user_id)
    if settings:
        return settings

    columns = _get_user_settings_columns()
    if not columns:
        return None

    metadata = sa.MetaData()
    table = sa.Table("user_settings", metadata, autoload_with=db.engine)
    values = {"user_id": user_id}
    if "name" in columns:
        values["name"] = None
    if "phone" in columns:
        values["phone"] = None
    if "timezone" in columns:
        values["timezone"] = "UTC"
    if "email_notifications" in columns:
        values["email_notifications"] = True
    if "sms_notifications" in columns:
        values["sms_notifications"] = False
    if "push_notifications" in columns:
        values["push_notifications"] = True
    if "theme" in columns:
        values["theme"] = "light"

    db.session.execute(table.insert().values(**values))
    db.session.commit()
    return _get_user_settings_row(user_id)


@settings_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    """
    Get current user's settings.
    Returns profile data merged with UserSettings row (created on first access).
    """
    try:
        user_id = get_jwt_identity()
        user = db.session.query(User).filter_by(id=user_id).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        settings = _ensure_user_settings_row(user_id)
        if settings is None:
            return jsonify({"message": "Settings table not available"}), 500

        response_data = {
            "id": user.id,
            "name": settings.get("name")
            or f"{user.first_name} {user.last_name}".strip()
            or user.username,
            "email": user.email,
            "phone": settings.get("phone") or user.phone_number or "",
            "timezone": settings.get("timezone") or "UTC",
            "theme": settings.get("theme") or "light",
            "notifications": {
                "email": settings.get("email_notifications"),
                "sms": settings.get("sms_notifications"),
                "push": settings.get("push_notifications"),
            },
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error fetching settings: {str(e)}")
        return jsonify({"message": "Failed to fetch settings"}), 500


@settings_bp.route("/settings/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update user profile settings.
    Accepts: name, phone, timezone, first_name, last_name.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        user = db.session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        settings = _ensure_user_settings_row(user_id)
        if settings is None:
            return jsonify({"message": "Settings table not available"}), 500
        columns = _get_user_settings_columns()

        updates = {}
        if "name" in data and "name" in columns:
            updates["name"] = data["name"]
        if "phone" in data and "phone" in columns:
            updates["phone"] = data["phone"]
            user.phone_number = data["phone"]
        if "timezone" in data and "timezone" in columns:
            updates["timezone"] = data["timezone"]
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]

        if updates:
            metadata = sa.MetaData()
            table = sa.Table("user_settings", metadata, autoload_with=db.engine)
            db.session.execute(
                table.update().where(table.c.user_id == user_id).values(**updates)
            )
        db.session.commit()

        return jsonify(
            {
                "message": "Profile updated successfully",
                "data": {
                    "id": user.id,
                    "name": settings.get("name")
                    or f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                    "phone": settings.get("phone") or user.phone_number or "",
                    "timezone": settings.get("timezone") or "UTC",
                },
            }
        ), 200

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update profile"}), 500


@settings_bp.route("/settings/notifications", methods=["PUT"])
@jwt_required()
def update_notifications():
    """
    Update notification preferences.
    Accepts: { notifications: { email, sms, push } } or flat { email, sms, push }.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"message": "No data provided"}), 400

        user = db.session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        settings = _ensure_user_settings_row(user_id)
        if settings is None:
            return jsonify({"message": "Settings table not available"}), 500
        columns = _get_user_settings_columns()

        # Support both nested { notifications: {...} } and flat structure
        notifications = data.get("notifications", data)

        updates = {}
        if "email" in notifications and "email_notifications" in columns:
            updates["email_notifications"] = notifications["email"]
        if "sms" in notifications and "sms_notifications" in columns:
            updates["sms_notifications"] = notifications["sms"]
        if "push" in notifications and "push_notifications" in columns:
            updates["push_notifications"] = notifications["push"]

        if updates:
            metadata = sa.MetaData()
            table = sa.Table("user_settings", metadata, autoload_with=db.engine)
            db.session.execute(
                table.update().where(table.c.user_id == user_id).values(**updates)
            )
        db.session.commit()

        return jsonify(
            {
                "message": "Notification preferences updated successfully",
                "data": {
                    "notifications": {
                        "email": notifications.get("email")
                        if "email" in notifications
                        else settings.get("email_notifications"),
                        "sms": notifications.get("sms")
                        if "sms" in notifications
                        else settings.get("sms_notifications"),
                        "push": notifications.get("push")
                        if "push" in notifications
                        else settings.get("push_notifications"),
                    }
                },
            }
        ), 200

    except Exception as e:
        logger.error(f"Error updating notifications: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update notifications"}), 500


@settings_bp.route("/settings/theme", methods=["PUT"])
@jwt_required()
def update_theme():
    """
    Update user theme preference (light / dark).
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or "theme" not in data:
            return jsonify({"message": "theme field is required"}), 400

        theme = data["theme"]
        if theme not in ("light", "dark"):
            return jsonify({"message": "theme must be 'light' or 'dark'"}), 400

        settings = _ensure_user_settings_row(user_id)
        if settings is None:
            return jsonify({"message": "Settings table not available"}), 500

        columns = _get_user_settings_columns()
        if "theme" in columns:
            metadata = sa.MetaData()
            table = sa.Table("user_settings", metadata, autoload_with=db.engine)
            db.session.execute(
                table.update().where(table.c.user_id == user_id).values(theme=theme)
            )
        db.session.commit()

        return jsonify({"message": "Theme updated", "theme": theme}), 200

    except Exception as e:
        logger.error(f"Error updating theme: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update theme"}), 500
