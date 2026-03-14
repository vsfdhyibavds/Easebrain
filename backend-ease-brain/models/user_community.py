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

    user = db.relationship("User", back_populates="user_communities")
    community = db.relationship("Community", back_populates="user_communities")
