"""Add performance indexes to frequently queried columns

Revision ID: k6l7m8n9o0p1
Revises: j5k6l7m8n9o0
Create Date: 2026-02-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


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


def create_index_if_not_exists(name: str, table_name: str, columns, **kwargs):
    if not index_exists(name) and table_exists(table_name):
        op.create_index(name, table_name, columns, **kwargs)


# revision identifiers, used by Alembic.
revision = "k6l7m8n9o0p1"
down_revision = "j5k6l7m8n9o0"
branch_labels = None
depends_on = None


def upgrade():
    # Users table indexes
    create_index_if_not_exists("idx_users_email", "users", ["email"], unique=False)
    create_index_if_not_exists(
        "idx_users_username", "users", ["username"], unique=False
    )
    create_index_if_not_exists(
        "idx_users_is_active", "users", ["is_active"], unique=False
    )
    create_index_if_not_exists(
        "idx_users_organization_id", "users", ["organization_id"], unique=False
    )

    # User Verifications indexes
    create_index_if_not_exists(
        "idx_user_verifications_user_id",
        "user_verifications",
        ["user_id"],
        unique=False,
    )
    create_index_if_not_exists(
        "idx_user_verifications_token",
        "user_verifications",
        ["token"],
        unique=False,
    )

    # User Roles indexes
    create_index_if_not_exists(
        "idx_user_roles_user_id", "user_roles", ["user_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_user_roles_role_id", "user_roles", ["role_id"], unique=False
    )

    # Messages indexes
    create_index_if_not_exists(
        "idx_messages_sender_id", "messages", ["sender_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_messages_receiver_id", "messages", ["receiver_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_messages_conversation_id", "messages", ["conversation_id"], unique=False
    )

    # Conversations indexes
    create_index_if_not_exists(
        "idx_conversations_user1_id", "conversations", ["user1_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_conversations_user2_id", "conversations", ["user2_id"], unique=False
    )

    # Caregiver Notes indexes
    create_index_if_not_exists(
        "idx_caregiver_notes_user_id", "caregiver_notes", ["user_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_caregiver_notes_caregiver_id",
        "caregiver_notes",
        ["caregiver_id"],
        unique=False,
    )

    # Reminders indexes
    create_index_if_not_exists(
        "idx_reminders_user_id", "reminders", ["user_id"], unique=False
    )

    # User Communities indexes
    create_index_if_not_exists(
        "idx_user_communities_user_id", "user_communities", ["user_id"], unique=False
    )
    create_index_if_not_exists(
        "idx_user_communities_community_id",
        "user_communities",
        ["community_id"],
        unique=False,
    )


def downgrade():
    # Drop indexes in reverse order
    op.drop_index("idx_user_communities_community_id", table_name="user_communities")
    op.drop_index("idx_user_communities_user_id", table_name="user_communities")

    op.drop_index("idx_reminders_user_id", table_name="reminders")

    op.drop_index("idx_caregiver_notes_caregiver_id", table_name="caregiver_notes")
    op.drop_index("idx_caregiver_notes_user_id", table_name="caregiver_notes")

    op.drop_index("idx_conversations_user2_id", table_name="conversations")
    op.drop_index("idx_conversations_user1_id", table_name="conversations")

    op.drop_index("idx_messages_conversation_id", table_name="messages")
    op.drop_index("idx_messages_receiver_id", table_name="messages")
    op.drop_index("idx_messages_sender_id", table_name="messages")

    op.drop_index("idx_user_roles_role_id", table_name="user_roles")
    op.drop_index("idx_user_roles_user_id", table_name="user_roles")

    op.drop_index("idx_user_verifications_token", table_name="user_verifications")
    op.drop_index("idx_user_verifications_user_id", table_name="user_verifications")

    op.drop_index("idx_users_organization_id", table_name="users")
    op.drop_index("idx_users_is_active", table_name="users")
    op.drop_index("idx_users_username", table_name="users")
    op.drop_index("idx_users_email", table_name="users")
