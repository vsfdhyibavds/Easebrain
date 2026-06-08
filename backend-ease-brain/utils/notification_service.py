"""
Notification Service for EaseBrain
Handles sending notifications to caregivers via email and SMS
"""

import os
import logging
import time
from datetime import datetime
from utils.send_email import send_email_notification
from utils.notification_monitor import (
    get_notification_monitor,
    NotificationType,
    log_notification_attempt,
    log_notification_success,
    log_notification_failure,
    log_notification_skipped,
    log_email_service_error,
)
from models import User, CaregiverConnection, WarningSignNotification, Reminder
from extensions import db

logger = logging.getLogger(__name__)
monitor = get_notification_monitor()


class NotificationService:
    """Service to manage sending notifications to caregivers"""

    @staticmethod
    def send_warning_sign_notification(
        connection_id: int,
        severity: str,
        signs_detected: str,
        patient_notes: str = None,
        reminder_id: int = None,
    ):
        """
        Send warning sign notification to a caregiver

        Args:
            connection_id: CaregiverConnection ID
            severity: "low", "medium", "high", "critical"
            signs_detected: Comma-separated or JSON list of detected signs
            patient_notes: Optional notes from patient
            reminder_id: Optional associated reminder
        """
        start_time = time.time()

        try:
            connection = CaregiverConnection.query.get(connection_id)
            if not connection:
                logger.error(f"Connection {connection_id} not found")
                log_notification_failure(
                    NotificationType.WARNING_SIGN,
                    0,
                    "unknown",
                    "Connection not found",
                    "connection_not_found",
                    {"connection_id": connection_id}
                )
                return False

            # Check if caregiver wants notifications
            if not connection.notify_on_warning_signs:
                log_notification_skipped(
                    NotificationType.WARNING_SIGN,
                    connection.caregiver_id,
                    "Caregiver has disabled warning sign notifications",
                    {"connection_id": connection_id}
                )
                logger.info(
                    f"Caregiver {connection.caregiver_id} has disabled warning notifications"
                )
                return False

            caregiver = connection.caregiver
            patient = connection.patient

            if not caregiver or not caregiver.email:
                log_notification_failure(
                    NotificationType.WARNING_SIGN,
                    connection.caregiver_id,
                    "unknown",
                    "Caregiver has no email",
                    "no_email",
                    {"connection_id": connection_id}
                )
                logger.error(f"Caregiver {connection.caregiver_id} has no email")
                return False

            # Log attempt
            log_notification_attempt(
                NotificationType.WARNING_SIGN,
                caregiver.id,
                caregiver.email,
                connection_id=connection_id,
                severity=severity,
                metadata={
                    "patient_id": patient.id if patient else None,
                    "reminder_id": reminder_id
                }
            )

            # Create notification record
            notification = WarningSignNotification(
                connection_id=connection_id,
                reminder_id=reminder_id,
                severity=severity,
                signs_detected=signs_detected,
                patient_notes=patient_notes,
                notification_method="email",
            )
            db.session.add(notification)
            db.session.commit()

            # Send email
            success = _send_warning_sign_email(
                caregiver=caregiver,
                patient=patient,
                severity=severity,
                signs_detected=signs_detected,
                patient_notes=patient_notes,
                connection=connection,
            )

            delivery_time = (time.time() - start_time) * 1000  # Convert to ms

            if success:
                log_notification_success(
                    NotificationType.WARNING_SIGN,
                    caregiver.id,
                    caregiver.email,
                    delivery_time,
                    metadata={"connection_id": connection_id, "severity": severity}
                )
                logger.info(
                    f"Warning notification sent to {caregiver.email} "
                    f"for patient {patient.username} in {delivery_time:.2f}ms"
                )
                return True
            else:
                log_notification_failure(
                    NotificationType.WARNING_SIGN,
                    caregiver.id,
                    caregiver.email,
                    "Email sending returned False",
                    "send_failed",
                    {"connection_id": connection_id}
                )
                logger.warning(
                    f"Failed to send warning notification to {caregiver.email}"
                )
                return False

        except Exception as e:
            delivery_time = (time.time() - start_time) * 1000
            log_notification_failure(
                NotificationType.WARNING_SIGN,
                connection.caregiver_id if connection else 0,
                connection.caregiver.email if connection and connection.caregiver else "unknown",
                str(e),
                type(e).__name__,
                {"connection_id": connection_id, "delivery_time_ms": delivery_time}
            )
            logger.error(f"Error sending warning notification: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def send_reminder_shared_notification(
        reminder_id: int, patient_id: int, caregiver_ids: list
    ):
        """
        Send notification when reminder results are shared with caregivers

        Args:
            reminder_id: Reminder ID
            patient_id: Patient ID
            caregiver_ids: List of caregiver IDs to notify
        """
        start_time = time.time()

        try:
            reminder = Reminder.query.get(reminder_id)
            patient = User.query.get(patient_id)

            if not reminder or not patient:
                log_email_service_error(
                    f"Reminder {reminder_id} or Patient {patient_id} not found"
                )
                logger.error(
                    f"Reminder {reminder_id} or Patient {patient_id} not found"
                )
                return False

            sent_count = 0
            for caregiver_id in caregiver_ids:
                try:
                    connection = CaregiverConnection.query.filter_by(
                        patient_id=patient_id, caregiver_id=caregiver_id, is_active=True
                    ).first()

                    if not connection:
                        logger.warning(
                            f"No connection between patient {patient_id} and caregiver {caregiver_id}"
                        )
                        continue

                    # Check if caregiver wants notifications
                    if not connection.notify_on_reminders:
                        log_notification_skipped(
                            NotificationType.REMINDER_SHARED,
                            caregiver_id,
                            "Caregiver has disabled reminder notifications",
                            {"reminder_id": reminder_id, "patient_id": patient_id}
                        )
                        logger.info(
                            f"Caregiver {caregiver_id} has disabled reminder notifications"
                        )
                        continue

                    caregiver = connection.caregiver
                    if not caregiver or not caregiver.email:
                        log_notification_failure(
                            NotificationType.REMINDER_SHARED,
                            caregiver_id,
                            "unknown",
                            "Caregiver has no email",
                            "no_email",
                            {"reminder_id": reminder_id}
                        )
                        logger.error(f"Caregiver {caregiver_id} has no email")
                        continue

                    # Log attempt
                    log_notification_attempt(
                        NotificationType.REMINDER_SHARED,
                        caregiver.id,
                        caregiver.email,
                        metadata={
                            "reminder_id": reminder_id,
                            "patient_id": patient_id
                        }
                    )

                    # Send email
                    success = _send_reminder_shared_email(
                        caregiver=caregiver,
                        patient=patient,
                        reminder=reminder,
                        connection=connection,
                    )

                    delivery_time = (time.time() - start_time) * 1000

                    if success:
                        sent_count += 1
                        log_notification_success(
                            NotificationType.REMINDER_SHARED,
                            caregiver.id,
                            caregiver.email,
                            delivery_time,
                            metadata={"reminder_id": reminder_id}
                        )
                        logger.info(
                            f"Reminder shared notification sent to {caregiver.email} "
                            f"for patient {patient.username} in {delivery_time:.2f}ms"
                        )
                    else:
                        log_notification_failure(
                            NotificationType.REMINDER_SHARED,
                            caregiver.id,
                            caregiver.email,
                            "Email sending returned False",
                            "send_failed",
                            {"reminder_id": reminder_id}
                        )

                except Exception as inner_e:
                    delivery_time = (time.time() - start_time) * 1000
                    log_notification_failure(
                        NotificationType.REMINDER_SHARED,
                        caregiver_id,
                        "unknown",
                        str(inner_e),
                        type(inner_e).__name__,
                        {"reminder_id": reminder_id, "delivery_time_ms": delivery_time}
                    )
                    logger.error(
                        f"Error sending reminder notification to caregiver {caregiver_id}: {str(inner_e)}",
                        exc_info=True
                    )
                    continue

            return sent_count

        except Exception as e:
            delivery_time = (time.time() - start_time) * 1000
            log_email_service_error(
                str(e),
                "reminder_notification_error",
                {"reminder_id": reminder_id, "delivery_time_ms": delivery_time}
            )
            logger.error(
                f"Error sending reminder shared notification: {str(e)}", exc_info=True
            )
            return 0

    @staticmethod
    def send_crisis_notification(
        connection_id: int,
        crisis_description: str,
        patient_notes: str = None,
    ):
        """
        Send crisis alert notification to caregiver

        Args:
            connection_id: CaregiverConnection ID
            crisis_description: Description of the crisis event
            patient_notes: Optional context from patient
        """
        start_time = time.time()

        try:
            connection = CaregiverConnection.query.get(connection_id)
            if not connection:
                log_notification_failure(
                    NotificationType.CRISIS_ALERT,
                    0,
                    "unknown",
                    "Connection not found",
                    "connection_not_found",
                    {"connection_id": connection_id}
                )
                logger.error(f"Connection {connection_id} not found")
                return False

            # Check if caregiver wants crisis notifications
            if not connection.notify_on_crisis:
                log_notification_skipped(
                    NotificationType.CRISIS_ALERT,
                    connection.caregiver_id,
                    "Caregiver has disabled crisis notifications",
                    {"connection_id": connection_id}
                )
                logger.info(
                    f"Caregiver {connection.caregiver_id} has disabled crisis notifications"
                )
                return False

            caregiver = connection.caregiver
            patient = connection.patient

            if not caregiver or not caregiver.email:
                log_notification_failure(
                    NotificationType.CRISIS_ALERT,
                    connection.caregiver_id,
                    "unknown",
                    "Caregiver has no email",
                    "no_email",
                    {"connection_id": connection_id}
                )
                logger.error(f"Caregiver {connection.caregiver_id} has no email")
                return False

            # Log attempt - crisis notifications are urgent
            log_notification_attempt(
                NotificationType.CRISIS_ALERT,
                caregiver.id,
                caregiver.email,
                connection_id=connection_id,
                metadata={
                    "patient_id": patient.id if patient else None,
                    "urgent": True
                }
            )

            # Send crisis alert email
            success = _send_crisis_alert_email(
                caregiver=caregiver,
                patient=patient,
                crisis_description=crisis_description,
                patient_notes=patient_notes,
                connection=connection,
            )

            delivery_time = (time.time() - start_time) * 1000

            if success:
                log_notification_success(
                    NotificationType.CRISIS_ALERT,
                    caregiver.id,
                    caregiver.email,
                    delivery_time,
                    metadata={"connection_id": connection_id, "urgent": True}
                )
                logger.info(
                    f"Crisis notification sent to {caregiver.email} "
                    f"for patient {patient.username} in {delivery_time:.2f}ms"
                )
                return True
            else:
                log_notification_failure(
                    NotificationType.CRISIS_ALERT,
                    caregiver.id,
                    caregiver.email,
                    "Email sending returned False",
                    "send_failed",
                    {"connection_id": connection_id}
                )
                logger.warning(
                    f"Failed to send crisis notification to {caregiver.email}"
                )
                return False

        except Exception as e:
            delivery_time = (time.time() - start_time) * 1000
            log_notification_failure(
                NotificationType.CRISIS_ALERT,
                connection.caregiver_id if connection else 0,
                connection.caregiver.email if connection and connection.caregiver else "unknown",
                str(e),
                type(e).__name__,
                {"connection_id": connection_id, "delivery_time_ms": delivery_time}
            )
            logger.error(f"Error sending crisis notification: {str(e)}", exc_info=True)
            return False
                patient=patient,
                crisis_description=crisis_description,
                patient_notes=patient_notes,
                connection=connection,
            )

            if success:
                logger.info(
                    f"Crisis notification sent to {caregiver.email} "
                    f"for patient {patient.username}"
                )
                return True
            else:
                logger.warning(
                    f"Failed to send crisis notification to {caregiver.email}"
                )
                return False

        except Exception as e:
            logger.error(f"Error sending crisis notification: {str(e)}", exc_info=True)
            return False


