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
from models.settings import UserSettings

logger = logging.getLogger(__name__)

settings_bp = Blueprint("settings", __name__)


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

        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)
            db.session.commit()

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

        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)

        if "name" in data:
            settings.name = data["name"]
        if "phone" in data:
            settings.phone = data["phone"]
            user.phone_number = data["phone"]
        if "timezone" in data:
            settings.timezone = data["timezone"]
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "data": {
                "id": user.id,
                "name": settings.name or f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "phone": settings.phone or user.phone_number or "",
                "timezone": settings.timezone or "UTC",
            },
        }), 200

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

        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)

        # Support both nested { notifications: {...} } and flat structure
        notifications = data.get("notifications", data)

        if "email" in notifications:
            settings.email_notifications = notifications["email"]
        if "sms" in notifications:
            settings.sms_notifications = notifications["sms"]
        if "push" in notifications:
            settings.push_notifications = notifications["push"]

        db.session.commit()

        return jsonify({
            "message": "Notification preferences updated successfully",
            "data": {
                "notifications": {
                    "email": settings.email_notifications,
                    "sms": settings.sms_notifications,
                    "push": settings.push_notifications,
                }
            },
        }), 200

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

        settings = db.session.query(UserSettings).filter_by(user_id=user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)

        settings.theme = theme
        db.session.commit()

        return jsonify({"message": "Theme updated", "theme": theme}), 200

    except Exception as e:
        logger.error(f"Error updating theme: {str(e)}")
        db.session.rollback()
        return jsonify({"message": "Failed to update theme"}), 500
