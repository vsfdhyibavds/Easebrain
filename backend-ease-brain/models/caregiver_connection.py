from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class CaregiverConnection(db.Model, SerializerMixin):
    """Links patients with caregivers for emergency alerts and warning sign notifications"""

    __tablename__ = "caregiver_connections"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    caregiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relationship details
    relationship = db.Column(
        db.String(100), nullable=True
    )  # e.g., "Family", "Friend", "Therapist", "Doctor"
    role = db.Column(
        db.String(50), nullable=True
    )  # e.g., "Primary", "Secondary", "Emergency"

    # Notification preferences
    notify_on_warning_signs = db.Column(db.Boolean, default=True)
    notify_on_crisis = db.Column(db.Boolean, default=True)
    notify_on_reminders = db.Column(db.Boolean, default=False)
    notify_on_story_share = db.Column(db.Boolean, default=False)

    # Emergency contact details (optional, for direct contact)
    phone_number = db.Column(db.String(20), nullable=True)
    email_address = db.Column(db.String(255), nullable=True)

    # Status and timestamps
    is_active = db.Column(db.Boolean, default=True)
    accepted_at = db.Column(
        db.DateTime, nullable=True
    )  # When caregiver accepts connection
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    patient = db.relationship("User", foreign_keys=[patient_id], backref="caregivers")
    caregiver = db.relationship("User", foreign_keys=[caregiver_id], backref="care_for")
    warning_notifications = db.relationship(
        "WarningSignNotification",
        back_populates="connection",
        cascade="all, delete-orphan",
    )

    serialize_rules = (
        "-patient.caregivers",
        "-caregiver.care_for",
        "-warning_notifications",
    )

    def __repr__(self):
        return f"<CaregiverConnection patient_id={self.patient_id} caregiver_id={self.caregiver_id}>"


class WarningSignNotification(db.Model, SerializerMixin):
    """Tracks when warning signs are detected and notifications sent to caregivers"""

    __tablename__ = "warning_sign_notifications"

    id = db.Column(db.Integer, primary_key=True)
    connection_id = db.Column(
        db.Integer, db.ForeignKey("caregiver_connections.id"), nullable=False
    )
    reminder_id = db.Column(db.Integer, db.ForeignKey("reminders.id"), nullable=True)

    # Warning sign details
    severity = db.Column(
        db.String(50), nullable=False
    )  # "low", "medium", "high", "critical"
    signs_detected = db.Column(
        db.Text, nullable=False
    )  # JSON or CSV of detected warning signs
    patient_notes = db.Column(db.Text, nullable=True)  # Patient's additional context

    # Notification tracking
    notified_at = db.Column(db.DateTime, default=datetime.utcnow)
    notification_method = db.Column(
        db.String(50), default="email"
    )  # "email", "sms", "both"
    acknowledged_at = db.Column(
        db.DateTime, nullable=True
    )  # When caregiver acknowledges
    action_taken = db.Column(db.Text, nullable=True)  # What action the caregiver took

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    connection = db.relationship(
        "CaregiverConnection", back_populates="warning_notifications"
    )
    reminder = db.relationship("Reminder", backref="caregiver_notifications")

    serialize_rules = ("-connection", "-reminder")

    def __repr__(self):
        return f"<WarningSignNotification connection_id={self.connection_id} severity={self.severity}>"