# ============================================================================
# EMAIL TEMPLATE FUNCTIONS
# ============================================================================


def _send_warning_sign_email(
    caregiver: User,
    patient: User,
    severity: str,
    signs_detected: str,
    patient_notes: str,
    connection: CaregiverConnection,
):
    """Send warning sign detected email"""
    try:
        severity_badge = {
            "low": "🟢 Low",
            "medium": "🟡 Medium",
            "high": "🔴 High",
            "critical": "🚨 Critical",
        }.get(severity, severity)

        subject = (
            f"⚠️ Warning Signs Detected for {patient.first_name or patient.username}"
        )

        # Build email body
        body = f"""Hello {caregiver.first_name or caregiver.username},

We've detected warning signs in messages from {patient.first_name or patient.username}.

**Severity Level**: {severity_badge}

**Signs Detected**:
{signs_detected}

{f"**Patient Notes**: {patient_notes}" if patient_notes else ""}

**What You Can Do**:
1. Log in to EaseBrain to view full details
2. Reach out to {patient.first_name or patient.username} to check in
3. Consider escalating if severity is high or critical

**Your Connection with {patient.first_name or patient.username}**:
- Relationship: {connection.relationship or "Not specified"}
- Role: {connection.role or "Not specified"}

If you have any concerns or questions, please contact our support team.

Best regards,
The EaseBrain Team"""

        template_data = {
            "recipient_name": caregiver.first_name or caregiver.username,
            "subject": subject,
            "severity": severity,
            "severity_badge": severity_badge,
            "signs_detected": signs_detected,
            "patient_name": patient.first_name or patient.username,
            "patient_notes": patient_notes,
            "plain_text": body,
        }

        return send_email_notification(
            recipient_email=caregiver.email,
            subject=subject,
            template_data=template_data,
        )
    except Exception as e:
        logger.error(f"Error sending warning sign email: {str(e)}", exc_info=True)
        return False


