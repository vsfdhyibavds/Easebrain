from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timedelta
from utils.send_email import send_email_notification
from utils.send_sms import send_sms_notification
from utils.send_push import send_push_notification


class Reminder(db.Model, SerializerMixin):
    __tablename__ = "reminders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    remind_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Notification preferences
    notification_email = db.Column(db.Boolean, default=True)
    notification_sms = db.Column(db.Boolean, default=False)
    notification_push = db.Column(db.Boolean, default=False)

    # Reminder status
    done = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), default="medium")  # low, medium, high
    timezone = db.Column(db.String(100), default="UTC")
    recurring = db.Column(
        db.String(20), default="none"
    )  # none, daily, weekly, monthly, custom
    recurring_interval = db.Column(db.Integer)  # For custom recurring reminders

    user = db.relationship("User", backref="reminders")

    serialize_rules = ("-user.reminders",)

    def send_notifications(self):
        # Email
        if self.notification_email and self.user and hasattr(self.user, "email"):
            send_email_notification(
                recipient_email=self.user.email,
                subject=f"Reminder: {self.title}",
                template_data={
                    "recipient_name": getattr(self.user, "name", "User"),
                    "subject": f"Reminder: {self.title}",
                    "plain_text": f"{self.description}",
                },
            )
        # SMS
        if self.notification_sms and self.user and hasattr(self.user, "phone"):
            send_sms_notification(
                phone_number=self.user.phone,
                message=f"Reminder: {self.title} - {self.description}",
            )
        # Push
        if self.notification_push:
            send_push_notification(
                user_id=self.user_id,
                title=f"Reminder: {self.title}",
                message=self.description,
            )

    @staticmethod
    def process_due_reminders(session):
        now = datetime.utcnow()
        due_reminders = (
            session.query(Reminder)
            .filter(Reminder.remind_at <= now, not Reminder.done)
            .all()
        )
        for reminder in due_reminders:
            reminder.send_notifications()
            # Mark as done or reschedule if recurring
            if (
                hasattr(reminder, "recurring")
                and reminder.recurring
                and reminder.recurring != "none"
            ):
                # Example: daily, weekly, monthly, custom
                if reminder.recurring == "daily":
                    reminder.remind_at += timedelta(days=1)
                elif reminder.recurring == "weekly":
                    reminder.remind_at += timedelta(weeks=1)
                elif reminder.recurring == "monthly":
                    reminder.remind_at += timedelta(days=30)
                elif reminder.recurring == "custom" and hasattr(
                    reminder, "recurring_interval"
                ):
                    reminder.remind_at += timedelta(days=reminder.recurring_interval)
                else:
                    reminder.done = True
            else:
                reminder.done = True
            session.commit()
