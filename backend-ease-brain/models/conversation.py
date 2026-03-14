from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Conversation(db.Model, SerializerMixin):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    user1_archived = db.Column(db.Boolean, default=False)
    user2_archived = db.Column(db.Boolean, default=False)
    user1_muted = db.Column(db.Boolean, default=False)
    user2_muted = db.Column(db.Boolean, default=False)
    user1_last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    user2_last_seen = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship(
        "Message", back_populates="conversation", cascade="all, delete"
    )

    user1 = db.relationship(
        "User", back_populates="conversations_as_user1", foreign_keys=[user1_id]
    )
    user2 = db.relationship(
        "User", back_populates="conversations_as_user2", foreign_keys=[user2_id]
    )

    __table_args__ = (
        db.UniqueConstraint("user1_id", "user2_id", name="unique_conversation"),
    )

    serialize_rules = (
        "-messages.conversation",
        "-user1.conversations_as_user1",
        "-user2.conversations_as_user2",
    )
