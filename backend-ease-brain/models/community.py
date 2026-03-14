from extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime


class Community(db.Model, SerializerMixin):
    __tablename__ = "communities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(100), nullable=True)  # emoji or icon name
    color = db.Column(db.String(50), nullable=True)  # for UI styling

    # Mental health specific fields
    subject_area = db.Column(
        db.String(50), nullable=True
    )  # "anxiety", "depression", "ptsd", "ocd", "sleep", "eating_disorder", "bipolar", "schizophrenia"
    is_peer_support = db.Column(db.Boolean, default=True)
    requires_moderation = db.Column(db.Boolean, default=True)
    allows_anonymous_posting = db.Column(db.Boolean, default=True)
    community_guidelines = db.Column(
        db.Text, nullable=True
    )  # Custom guidelines for community

    # Moderation & safety
    crisis_hotline_phone = db.Column(db.String(20), nullable=True)  # e.g., "988"
    crisis_hotline_url = db.Column(
        db.String(255), nullable=True
    )  # e.g., "https://988lifeline.org"
    moderators = db.relationship(
        "User",
        secondary="community_moderators",
        backref="moderated_communities",
        lazy="select",
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    creator = db.relationship(
        "User", foreign_keys=[created_by], backref="created_communities"
    )

    user_communities = db.relationship(
        "UserCommunity", back_populates="community", cascade="all, delete"
    )
    posts = db.relationship(
        "CommunityPost", back_populates="community", cascade="all, delete-orphan"
    )
    reports = db.relationship(
        "CommunityReport", back_populates="community", cascade="all, delete-orphan"
    )

    serialize_rules = ("-user_communities", "-posts", "-reports", "-moderators")

    def __repr__(self):
        return f"<Community {self.name}>"


class CommunityPost(db.Model, SerializerMixin):
    """Patient-oriented posts in communities - guided by community type"""

    __tablename__ = "community_posts"

    id = db.Column(db.Integer, primary_key=True)
    community_id = db.Column(
        db.Integer, db.ForeignKey("communities.id"), nullable=False
    )
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Post content
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)

    # Content type guidance
    post_type = db.Column(
        db.String(50), nullable=True
    )  # "question", "experience", "tip", "support", "success_story"

    # Safety & trigger warnings
    has_trigger_warning = db.Column(db.Boolean, default=False)
    trigger_warning_text = db.Column(
        db.String(255), nullable=True
    )  # e.g., "Self-harm mention", "Suicidal thoughts", "Eating disorder talk"

    # Anonymity
    is_anonymous = db.Column(db.Boolean, default=False)

    # Moderation & flagging
    is_approved = db.Column(db.Boolean, default=False)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    moderation_status = db.Column(
        db.String(50), default="pending"
    )  # "pending", "approved", "removed", "flagged"
    moderation_reason = db.Column(db.Text, nullable=True)  # Why it was removed

    is_flagged_for_review = db.Column(db.Boolean, default=False)
    flagged_count = db.Column(db.Integer, default=0)  # Number of reports

    # Engagement
    likes = db.Column(db.Integer, default=0)
    reply_count = db.Column(db.Integer, default=0)
    helpful_count = db.Column(
        db.Integer, default=0
    )  # Alternative to likes for support posts

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    community = db.relationship("Community", back_populates="posts")
    author = db.relationship(
        "User", foreign_keys=[author_id], backref="community_posts"
    )
    approver = db.relationship("User", foreign_keys=[approved_by])
    replies = db.relationship(
        "CommunityReply", back_populates="post", cascade="all, delete-orphan"
    )
    reports = db.relationship(
        "CommunityReport", back_populates="post", cascade="all, delete-orphan"
    )

    serialize_rules = ("-community", "-author.community_posts", "-replies", "-reports")

    def __repr__(self):
        return f"<CommunityPost {self.id}: {self.title}>"


class CommunityReply(db.Model, SerializerMixin):
    """Replies to community posts"""

    __tablename__ = "community_replies"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("community_posts.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    post = db.relationship("CommunityPost", back_populates="replies")
    author = db.relationship(
        "User", foreign_keys=[author_id], backref="community_replies"
    )

    serialize_rules = ("-post", "-author.community_replies")

    def __repr__(self):
        return f"<CommunityReply {self.id}>"


# Junction table for community moderators (many-to-many)
community_moderators = db.Table(
    "community_moderators",
    db.Column(
        "community_id", db.Integer, db.ForeignKey("communities.id"), primary_key=True
    ),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
)


class CommunityReport(db.Model, SerializerMixin):
    """Reports/flags for harmful or inappropriate community content"""

    __tablename__ = "community_reports"

    id = db.Column(db.Integer, primary_key=True)
    community_id = db.Column(
        db.Integer, db.ForeignKey("communities.id"), nullable=False
    )
    post_id = db.Column(
        db.Integer, db.ForeignKey("community_posts.id"), nullable=True
    )  # Null if reporting community itself
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    reason = db.Column(
        db.String(100), nullable=False
    )  # "harmful_advice", "hate_speech", "self_harm", "inappropriate", "spam", "other"
    description = db.Column(db.Text, nullable=True)  # Detailed explanation

    status = db.Column(
        db.String(50), default="pending"
    )  # "pending", "reviewing", "upheld", "dismissed"
    reviewed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    review_notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    community = db.relationship("Community", back_populates="reports")
    post = db.relationship("CommunityPost", back_populates="reports")
    reporter = db.relationship(
        "User", foreign_keys=[reporter_id], backref="community_reports"
    )
    reviewer = db.relationship("User", foreign_keys=[reviewed_by])

    serialize_rules = ("-community", "-post", "-reporter", "-reviewer")

    def __repr__(self):
        return f"<CommunityReport {self.id}: {self.reason}>"
