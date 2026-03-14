from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Message(db.Model, SerializerMixin):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversations.id"), nullable=False
    )
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    edited_at = db.Column(db.DateTime, nullable=True)
    message_status = db.Column(db.String(20), default="sent")  # sent, delivered, read
    is_pinned = db.Column(db.Boolean, default=False)

    conversation = db.relationship("Conversation", back_populates="messages")
    sender = db.relationship(
        "User", back_populates="messages_sent", foreign_keys=[sender_id]
    )
    receiver = db.relationship(
        "User", back_populates="messages_received", foreign_keys=[receiver_id]
    )
    reactions = db.relationship(
        "Reaction", back_populates="message", cascade="all, delete-orphan"
    )
