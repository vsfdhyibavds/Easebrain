"""Create community posts and replies tables - Initialize community system.

Revision ID: e9f0g1h2i3j4
Revises: ad0e8f6cb699
Create Date: 2026-01-06 14:30:00.000000

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


def create_table_if_not_exists(name: str, *cols, **kwargs):
    if not table_exists(name):
        op.create_table(name, *cols, **kwargs)


def create_index_if_not_exists(name: str, table_name: str, columns, **kwargs):
    if not index_exists(name):
        op.create_index(name, table_name, columns, **kwargs)


# revision identifiers, used by Alembic.
revision = "e9f0g1h2i3j4"
down_revision = "ad0e8f6cb699"
branch_labels = None
depends_on = None


def upgrade():
    # Create base community tables used by posts, replies, and membership.
    create_table_if_not_exists(
        "communities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False, unique=True),
        sa.PrimaryKeyConstraint("id"),
    )

    create_table_if_not_exists(
        "user_communities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("community_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["community_id"], ["communities.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create community_posts table (base table first)
    create_table_if_not_exists(
        "community_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("community_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("post_type", sa.String(50), nullable=True),
        sa.Column(
            "has_trigger_warning", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("trigger_warning_text", sa.String(255), nullable=True),
        sa.Column("is_anonymous", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column(
            "moderation_status", sa.String(50), nullable=False, server_default="pending"
        ),
        sa.Column("moderation_reason", sa.Text(), nullable=True),
        sa.Column(
            "is_flagged_for_review",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.Column("flagged_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reply_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("helpful_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.ForeignKeyConstraint(
            ["community_id"],
            ["communities.id"],
        ),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["approved_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    create_index_if_not_exists(
        "ix_community_posts_community_id", "community_posts", ["community_id"]
    )
    create_index_if_not_exists(
        "ix_community_posts_author_id", "community_posts", ["author_id"]
    )
    create_index_if_not_exists(
        "ix_community_posts_moderation_status", "community_posts", ["moderation_status"]
    )
    create_index_if_not_exists(
        "ix_community_posts_is_flagged", "community_posts", ["is_flagged_for_review"]
    )

    # Create community_replies table
    create_table_if_not_exists(
        "community_replies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.ForeignKeyConstraint(
            ["post_id"],
            ["community_posts.id"],
        ),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    create_index_if_not_exists(
        "ix_community_replies_post_id", "community_replies", ["post_id"]
    )
    create_index_if_not_exists(
        "ix_community_replies_author_id", "community_replies", ["author_id"]
    )


def downgrade():
    op.drop_index("ix_community_replies_author_id", table_name="community_replies")
    op.drop_index("ix_community_replies_post_id", table_name="community_replies")
    op.drop_table("community_replies")
    op.drop_index("ix_community_posts_is_flagged", table_name="community_posts")
    op.drop_index("ix_community_posts_moderation_status", table_name="community_posts")
    op.drop_index("ix_community_posts_author_id", table_name="community_posts")
    op.drop_index("ix_community_posts_community_id", table_name="community_posts")
    op.drop_table("community_posts")
    op.drop_table("user_communities")
    op.drop_table("communities")
