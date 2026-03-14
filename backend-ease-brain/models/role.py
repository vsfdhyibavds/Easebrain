from extensions import db
from sqlalchemy_serializer import SerializerMixin


class Role(db.Model, SerializerMixin):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(
        db.String(50), unique=True, nullable=False
    )  # e.g. 'therapist', 'client', 'admin'
    role_type = db.Column(
        db.String(20), nullable=False
    )  # e.g. 'caregiver', 'client', 'admin'
    is_caregiver = db.Column(db.Boolean, default=False)

    user_roles = db.relationship(
        "UserRole", back_populates="role", cascade="all, delete-orphan"
    )
