from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.reminder import Reminder
from datetime import datetime


class ReminderResource(Resource):
    """Handle reminder CRUD operations"""

    @jwt_required()
    def get(self, reminder_id=None):
        """Get reminders for the current user"""
        user_id = get_jwt_identity()

        if reminder_id:
            # Get specific reminder
            reminder = Reminder.query.filter_by(id=reminder_id, user_id=user_id).first()
            if not reminder:
                return {"error": "Reminder not found"}, 404
            return reminder.to_dict(), 200

        # Get all reminders for the user
        reminders = Reminder.query.filter_by(user_id=user_id).all()
        return [r.to_dict() for r in reminders], 200

    @jwt_required()
    def post(self):
        """Create a new reminder"""
        user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        if not data.get("title") or not data.get("remind_at"):
            return {"error": "Title and remind_at are required"}, 400

        try:
            # Parse remind_at datetime
            remind_at = datetime.fromisoformat(data["remind_at"].replace("Z", "+00:00"))

            reminder = Reminder(
                user_id=user_id,
                title=data["title"],
                description=data.get("description", ""),
                remind_at=remind_at,
                notification_email=data.get("notification_email", True),
                notification_sms=data.get("notification_sms", False),
                notification_push=data.get("notification_push", False),
                priority=data.get("priority", "medium"),
                timezone=data.get("timezone", "UTC"),
                recurring=data.get("recurring", "none"),
                recurring_interval=data.get("recurring_interval"),
                done=False,
            )

            db.session.add(reminder)
            db.session.commit()

            return reminder.to_dict(), 201
        except (ValueError, KeyError) as e:
            return {"error": f"Invalid data: {str(e)}"}, 400

    @jwt_required()
    def put(self, reminder_id):
        """Update a reminder"""
        user_id = get_jwt_identity()
        reminder = Reminder.query.filter_by(id=reminder_id, user_id=user_id).first()

        if not reminder:
            return {"error": "Reminder not found"}, 404

        data = request.get_json()

        try:
            # Update fields
            if "title" in data:
                reminder.title = data["title"]
            if "description" in data:
                reminder.description = data["description"]
            if "remind_at" in data:
                reminder.remind_at = datetime.fromisoformat(
                    data["remind_at"].replace("Z", "+00:00")
                )
            if "notification_email" in data:
                reminder.notification_email = data["notification_email"]
            if "notification_sms" in data:
                reminder.notification_sms = data["notification_sms"]
            if "notification_push" in data:
                reminder.notification_push = data["notification_push"]
            if "priority" in data:
                reminder.priority = data["priority"]
            if "timezone" in data:
                reminder.timezone = data["timezone"]
            if "recurring" in data:
                reminder.recurring = data["recurring"]
            if "recurring_interval" in data:
                reminder.recurring_interval = data["recurring_interval"]
            if "done" in data:
                reminder.done = data["done"]

            db.session.commit()
            return reminder.to_dict(), 200
        except (ValueError, KeyError) as e:
            return {"error": f"Invalid data: {str(e)}"}, 400

    @jwt_required()
    def delete(self, reminder_id):
        """Delete a reminder"""
        user_id = get_jwt_identity()
        reminder = Reminder.query.filter_by(id=reminder_id, user_id=user_id).first()

        if not reminder:
            return {"error": "Reminder not found"}, 404

        db.session.delete(reminder)
        db.session.commit()

        return {"message": "Reminder deleted successfully"}, 200
