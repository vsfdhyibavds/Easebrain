import secrets
from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timedelta

# import secrets


class UserVerification(db.Model, SerializerMixin):
    __tablename__ = "user_verifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True
    )
    # # long token
    # token = db.Column(
    #     db.String(128), unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    # )

    # short token
    token = db.Column(
        db.String(64),
        unique=True,
        nullable=False,
        default=lambda: secrets.token_urlsafe(32),
    )
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(
        db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24)
    )

    # Relationship back to User
    user = db.relationship(
        "User",
        back_populates="verification",
    )

    def is_token_expired(self):
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f"<UserVerification user_id={self.user_id} verified={self.is_verified}>"
