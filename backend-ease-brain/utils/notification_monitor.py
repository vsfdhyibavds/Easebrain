"""
Notification Monitoring and Logging System
Tracks notification delivery, failures, and performance metrics
"""

import os
import logging
import json
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Any
from extensions import db


class NotificationStatus(Enum):
    """Status of notification sending"""

    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    BOUNCED = "bounced"
    OPENED = "opened"
    CLICKED = "clicked"


class NotificationType(Enum):
    """Types of notifications"""

    WARNING_SIGN = "warning_sign"
    REMINDER_SHARED = "reminder_shared"
    CRISIS_ALERT = "crisis_alert"


class NotificationMonitor:
    """Monitor and track notification delivery and performance"""

    def __init__(self):
        """Initialize notification monitor with rotating file handler"""
        self.logger = logging.getLogger("notification_monitor")
        self.logger.setLevel(logging.DEBUG)

        # Create logs directory if it doesn't exist
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Set up file handler for notifications
        notification_log_file = os.path.join(log_dir, "notifications.log")
        file_handler = logging.FileHandler(notification_log_file)
        file_handler.setLevel(logging.DEBUG)

        # Set up formatter
        formatter = logging.Formatter(
            "%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(formatter)

        # Add handler to logger
        if not self.logger.handlers:
            self.logger.addHandler(file_handler)

        # In-memory stats for quick access
        self.stats = {
            "total_attempts": 0,
            "successful": 0,
            "failed": 0,
            "by_type": {},
            "by_status": {},
            "errors": {},
        }

    def log_notification_attempt(
        self,
        notification_type: NotificationType,
        recipient_id: int,
        recipient_email: str,
        connection_id: Optional[int] = None,
        severity: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log a notification sending attempt"""
        self.stats["total_attempts"] += 1

        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "notification_attempt",
            "type": notification_type.value,
            "recipient_id": recipient_id,
            "recipient_email": recipient_email,
            "connection_id": connection_id,
            "severity": severity,
            "metadata": metadata or {},
        }

        self.logger.info(f"Notification Attempt: {json.dumps(log_data)}")

    def log_notification_success(
        self,
        notification_type: NotificationType,
        recipient_id: int,
        recipient_email: str,
        delivery_time_ms: float,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log successful notification delivery"""
        self.stats["successful"] += 1
        self.stats["by_type"][notification_type.value] = (
            self.stats["by_type"].get(notification_type.value, 0) + 1
        )

        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "notification_success",
            "type": notification_type.value,
            "status": NotificationStatus.SENT.value,
            "recipient_id": recipient_id,
            "recipient_email": recipient_email,
            "delivery_time_ms": delivery_time_ms,
            "metadata": metadata or {},
        }

        self.logger.info(f"Notification Success: {json.dumps(log_data)}")

    def log_notification_failure(
        self,
        notification_type: NotificationType,
        recipient_id: int,
        recipient_email: str,
        error_message: str,
        error_type: str = "unknown",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log failed notification delivery"""
        self.stats["failed"] += 1
        self.stats["errors"][error_type] = self.stats["errors"].get(error_type, 0) + 1

        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "notification_failure",
            "type": notification_type.value,
            "status": NotificationStatus.FAILED.value,
            "recipient_id": recipient_id,
            "recipient_email": recipient_email,
            "error_type": error_type,
            "error_message": error_message,
            "metadata": metadata or {},
        }

        self.logger.error(f"Notification Failure: {json.dumps(log_data)}")

    def log_notification_skipped(
        self,
        notification_type: NotificationType,
        recipient_id: int,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log skipped notification (e.g., user has disabled notifications)"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "notification_skipped",
            "type": notification_type.value,
            "recipient_id": recipient_id,
            "reason": reason,
            "metadata": metadata or {},
        }

        self.logger.info(f"Notification Skipped: {json.dumps(log_data)}")

    def log_email_service_error(
        self,
        error_message: str,
        error_type: str = "email_service",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log email service errors (SendGrid, connection issues, etc.)"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "email_service_error",
            "error_type": error_type,
            "error_message": error_message,
            "metadata": metadata or {},
        }

        self.logger.error(f"Email Service Error: {json.dumps(log_data)}")

    def get_stats(self) -> Dict[str, Any]:
        """Get current notification statistics"""
        stats = self.stats.copy()
        stats["timestamp"] = datetime.utcnow().isoformat()

        if stats["total_attempts"] > 0:
            stats["success_rate"] = round(
                (stats["successful"] / stats["total_attempts"]) * 100, 2
            )
            stats["failure_rate"] = round(
                (stats["failed"] / stats["total_attempts"]) * 100, 2
            )

        return stats

    def reset_stats(self) -> None:
        """Reset statistics counters"""
        self.stats = {
            "total_attempts": 0,
            "successful": 0,
            "failed": 0,
            "by_type": {},
            "by_status": {},
            "errors": {},
        }
        self.logger.info("Notification statistics reset")


# Global instance
_monitor = None


def get_notification_monitor() -> NotificationMonitor:
    """Get or create the global notification monitor instance"""
    global _monitor
    if _monitor is None:
        _monitor = NotificationMonitor()
    return _monitor


# Convenience functions
def log_notification_attempt(
    notification_type, recipient_id, recipient_email, **kwargs
):
    """Convenience function to log notification attempt"""
    get_notification_monitor().log_notification_attempt(
        notification_type, recipient_id, recipient_email, **kwargs
    )


def log_notification_success(
    notification_type, recipient_id, recipient_email, delivery_time_ms, **kwargs
):
    """Convenience function to log successful notification"""
    get_notification_monitor().log_notification_success(
        notification_type, recipient_id, recipient_email, delivery_time_ms, **kwargs
    )


def log_notification_failure(
    notification_type, recipient_id, recipient_email, error_message, **kwargs
):
    """Convenience function to log failed notification"""
    get_notification_monitor().log_notification_failure(
        notification_type, recipient_id, recipient_email, error_message, **kwargs
    )


def log_notification_skipped(notification_type, recipient_id, reason, **kwargs):
    """Convenience function to log skipped notification"""
    get_notification_monitor().log_notification_skipped(
        notification_type, recipient_id, reason, **kwargs
    )


def log_email_service_error(error_message, **kwargs):
    """Convenience function to log email service error"""
    get_notification_monitor().log_email_service_error(error_message, **kwargs)
