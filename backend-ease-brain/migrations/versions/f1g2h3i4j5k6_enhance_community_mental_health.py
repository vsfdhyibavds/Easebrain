"""Enhance Community with mental health features and safety system.

Revision ID: f1g2h3i4j5k6
Revises: e9f0g1h2i3j4
Create Date: 2026-01-06 14:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return inspector.has_table(table_name)


def column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table(table_name):
        return False
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


def foreign_key_exists(table_name: str, fk_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table(table_name):
        return False
    return any(fk["name"] == fk_name for fk in inspector.get_foreign_keys(table_name))


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
revision = "f1g2h3i4j5k6"
down_revision = "e9f0g1h2i3j4"
branch_labels = None
depends_on = None


def upgrade():
    if table_exists("communities"):
        with op.batch_alter_table("communities") as batch_op:
            if not column_exists("communities", "subject_area"):
                batch_op.add_column(
                    sa.Column("subject_area", sa.String(50), nullable=True),
                )
            if not column_exists("communities", "is_peer_support"):
                batch_op.add_column(
                    sa.Column(
                        "is_peer_support",
                        sa.Boolean(),
                        nullable=False,
                        server_default=sa.text("1"),
                    ),
                )
            if not column_exists("communities", "requires_moderation"):
                batch_op.add_column(
                    sa.Column(
                        "requires_moderation",
                        sa.Boolean(),
                        nullable=False,
                        server_default=sa.text("1"),
                    ),
                )
            if not column_exists("communities", "allows_anonymous_posting"):
                batch_op.add_column(
                    sa.Column(
                        "allows_anonymous_posting",
                        sa.Boolean(),
                        nullable=False,
                        server_default=sa.text("1"),
                    ),
                )
            if not column_exists("communities", "community_guidelines"):
                batch_op.add_column(
                    sa.Column("community_guidelines", sa.Text(), nullable=True),
                )
            if not column_exists("communities", "crisis_hotline_phone"):
                batch_op.add_column(
                    sa.Column("crisis_hotline_phone", sa.String(20), nullable=True),
                )
            if not column_exists("communities", "crisis_hotline_url"):
                batch_op.add_column(
                    sa.Column("crisis_hotline_url", sa.String(255), nullable=True),
                )
            if not column_exists("communities", "created_by"):
                batch_op.add_column(
                    sa.Column("created_by", sa.Integer(), nullable=True),
                )
            if not foreign_key_exists("communities", "fk_communities_created_by"):
                batch_op.create_foreign_key(
                    "fk_communities_created_by",
                    "users",
                    ["created_by"],
                    ["id"],
                )

    create_table_if_not_exists(
        "community_moderators",
        sa.Column("community_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            [
                "community_id",
            ],
            ["communities.id"],
        ),
        sa.ForeignKeyConstraint(
            [
                "user_id",
            ],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("community_id", "user_id"),
    )

    if not table_exists("community_reports"):
        op.create_table(
            "community_reports",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("community_id", sa.Integer(), nullable=False),
            sa.Column("post_id", sa.Integer(), nullable=True),
            sa.Column("reporter_id", sa.Integer(), nullable=False),
            sa.Column("reason", sa.String(100), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column(
                "status", sa.String(50), nullable=False, server_default="pending"
            ),
            sa.Column("reviewed_by", sa.Integer(), nullable=True),
            sa.Column("review_notes", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column("resolved_at", sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(
                [
                    "community_id",
                ],
                ["communities.id"],
            ),
            sa.ForeignKeyConstraint(
                [
                    "post_id",
                ],
                ["community_posts.id"],
            ),
            sa.ForeignKeyConstraint(
                [
                    "reporter_id",
                ],
                ["users.id"],
            ),
            sa.ForeignKeyConstraint(
                [
                    "reviewed_by",
                ],
                ["users.id"],
            ),
            sa.PrimaryKeyConstraint("id"),
        )
    create_index_if_not_exists(
        "ix_community_reports_community_id", "community_reports", ["community_id"]
    )
    create_index_if_not_exists(
        "ix_community_reports_post_id", "community_reports", ["post_id"]
    )
    create_index_if_not_exists(
        "ix_community_reports_status", "community_reports", ["status"]
    )


def downgrade():
    # Drop community_reports table
    op.drop_table("community_reports")

    # Drop community_moderators table
    op.drop_table("community_moderators")
    # Remove fields from communities
    op.drop_constraint("fk_communities_created_by", "communities", type_="foreignkey")
    op.drop_column("communities", "created_by")
    op.drop_column("communities", "crisis_hotline_url")
    op.drop_column("communities", "crisis_hotline_phone")
    op.drop_column("communities", "community_guidelines")
    op.drop_column("communities", "allows_anonymous_posting")
    op.drop_column("communities", "requires_moderation")
    op.drop_column("communities", "is_peer_support")
    op.drop_column("communities", "subject_area")
