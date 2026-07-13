"""Add all missing columns to communities table.

Revision ID: h3i4j5k6l7m8
Revises: f1g2h3i4j5k6
Create Date: 2026-01-06 19:30:00.000000

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
revision = "h3i4j5k6l7m8"
down_revision = "f1g2h3i4j5k6"
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to communities table
    if not column_exists("communities", "description"):
        op.add_column(
            "communities",
            sa.Column("description", sa.Text(), nullable=True),
        )
    if not column_exists("communities", "icon"):
        op.add_column(
            "communities",
            sa.Column("icon", sa.String(100), nullable=True),
        )
    if not column_exists("communities", "color"):
        op.add_column(
            "communities",
            sa.Column("color", sa.String(50), nullable=True),
        )
    if not column_exists("communities", "created_at"):
        op.add_column(
            "communities",
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )


def downgrade():
    # Remove the added columns
    op.drop_column("communities", "created_at")
    op.drop_column("communities", "color")
    op.drop_column("communities", "icon")
    op.drop_column("communities", "description")
