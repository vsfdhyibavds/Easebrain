from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import CaregiverConnection, WarningSignNotification, User, Reminder
from datetime import datetime
import logging

caregiver_connection_bp = Blueprint(
    "caregiver_connection", __name__, url_prefix="/caregivers"
)
logger = logging.getLogger(__name__)


@caregiver_connection_bp.route("/connections", methods=["GET"])
@jwt_required()
def get_my_caregivers():
    """Get all caregivers connected to the current user (patient)"""
    try:
        user_id = get_jwt_identity()
        connections = CaregiverConnection.query.filter_by(
            patient_id=user_id, is_active=True
        ).all()

        result = []
        for conn in connections:
            caregiver = conn.caregiver
            result.append(
                {
                    "id": conn.id,
                    "caregiver_id": caregiver.id,
                    "caregiver_name": f"{caregiver.first_name} {caregiver.last_name}".strip(),
                    "relationship": conn.relationship,
                    "role": conn.role,
                    "phone_number": conn.phone_number,
                    "email_address": conn.email_address,
                    "notify_on_warning_signs": conn.notify_on_warning_signs,
                    "notify_on_crisis": conn.notify_on_crisis,
                    "accepted_at": conn.accepted_at.isoformat()
                    if conn.accepted_at
                    else None,
                }
            )

        return jsonify({"caregivers": result}), 200
    except Exception as e:
        logger.error(f"Error fetching caregivers: {str(e)}")
        return jsonify({"error": "Failed to fetch caregivers"}), 500


@caregiver_connection_bp.route("/add-caregiver", methods=["POST"])
@jwt_required()
def add_caregiver():
    """Add a new caregiver connection (patient initiates)"""
    try:
        patient_id = get_jwt_identity()
        data = request.get_json()

        # Can identify caregiver by email or username
        caregiver_email = data.get("caregiver_email")

        if not caregiver_email:
            return jsonify({"error": "Caregiver email is required"}), 400

        # Find caregiver
        caregiver = User.query.filter_by(email=caregiver_email).first()
        if not caregiver:
            return jsonify({"error": "Caregiver not found"}), 404

        # Check if connection already exists
        existing = CaregiverConnection.query.filter_by(
            patient_id=patient_id, caregiver_id=caregiver.id
        ).first()

        if existing:
            return jsonify({"error": "Connection already exists"}), 400

        connection = CaregiverConnection(
            patient_id=patient_id,
            caregiver_id=caregiver.id,
            relationship=data.get("relationship"),
            role=data.get("role", "Secondary"),
            phone_number=data.get("phone_number"),
            email_address=data.get("email_address", caregiver.email),
            notify_on_warning_signs=data.get("notify_on_warning_signs", True),
            notify_on_crisis=data.get("notify_on_crisis", True),
            notify_on_reminders=data.get("notify_on_reminders", False),
            notify_on_story_share=data.get("notify_on_story_share", False),
        )

        db.session.add(connection)
        db.session.commit()

        logger.info(
            f"Caregiver connection created: patient {patient_id} -> caregiver {caregiver.id}"
        )

        return jsonify(
            {
                "message": "Caregiver connection created",
                "connection": {
                    "id": connection.id,
                    "caregiver_id": caregiver.id,
                    "caregiver_name": f"{caregiver.first_name} {caregiver.last_name}".strip(),
                },
            }
        ), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding caregiver: {str(e)}")
        return jsonify({"error": "Failed to add caregiver"}), 500


