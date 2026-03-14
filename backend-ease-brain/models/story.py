from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Story(db.Model, SerializerMixin):
    """Stories of Hope and Recovery - blog-oriented patient testimonials"""

    __tablename__ = "stories"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Content metadata
    category = db.Column(
        db.String(100), nullable=False
    )  # e.g., "Recovery", "Coping", "Breakthrough", "Daily Life"
    tags = db.Column(db.String(500), nullable=True)  # CSV or JSON format
    featured_image_url = db.Column(db.String(500), nullable=True)

    # Moderation
    is_approved = db.Column(db.Boolean, default=False)  # Community guidelines review
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    moderation_notes = db.Column(db.Text, nullable=True)

    # Engagement
    view_count = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    published_at = db.Column(db.DateTime, nullable=True)  # When approved and published

    # Relationships
    author = db.relationship(
        "User", foreign_keys=[author_id], back_populates="stories_written"
    )
    approver = db.relationship("User", foreign_keys=[approved_by])
    comments = db.relationship(
        "StoryComment", back_populates="story", cascade="all, delete-orphan"
    )

    serialize_rules = ("-author.stories_written", "-comments")

    def __repr__(self):
        return f"<Story {self.id}: {self.title}>"


class StoryComment(db.Model, SerializerMixin):
    """Comments on recovery stories"""

    __tablename__ = "story_comments"

    id = db.Column(db.Integer, primary_key=True)
    story_id = db.Column(db.Integer, db.ForeignKey("stories.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    story = db.relationship("Story", back_populates="comments")
    author = db.relationship("User", backref="story_comments")

    serialize_rules = ("-story", "-author.story_comments")
