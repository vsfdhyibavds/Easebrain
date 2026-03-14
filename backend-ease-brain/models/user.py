from extensions import db
from sqlalchemy_serializer import SerializerMixin


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    phone_number = db.Column(db.String(20), unique=True, index=True)
    location = db.Column(db.String)  # create a list of county
    date_of_birth = db.Column(db.String)  ## Format: YYYY-MM-DD
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"))

    verification = db.relationship(
        "UserVerification",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Association object relationship
    user_roles = db.relationship(
        "UserRole", back_populates="user", cascade="all, delete-orphan"
    )

    # Relationships for messaging
    messages_sent = db.relationship(
        "Message", back_populates="sender", foreign_keys="Message.sender_id"
    )
    messages_received = db.relationship(
        "Message", back_populates="receiver", foreign_keys="Message.receiver_id"
    )
    caregiver_notes_written = db.relationship(
        "CaregiverNote",
        back_populates="caregiver",
        foreign_keys="CaregiverNote.caregiver_id",
    )
    caregiver_notes_about = db.relationship(
        "CaregiverNote", back_populates="user", foreign_keys="CaregiverNote.user_id"
    )
    user_communities = db.relationship(
        "UserCommunity", back_populates="user", cascade="all, delete"
    )
    conversations_as_user1 = db.relationship(
        "Conversation", back_populates="user1", foreign_keys="Conversation.user1_id"
    )
    conversations_as_user2 = db.relationship(
        "Conversation", back_populates="user2", foreign_keys="Conversation.user2_id"
    )

    organization = db.relationship("Organization", back_populates="users")

    # Stories of Hope relationships
    stories_written = db.relationship(
        "Story", back_populates="author", foreign_keys="Story.author_id"
    )

    # Reactions
    reactions = db.relationship(
        "Reaction", back_populates="user", cascade="all, delete-orphan"
    )

    serialize_rules = (
        "-password_hash",
        "-messages_sent.receiver",
        "-messages_received.sender",
        "-organization.users",
        "-verification",
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
