from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Organization(db.Model, SerializerMixin):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship(
        "User", back_populates="organization", cascade="all, delete-orphan"
    )

    serialize_only = ("id", "name", "email", "created_at")
