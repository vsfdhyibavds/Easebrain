from extensions import db
from sqlalchemy_serializer import SerializerMixin


class UserSettings(db.Model, SerializerMixin):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

    # Profile settings
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    timezone = db.Column(db.String(50), default="UTC")

    # Notification preferences
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=False)
    push_notifications = db.Column(db.Boolean, default=True)

    # Theme preference
    theme = db.Column(db.String(20), default="light")

    # Relationship to user
    user = db.relationship("User", backref=db.backref("settings", uselist=False))

    serialize_rules = ("-user",)

    def __repr__(self):
        return f"<UserSettings user_id={self.user_id}>"