def _send_reminder_shared_email(
    caregiver: User, patient: User, reminder: Reminder, connection: CaregiverConnection
):
    """Send reminder shared notification email"""
    try:
        subject = f"📊 {patient.first_name or patient.username} Shared Their {reminder.category} Reminder Results"

        body = f"""Hello {caregiver.first_name or caregiver.username},

Good news! {patient.first_name or patient.username} has shared their {reminder.category} reminder results with you.

**Reminder Details**:
- Category: {reminder.category}
- Type: {reminder.reminder_type or "General"}
- Shared on: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}

**What This Means**:
{patient.first_name or patient.username} is actively tracking their {reminder.category} and wants to keep you informed about their progress.

Log in to EaseBrain to view the full details and results.

**Your Connection with {patient.first_name or patient.username}**:
- Relationship: {connection.relationship or "Not specified"}
- Role: {connection.role or "Not specified"}

Thank you for being a supportive part of their wellness journey!

Best regards,
The EaseBrain Team"""

        template_data = {
            "recipient_name": caregiver.first_name or caregiver.username,
            "subject": subject,
            "patient_name": patient.first_name or patient.username,
            "reminder_category": reminder.category,
            "reminder_type": reminder.reminder_type,
            "shared_at": datetime.now().isoformat(),
            "plain_text": body,
        }

        return send_email_notification(
            recipient_email=caregiver.email,
            subject=subject,
            template_data=template_data,
        )
    except Exception as e:
        logger.error(f"Error sending reminder shared email: {str(e)}", exc_info=True)
        return False


