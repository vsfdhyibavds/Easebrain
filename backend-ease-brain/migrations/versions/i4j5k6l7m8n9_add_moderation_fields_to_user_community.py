"""Add moderation fields to user_community table.

Revision ID: i4j5k6l7m8n9
Revises: g2h3i4j5k6l7
Create Date: 2026-01-07 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


def column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table(table_name):
        return False
    return column_name in [col["name"] for col in inspector.get_columns(table_name)]


# revision identifiers, used by Alembic.
revision = "i4j5k6l7m8n9"
down_revision = "g2h3i4j5k6l7"
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to user_communities table
    if not column_exists("user_communities", "status"):
        op.add_column(
            "user_communities",
            sa.Column("status", sa.String(50), nullable=True, server_default="active"),
        )
    if not column_exists("user_communities", "joined_at"):
        op.add_column(
            "user_communities", sa.Column("joined_at", sa.DateTime(), nullable=True)
        )
    if not column_exists("user_communities", "suspended_at"):
        op.add_column(
            "user_communities", sa.Column("suspended_at", sa.DateTime(), nullable=True)
        )
    if not column_exists("user_communities", "banned_at"):
        op.add_column(
            "user_communities", sa.Column("banned_at", sa.DateTime(), nullable=True)
        )
    if not column_exists("user_communities", "suspension_reason"):
        op.add_column(
            "user_communities", sa.Column("suspension_reason", sa.Text(), nullable=True)
        )
    if not column_exists("user_communities", "ban_reason"):
        op.add_column(
            "user_communities", sa.Column("ban_reason", sa.Text(), nullable=True)
        )


def downgrade():
    # Remove columns if rolling back
    op.drop_column("user_communities", "ban_reason")
    op.drop_column("user_communities", "suspension_reason")
    op.drop_column("user_communities", "banned_at")
    op.drop_column("user_communities", "suspended_at")
    op.drop_column("user_communities", "joined_at")
    op.drop_column("user_communities", "status")
