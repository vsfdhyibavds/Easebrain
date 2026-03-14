from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class SafetyPlan(db.Model, SerializerMixin):
    """Patient safety plans with coping strategies and crisis contacts"""

    __tablename__ = "safety_plans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Warning signs
    warning_signs = db.Column(db.Text, nullable=True)  # JSON: list of warning signs

    # Internal coping strategies
    internal_coping = db.Column(db.Text, nullable=True)  # JSON: self-help strategies

    # People and social settings
    people_to_talk_to = db.Column(db.Text, nullable=True)  # JSON: trusted people
    professional_contacts = db.Column(
        db.Text, nullable=True
    )  # JSON: therapists, doctors

    # Crisis contacts
    crisis_hotlines = db.Column(db.Text, nullable=True)  # JSON: emergency numbers

    # Means safety
    means_restriction = db.Column(
        db.Text, nullable=True
    )  # How to reduce access to means

    # After crisis plan
    after_crisis_plan = db.Column(db.Text, nullable=True)  # Recovery steps

    # Sharing settings
    shared_with_caregivers = db.Column(db.Boolean, default=False)
    last_updated = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", foreign_keys=[user_id], backref="safety_plans")
    caregiver_accesses = db.relationship(
        "SafetyPlanAccess", back_populates="safety_plan", cascade="all, delete-orphan"
    )

    serialize_rules = ("-user.safety_plans", "-caregiver_accesses")

    def __repr__(self):
        return f"<SafetyPlan {self.id}: {self.title}>"


class SafetyPlanAccess(db.Model, SerializerMixin):
    """Tracks which caregivers have access to a patient's safety plan"""

    __tablename__ = "safety_plan_accesses"

    id = db.Column(db.Integer, primary_key=True)
    safety_plan_id = db.Column(
        db.Integer, db.ForeignKey("safety_plans.id"), nullable=False
    )
    caregiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Access settings
    can_view = db.Column(db.Boolean, default=True)
    can_edit = db.Column(db.Boolean, default=False)  # Can caregiver suggest changes?

    # Tracking
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_viewed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    safety_plan = db.relationship("SafetyPlan", back_populates="caregiver_accesses")
    caregiver = db.relationship(
        "User", foreign_keys=[caregiver_id], backref="accessible_safety_plans"
    )

    serialize_rules = ("-safety_plan", "-caregiver")

    def __repr__(self):
        return f"<SafetyPlanAccess plan_id={self.safety_plan_id} caregiver_id={self.caregiver_id}>"


class SafetyPlanUpdate(db.Model, SerializerMixin):
    """History of safety plan updates"""

    __tablename__ = "safety_plan_updates"

    id = db.Column(db.Integer, primary_key=True)
    safety_plan_id = db.Column(
        db.Integer, db.ForeignKey("safety_plans.id"), nullable=False
    )
    updated_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # What changed
    section_updated = db.Column(
        db.String(100), nullable=False
    )  # warning_signs, coping, contacts, etc
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    change_note = db.Column(db.Text, nullable=True)

    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    safety_plan = db.relationship("SafetyPlan", backref="updates")
    updater = db.relationship("User", foreign_keys=[updated_by])

    serialize_rules = ("-safety_plan", "-updater")

    def __repr__(self):
        return f"<SafetyPlanUpdate plan_id={self.safety_plan_id} section={self.section_updated}>"
