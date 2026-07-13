"""create user_settings table

Revision ID: ad0e8f6cb699
Revises:
Create Date: 2025-11-05 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "ad0e8f6cb699"
down_revision = None
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return inspector.has_table(table_name)


def index_exists(index_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    for table_name in inspector.get_table_names():
        for index in inspector.get_indexes(table_name):
            if index.get("name") == index_name:
                return True
    return False


def create_table_if_not_exists(name: str, *cols, **kwargs):
    if not table_exists(name):
        op.create_table(name, *cols, **kwargs)


def create_index_if_not_exists(name: str, table_name: str, columns, **kwargs):
    if not index_exists(name):
        op.create_index(name, table_name, columns, **kwargs)


def upgrade() -> None:
    create_table_if_not_exists(
        "organizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("email", sa.String(length=120), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=128), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    create_table_if_not_exists(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=50), unique=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("phone_number", sa.String(length=20), nullable=True, unique=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("date_of_birth", sa.String(), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.Column("organization_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
    )

    create_table_if_not_exists(
        "roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=50), unique=True, nullable=False),
        sa.Column("role_type", sa.String(length=20), nullable=False),
        sa.Column(
            "is_caregiver", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
    )

    create_table_if_not_exists(
        "user_roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column(
            "assigned_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
    )

    create_table_if_not_exists(
        "user_verifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(length=64), nullable=False, unique=True),
        sa.Column(
            "is_verified", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("user_id"),
    )

    create_table_if_not_exists(
        "caregiver_notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("caregiver_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["caregiver_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "caregiver_connections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("caregiver_id", sa.Integer(), nullable=False),
        sa.Column("relationship", sa.String(length=100), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=True),
        sa.Column(
            "notify_on_warning_signs",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        sa.Column(
            "notify_on_crisis",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        sa.Column(
            "notify_on_reminders",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "notify_on_story_share",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("email_address", sa.String(length=255), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["patient_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["caregiver_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "stories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("tags", sa.String(length=500), nullable=True),
        sa.Column("featured_image_url", sa.String(length=500), nullable=True),
        sa.Column(
            "is_approved", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("moderation_notes", sa.Text(), nullable=True),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("shares", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "is_featured", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
    )

    create_table_if_not_exists(
        "story_comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("story_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"]),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "safety_plans",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("warning_signs", sa.Text(), nullable=True),
        sa.Column("internal_coping", sa.Text(), nullable=True),
        sa.Column("people_to_talk_to", sa.Text(), nullable=True),
        sa.Column("professional_contacts", sa.Text(), nullable=True),
        sa.Column("crisis_hotlines", sa.Text(), nullable=True),
        sa.Column("means_restriction", sa.Text(), nullable=True),
        sa.Column("after_crisis_plan", sa.Text(), nullable=True),
        sa.Column(
            "shared_with_caregivers",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "last_updated",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "safety_plan_accesses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("safety_plan_id", sa.Integer(), nullable=False),
        sa.Column("caregiver_id", sa.Integer(), nullable=False),
        sa.Column(
            "can_view", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.Column(
            "can_edit", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "granted_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("last_viewed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["safety_plan_id"], ["safety_plans.id"]),
        sa.ForeignKeyConstraint(["caregiver_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "safety_plan_updates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("safety_plan_id", sa.Integer(), nullable=False),
        sa.Column("updated_by", sa.Integer(), nullable=False),
        sa.Column("section_updated", sa.String(length=100), nullable=False),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column("change_note", sa.Text(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["safety_plan_id"], ["safety_plans.id"]),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"]),
    )

    create_table_if_not_exists(
        "conversations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user1_id", sa.Integer(), nullable=False),
        sa.Column("user2_id", sa.Integer(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "user1_archived", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "user2_archived", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "user1_muted", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "user2_muted", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "user1_last_seen",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "user2_last_seen",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user1_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["user2_id"], ["users.id"]),
        sa.UniqueConstraint("user1_id", "user2_id", name="unique_conversation"),
    )

    create_table_if_not_exists(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("receiver_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("edited_at", sa.DateTime(), nullable=True),
        sa.Column(
            "message_status",
            sa.String(length=20),
            nullable=False,
            server_default="sent",
        ),
        sa.Column(
            "is_pinned", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["receiver_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "reminders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("remind_at", sa.DateTime(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "notification_email",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        sa.Column(
            "notification_sms",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "notification_push",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column("done", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "priority", sa.String(length=20), nullable=False, server_default="medium"
        ),
        sa.Column(
            "timezone", sa.String(length=100), nullable=False, server_default="UTC"
        ),
        sa.Column(
            "recurring", sa.String(length=20), nullable=False, server_default="none"
        ),
        sa.Column("recurring_interval", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "reactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("emoji", sa.String(length=10), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint(
            "message_id", "user_id", "emoji", name="unique_reaction_per_user"
        ),
    )

    create_table_if_not_exists(
        "session_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_jti", sa.String(length=255), nullable=False, unique=True),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column(
            "issued_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column(
            "is_revoked", sa.Boolean(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "last_activity",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    create_table_if_not_exists(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("resource_type", sa.String(length=50), nullable=True),
        sa.Column("resource_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=50), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column(
            "timestamp",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    create_index_if_not_exists("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])

    create_table_if_not_exists(
        "warning_sign_notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("connection_id", sa.Integer(), nullable=False),
        sa.Column("reminder_id", sa.Integer(), nullable=True),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("signs_detected", sa.Text(), nullable=False),
        sa.Column("patient_notes", sa.Text(), nullable=True),
        sa.Column(
            "notified_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "notification_method",
            sa.String(length=50),
            nullable=False,
            server_default="email",
        ),
        sa.Column("acknowledged_at", sa.DateTime(), nullable=True),
        sa.Column("action_taken", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["connection_id"], ["caregiver_connections.id"]),
        sa.ForeignKeyConstraint(["reminder_id"], ["reminders.id"]),
    )

    create_table_if_not_exists(
        "user_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column(
            "timezone", sa.String(length=50), nullable=True, server_default="UTC"
        ),
        sa.Column(
            "email_notifications",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("1"),
        ),
        sa.Column(
            "sms_notifications",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "push_notifications",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("1"),
        ),
        sa.Column("theme", sa.String(length=20), nullable=True, server_default="light"),
        sa.Column(
            "dashboard_refresh_rate",
            sa.Integer(),
            nullable=True,
            server_default=sa.text("30"),
        ),
        sa.Column(
            "auto_logout_minutes",
            sa.Integer(),
            nullable=True,
            server_default=sa.text("60"),
        ),
        sa.Column(
            "two_factor_enabled",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("1"),
        ),
        sa.Column(
            "time_format",
            sa.String(length=10),
            nullable=True,
            server_default="24h",
        ),
    )


def downgrade() -> None:
    op.drop_index("ix_audit_logs_timestamp", table_name="audit_logs")
    op.drop_table("user_settings")
    op.drop_table("warning_sign_notifications")
    op.drop_table("audit_logs")
    op.drop_table("session_tokens")
    op.drop_table("reactions")
    op.drop_table("reminders")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("safety_plan_updates")
    op.drop_table("safety_plan_accesses")
    op.drop_table("safety_plans")
    op.drop_table("story_comments")
    op.drop_table("stories")
    op.drop_table("caregiver_connections")
    op.drop_table("caregiver_notes")
    op.drop_table("user_verifications")
    op.drop_table("user_roles")
    op.drop_table("roles")
    op.drop_table("users")
    op.drop_table("organizations")
