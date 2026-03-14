from extensions import db
from datetime import datetime


class Reaction(db.Model):
    __tablename__ = "reactions"

    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    emoji = db.Column(db.String(10), nullable=False)  # Store emoji as unicode
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    message = db.relationship("Message", back_populates="reactions")
    user = db.relationship("User", back_populates="reactions")

    # Unique constraint: one user per emoji per message
    __table_args__ = (
        db.UniqueConstraint(
            "message_id", "user_id", "emoji", name="unique_reaction_per_user"
        ),
    )
