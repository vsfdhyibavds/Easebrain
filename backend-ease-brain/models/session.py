"""
Session Management utilities for EaseBrain.
Tracks active sessions, token revocation, and session security.
"""

from datetime import datetime, timedelta
from extensions import db


class SessionToken(db.Model):
    """
    Track issued tokens for session management and revocation.
    Useful for logout functionality and detecting expired sessions.
    """

    __tablename__ = "session_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token_jti = db.Column(db.String(255), unique=True, nullable=False)  # JWT ID
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(255))
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_revoked = db.Column(db.Boolean, default=False)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SessionToken user_id={self.user_id} jti={self.token_jti[:8]}...>"

    @staticmethod
    def create_session(
        user_id, token_jti, expires_in_seconds, ip_address=None, user_agent=None
    ):
        """Create a new session token record."""
        session = SessionToken(
            user_id=user_id,
            token_jti=token_jti,
            expires_at=datetime.utcnow() + timedelta(seconds=expires_in_seconds),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.session.add(session)
        db.session.commit()
        return session

    @staticmethod
    def revoke_session(token_jti):
        """Revoke a session (logout)."""
        session = SessionToken.query.filter_by(token_jti=token_jti).first()
        if session:
            session.is_revoked = True
            db.session.commit()
            return True
        return False

    @staticmethod
    def revoke_all_user_sessions(user_id):
        """Revoke all sessions for a user (security breach, password change, etc)."""
        sessions = SessionToken.query.filter_by(user_id=user_id, is_revoked=False).all()
        for session in sessions:
            session.is_revoked = True
        db.session.commit()
        return len(sessions)

    @staticmethod
    def is_session_valid(token_jti):
        """Check if a session is still valid (not revoked and not expired)."""
        session = SessionToken.query.filter_by(token_jti=token_jti).first()
        if not session:
            return False

        if session.is_revoked:
            return False

        if datetime.utcnow() > session.expires_at:
            return False

        return True

    @staticmethod
    def update_activity(token_jti):
        """Update last activity time for a session (keep-alive)."""
        session = SessionToken.query.filter_by(token_jti=token_jti).first()
        if session:
            session.last_activity = datetime.utcnow()
            db.session.commit()


class AuditLog(db.Model):
    """
    Log security-relevant actions for audit trail.
    Tracks login attempts, role changes, permission changes, etc.
    """

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(
        db.String(100), nullable=False
    )  # e.g., 'LOGIN', 'LOGOUT', 'ROLE_ASSIGNED'
    resource_type = db.Column(db.String(50))  # e.g., 'user', 'post', 'admin'
    resource_id = db.Column(db.Integer)  # ID of affected resource
    status = db.Column(db.String(20))  # 'success', 'failure'
    details = db.Column(db.Text)  # JSON details
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<AuditLog action={self.action} user_id={self.user_id} timestamp={self.timestamp}>"

    @staticmethod
    def log(
        user_id,
        action,
        status="success",
        resource_type=None,
        resource_id=None,
        details=None,
        ip_address=None,
        user_agent=None,
    ):
        """Create an audit log entry."""
        log = AuditLog(
            user_id=user_id,
            action=action,
            status=status,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_user_activity(user_id, limit=50):
        """Get recent activity for a user."""
        return (
            AuditLog.query.filter_by(user_id=user_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_action_logs(action, limit=100):
        """Get all logs for a specific action."""
        return (
            AuditLog.query.filter_by(action=action)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
            .all()
        )
