from extensions import db
from datetime import datetime


class UserCommunity(db.Model):
    __tablename__ = "user_communities"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    community_id = db.Column(
        db.Integer, db.ForeignKey("communities.id"), nullable=False
    )

    # Status tracking for moderation
    status = db.Column(
        db.String(50), default="active"
    )  # "active", "suspended", "banned"
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    suspended_at = db.Column(db.DateTime, nullable=True)
    banned_at = db.Column(db.DateTime, nullable=True)
    suspension_reason = db.Column(db.Text, nullable=True)
    ban_reason = db.Column(db.Text, nullable=True)

    # Accountability: which moderator took the action
    moderated_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    user = db.relationship("User", foreign_keys=[user_id], back_populates="user_communities")
    community = db.relationship("Community", back_populates="user_communities")
    moderator = db.relationship("User", foreign_keys=[moderated_by])