def _send_crisis_alert_email(
    caregiver: User,
    patient: User,
    crisis_description: str,
    patient_notes: str,
    connection: CaregiverConnection,
):
    """Send crisis alert email"""
    try:
        subject = (
            f"🚨 URGENT: Crisis Alert for {patient.first_name or patient.username}"
        )

        body = f"""Hello {caregiver.first_name or caregiver.username},

URGENT: A crisis situation has been flagged for {patient.first_name or patient.username}.

**ALERT**: {crisis_description}

{f"**Additional Context**: {patient_notes}" if patient_notes else ""}

**IMMEDIATE ACTIONS**:
1. Try to contact {patient.first_name or patient.username} immediately
2. If you cannot reach them, consider contacting emergency services
3. Log in to EaseBrain for more detailed information

**Crisis Resources**:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

**Your Connection with {patient.first_name or patient.username}**:
- Relationship: {connection.relationship or "Not specified"}
- Role: {connection.role or "Not specified"}

This is an urgent matter. Please respond immediately.

Best regards,
The EaseBrain Team"""

        template_data = {
            "recipient_name": caregiver.first_name or caregiver.username,
            "subject": subject,
            "crisis_description": crisis_description,
            "patient_name": patient.first_name or patient.username,
            "patient_notes": patient_notes,
            "plain_text": body,
        }

        return send_email_notification(
            recipient_email=caregiver.email,
            subject=subject,
            template_data=template_data,
        )
    except Exception as e:
        logger.error(f"Error sending crisis alert email: {str(e)}", exc_info=True)
        return False
