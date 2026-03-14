from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class CaregiverNote(db.Model, SerializerMixin):
    __tablename__ = "caregiver_notes"

    id = db.Column(db.Integer, primary_key=True)
    caregiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    note = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    caregiver = db.relationship(
        "User", back_populates="caregiver_notes_written", foreign_keys=[caregiver_id]
    )
    user = db.relationship(
        "User", back_populates="caregiver_notes_about", foreign_keys=[user_id]
    )

    # serialize_only = ("id", "caregiver_id", "user_id", "note", "created_at")

    serialize_rules = (
        "-caregiver.caregiver_notes_written",
        "-user.caregiver_notes_about",
    )