@caregiver_connection_bp.route("/connections/<int:connection_id>", methods=["PUT"])
@jwt_required()
def update_caregiver_settings(connection_id):
    """Update caregiver notification preferences"""
    try:
        user_id = get_jwt_identity()
        connection = CaregiverConnection.query.get_or_404(connection_id)

        if connection.patient_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        connection.notify_on_warning_signs = data.get(
            "notify_on_warning_signs", connection.notify_on_warning_signs
        )
        connection.notify_on_crisis = data.get(
            "notify_on_crisis", connection.notify_on_crisis
        )
        connection.notify_on_reminders = data.get(
            "notify_on_reminders", connection.notify_on_reminders
        )
        connection.notify_on_story_share = data.get(
            "notify_on_story_share", connection.notify_on_story_share
        )

        db.session.commit()

        return jsonify({"message": "Settings updated"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating caregiver settings: {str(e)}")
        return jsonify({"error": "Failed to update settings"}), 500


@caregiver_connection_bp.route("/connections/<int:connection_id>", methods=["DELETE"])
@jwt_required()
def remove_caregiver(connection_id):
    """Remove a caregiver connection"""
    try:
        user_id = get_jwt_identity()
        connection = CaregiverConnection.query.get_or_404(connection_id)

        if connection.patient_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        connection.is_active = False
        db.session.commit()

        logger.info(f"Caregiver connection {connection_id} deactivated")

        return jsonify({"message": "Caregiver removed"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error removing caregiver: {str(e)}")
        return jsonify({"error": "Failed to remove caregiver"}), 500


@caregiver_connection_bp.route(
    "/warning-signs/<int:connection_id>/notify", methods=["POST"]
)
@jwt_required()
def notify_caregiver_warning_signs(connection_id):
    """Notify caregiver about detected warning signs"""
    try:
        patient_id = get_jwt_identity()
        connection = CaregiverConnection.query.get_or_404(connection_id)

        if connection.patient_id != patient_id:
            return jsonify({"error": "Unauthorized"}), 403

        if not connection.is_active or not connection.notify_on_warning_signs:
            return jsonify(
                {
                    "error": "This caregiver is not set to receive warning sign notifications"
                }
            ), 400

        data = request.get_json()

        notification = WarningSignNotification(
            connection_id=connection_id,
            severity=data.get("severity", "medium"),
            signs_detected=data.get("signs_detected", ""),
            patient_notes=data.get("patient_notes"),
            notification_method=data.get("notification_method", "email"),
        )

        db.session.add(notification)
        db.session.commit()

        # TODO: Send actual email/SMS notification to caregiver
        logger.info(
            f"Warning sign notification created for caregiver {connection.caregiver_id}"
        )

        return jsonify(
            {"message": "Caregiver notified", "notification": notification.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error notifying caregiver: {str(e)}")
        return jsonify({"error": "Failed to notify caregiver"}), 500


@caregiver_connection_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_caregiver_notifications():
    """Get notifications for caregivers (list of patients with warning signs)"""
    try:
        caregiver_id = get_jwt_identity()

        # Find all patient connections
        connections = CaregiverConnection.query.filter_by(
            caregiver_id=caregiver_id, is_active=True
        ).all()

        notifications = []
        for conn in connections:
            patient = conn.patient
            unacknowledged = (
                WarningSignNotification.query.filter_by(
                    connection_id=conn.id, acknowledged_at=None
                )
                .order_by(WarningSignNotification.notified_at.desc())
                .all()
            )

            if unacknowledged:
                notifications.append(
                    {
                        "connection_id": conn.id,
                        "patient_id": patient.id,
                        "patient_name": f"{patient.first_name} {patient.last_name}".strip(),
                        "relationship": conn.relationship,
                        "warning_count": len(unacknowledged),
                        "latest_warning": unacknowledged[0].to_dict(),
                    }
                )

        return jsonify({"notifications": notifications}), 200
    except Exception as e:
        logger.error(f"Error fetching caregiver notifications: {str(e)}")
        return jsonify({"error": "Failed to fetch notifications"}), 500


@caregiver_connection_bp.route(
    "/warnings/<int:notification_id>/acknowledge", methods=["POST"]
)
@jwt_required()
def acknowledge_warning(notification_id):
    """Acknowledge a warning sign notification"""
    try:
        caregiver_id = get_jwt_identity()
        notification = WarningSignNotification.query.get_or_404(notification_id)

        # Verify caregiver access
        if notification.connection.caregiver_id != caregiver_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        notification.acknowledged_at = datetime.utcnow()
        notification.action_taken = data.get("action_taken")

        db.session.commit()

        logger.info(
            f"Warning notification {notification_id} acknowledged by caregiver {caregiver_id}"
        )

        return jsonify({"message": "Warning acknowledged"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error acknowledging warning: {str(e)}")
        return jsonify({"error": "Failed to acknowledge warning"}), 500


@caregiver_connection_bp.route("/share-results/<int:reminder_id>", methods=["POST"])
@jwt_required()
def share_reminder_results(reminder_id):
    """Share questionnaire/reminder results with caregivers"""
    try:
        patient_id = get_jwt_identity()
        reminder = Reminder.query.get_or_404(reminder_id)

        if reminder.user_id != patient_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        selected_caregivers = data.get("caregiver_ids", [])

        shared_count = 0
        for caregiver_id in selected_caregivers:
            connection = CaregiverConnection.query.filter_by(
                patient_id=patient_id, caregiver_id=caregiver_id, is_active=True
            ).first()

            if connection:
                # TODO: Create notification record for caregiver about shared results
                shared_count += 1

        logger.info(
            f"Reminder {reminder_id} results shared with {shared_count} caregivers"
        )

        return jsonify(
            {
                "message": f"Results shared with {shared_count} caregiver(s)",
                "shared_count": shared_count,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error sharing results: {str(e)}")
        return jsonify({"error": "Failed to share results"}), 500
