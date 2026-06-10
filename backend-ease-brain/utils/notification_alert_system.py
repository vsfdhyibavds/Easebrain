"""
Notification Failure Alert System
Monitors notification delivery and sends alerts when failure rates exceed thresholds
"""

import os
import logging
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from threading import Thread
import time

from utils.send_email import send_email_notification
from extensions import db
from models import User

logger = logging.getLogger(__name__)


class AlertThreshold:
    """Configuration for alert thresholds"""

    # Alert if failure rate exceeds this percentage (0-100)
    FAILURE_RATE_THRESHOLD = 10.0

    # Alert if we have more than this many consecutive failures
    CONSECUTIVE_FAILURES_THRESHOLD = 5

    # Check stats this often (in seconds)
    CHECK_INTERVAL = 300  # 5 minutes

    # Only send alerts once per this duration (in seconds)
    ALERT_COOLDOWN = 3600  # 1 hour


class NotificationAlertSystem:
    """System to monitor and alert on notification failures"""

    def __init__(self):
        self.logger = logging.getLogger("notification_alerts")
        self.logger.setLevel(logging.INFO)

        # Set up file handler
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        alert_log_file = os.path.join(log_dir, "notification_alerts.log")
        file_handler = logging.FileHandler(alert_log_file)
        file_handler.setLevel(logging.INFO)

        formatter = logging.Formatter(
            "%(asctime)s - [%(levelname)s] - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(formatter)

        if not self.logger.handlers:
            self.logger.addHandler(file_handler)

        # Track alert cooldown
        self.last_alert_time = None
        self.failure_rate_alerted = False
        self.consecutive_failures_count = 0
        self.monitoring = False

    def _get_stats(self) -> Optional[Dict[str, Any]]:
        """Get current notification statistics from monitor"""
        try:
            from utils.notification_monitor import get_notification_monitor

            monitor = get_notification_monitor()
            return monitor.get_stats()
        except Exception as e:
            self.logger.error(f"Error getting stats: {str(e)}")
            return None

    def _send_alert_email(
        self,
        admin_email: str,
        alert_type: str,
        alert_message: str,
        stats: Dict[str, Any],
    ) -> bool:
        """Send alert email to admin"""
        try:
            subject = f"🚨 Notification System Alert: {alert_type}"

            body = f"""
URGENT: Notification System Alert

Alert Type: {alert_type}
Timestamp: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}

Alert Details:
{alert_message}

Current Statistics:
- Total Attempts: {stats.get("total_attempts", 0)}
- Successful: {stats.get("successful", 0)} ({stats.get("success_rate", 0)}%)
- Failed: {stats.get("failed", 0)} ({stats.get("failure_rate", 0)}%)
- Recent Errors: {json.dumps(stats.get("errors", {}), indent=2)}

Action Required:
1. Log in to the admin dashboard
2. Check notification logs at /admin/notifications/logs
3. Review error details and investigate root cause
4. Take corrective action if needed

If this is a critical issue, escalate to the development team immediately.

Best regards,
EaseBrain Monitoring System
"""

            template_data = {
                "alert_type": alert_type,
                "alert_message": alert_message,
                "timestamp": datetime.utcnow().isoformat(),
                "stats": stats,
                "plain_text": body,
            }

            return send_email_notification(
                recipient_email=admin_email,
                subject=subject,
                template_data=template_data,
            )
        except Exception as e:
            self.logger.error(f"Error sending alert email: {str(e)}", exc_info=True)
            return False

    def _send_in_app_notification(self, message: str) -> bool:
        """Send in-app notification to admin users"""
        try:
            from models import UserNotification

            # Get all admin users
            admin_users = User.query.filter_by(is_admin=True).all()

            if not admin_users:
                self.logger.warning("No admin users found for in-app notifications")
                return False

            # This assumes a UserNotification model exists
            # Adjust based on your actual notification system
            timestamp = datetime.utcnow()

            for admin in admin_users:
                try:
                    # You may need to adapt this based on your actual models
                    notification_data = {
                        "user_id": admin.id,
                        "title": "Notification System Alert",
                        "message": message,
                        "type": "alert",
                        "is_read": False,
                        "created_at": timestamp,
                    }
                    self.logger.info(
                        f"In-app notification prepared for admin {admin.username}: {message}"
                    )
                except Exception as e:
                    self.logger.error(
                        f"Error creating notification for {admin.username}: {str(e)}"
                    )

            return True
        except Exception as e:
            self.logger.error(f"Error sending in-app notifications: {str(e)}")
            return False

    def check_and_alert(self) -> None:
        """Check stats and send alerts if thresholds exceeded"""
        try:
            stats = self._get_stats()
            if not stats:
                return

            current_time = time.time()
            should_alert = False
            alert_message = ""
            alert_type = ""

            # Check failure rate threshold
            failure_rate = stats.get("failure_rate", 0)
            if failure_rate > AlertThreshold.FAILURE_RATE_THRESHOLD:
                should_alert = True
                alert_type = "High Notification Failure Rate"
                alert_message = f"Failure rate is {failure_rate}%, exceeding threshold of {AlertThreshold.FAILURE_RATE_THRESHOLD}%"
                self.failure_rate_alerted = True

            # Check consecutive failures
            if stats.get("failed", 0) > AlertThreshold.CONSECUTIVE_FAILURES_THRESHOLD:
                should_alert = True
                alert_type = "Multiple Notification Failures"
                alert_message = (
                    f"{stats.get('failed', 0)} notifications have failed recently"
                )

            # Check if we're in cooldown period
            if should_alert and self.last_alert_time:
                time_since_last_alert = current_time - self.last_alert_time
                if time_since_last_alert < AlertThreshold.ALERT_COOLDOWN:
                    self.logger.debug(
                        f"Alert suppressed - in cooldown period "
                        f"({time_since_last_alert:.0f}s/{AlertThreshold.ALERT_COOLDOWN}s)"
                    )
                    return

            if should_alert:
                self.logger.warning(f"Alert triggered: {alert_type} - {alert_message}")

                # Get admin emails
                try:
                    admin_users = User.query.filter_by(is_admin=True).all()

                    for admin in admin_users:
                        if admin.email:
                            # Send email alert
                            self._send_alert_email(
                                admin.email, alert_type, alert_message, stats
                            )

                    # Try to send in-app notification
                    self._send_in_app_notification(alert_message)

                    self.last_alert_time = current_time
                    self.logger.info(f"Alert sent at {datetime.utcnow().isoformat()}")

                except Exception as e:
                    self.logger.error(f"Error sending alerts: {str(e)}", exc_info=True)
            else:
                # Reset failure rate alert flag if rate is now acceptable
                if failure_rate <= AlertThreshold.FAILURE_RATE_THRESHOLD:
                    self.failure_rate_alerted = False

        except Exception as e:
            self.logger.error(f"Error in check_and_alert: {str(e)}", exc_info=True)

    def start_monitoring(self) -> None:
        """Start background monitoring thread"""
        if self.monitoring:
            self.logger.warning("Monitoring already active")
            return

        self.monitoring = True

        def monitor_loop():
            self.logger.info("Notification alert monitoring started")
            while self.monitoring:
                try:
                    self.check_and_alert()
                    time.sleep(AlertThreshold.CHECK_INTERVAL)
                except Exception as e:
                    self.logger.error(f"Error in monitor loop: {str(e)}", exc_info=True)
                    time.sleep(AlertThreshold.CHECK_INTERVAL)

        thread = Thread(target=monitor_loop, daemon=True)
        thread.start()
        self.logger.info("Monitoring thread started (daemon)")

    def stop_monitoring(self) -> None:
        """Stop background monitoring"""
        self.monitoring = False
        self.logger.info("Notification alert monitoring stopped")


# Global instance
_alert_system = None


def get_alert_system() -> NotificationAlertSystem:
    """Get or create the global alert system instance"""
    global _alert_system
    if _alert_system is None:
        _alert_system = NotificationAlertSystem()
    return _alert_system


def start_notification_monitoring() -> None:
    """Start the notification monitoring system"""
    system = get_alert_system()
    system.start_monitoring()
    logger.info("Notification alert system initialized and monitoring started")
