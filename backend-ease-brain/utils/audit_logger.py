"""
Audit logging module for tracking security-relevant events.
Logs authentication, authorization, and admin operations.
"""

import logging
from datetime import datetime
from flask import request, g
from functools import wraps

# Create audit logger
audit_logger = logging.getLogger("audit")


class AuditLog:
    """Structure for audit log entries"""

    def __init__(
        self,
        event_type: str,
        user_id: int = None,
        email: str = None,
        action: str = None,
        resource: str = None,
        status: str = "success",
        details: str = None,
        ip_address: str = None,
    ):
        self.timestamp = datetime.utcnow().isoformat()
        self.event_type = event_type  # "AUTH", "ADMIN", "ERROR"
        self.user_id = user_id
        self.email = email
        self.action = action  # "login", "signup", "create_user", "delete_user", etc.
        self.resource = resource  # "user", "dependent", "role", etc.
        self.status = status  # "success", "failure"
        self.details = details
        self.ip_address = ip_address or self._get_client_ip()

    @staticmethod
    def _get_client_ip() -> str:
        """Extract client IP from request, accounting for proxies"""
        if request:
            if request.environ.get("HTTP_CF_CONNECTING_IP"):
                return request.environ.get("HTTP_CF_CONNECTING_IP")  # Cloudflare
            if request.environ.get("HTTP_X_FORWARDED_FOR"):
                return request.environ.get("HTTP_X_FORWARDED_FOR").split(",")[0]
            return request.remote_addr or "unknown"
        return "unknown"

    def log(self):
        """Log the audit event"""
        message = (
            f"[{self.event_type}] {self.action} | "
            f"User: {self.user_id or self.email or 'anonymous'} | "
            f"Resource: {self.resource} | "
            f"Status: {self.status} | "
            f"IP: {self.ip_address}"
        )
        if self.details:
            message += f" | Details: {self.details}"

        if self.status == "failure":
            audit_logger.warning(message)
        else:
            audit_logger.info(message)


def audit(event_type: str, action: str, resource: str = None):
    """
    Decorator for auditing function calls

    Usage:
        @app.route('/api/users', methods=['POST'])
        @audit('ADMIN', 'create_user', 'user')
        def create_user():
            ...
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                result = f(*args, **kwargs)
                # Extract user_id from g if available (from JWT)
                user_id = getattr(g, "user_id", None)

                AuditLog(
                    event_type=event_type,
                    action=action,
                    resource=resource,
                    user_id=user_id,
                    status="success",
                ).log()

                return result
            except Exception as e:
                user_id = getattr(g, "user_id", None)
                AuditLog(
                    event_type=event_type,
                    action=action,
                    resource=resource,
                    user_id=user_id,
                    status="failure",
                    details=str(e),
                ).log()
                raise

        return decorated_function

    return decorator


def log_auth_event(
    action: str, email: str, status: str = "success", details: str = None
):
    """Log authentication events"""
    AuditLog(
        event_type="AUTH",
        action=action,
        resource="auth",
        email=email,
        status=status,
        details=details,
    ).log()


def log_admin_event(
    action: str,
    resource: str,
    user_id: int = None,
    status: str = "success",
    details: str = None,
):
    """Log admin operations"""
    AuditLog(
        event_type="ADMIN",
        action=action,
        resource=resource,
        user_id=user_id,
        status=status,
        details=details,
    ).log()


def configure_audit_logging(app):
    """Configure audit logging for the Flask app"""
    # Create audit log file handler
    import logging.handlers

    if not audit_logger.handlers:
        # Console handler for audit logs
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s - AUDIT - %(levelname)s - %(message)s"
        )
        console_handler.setFormatter(formatter)
        audit_logger.addHandler(console_handler)

        # File handler for audit logs (rotate daily)
        try:
            file_handler = logging.handlers.RotatingFileHandler(
                "logs/audit.log",
                maxBytes=10485760,  # 10MB
                backupCount=10,
            )
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            audit_logger.addHandler(file_handler)
        except Exception as e:
            app.logger.warning(f"Could not create audit log file: {e}")

        audit_logger.setLevel(logging.INFO)
