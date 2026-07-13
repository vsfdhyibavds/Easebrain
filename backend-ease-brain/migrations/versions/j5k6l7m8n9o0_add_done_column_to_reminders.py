"""Add done column to reminders table

Revision ID: j5k6l7m8n9o0
Revises: i4j5k6l7m8n9
Create Date: 2026-01-11 18:40:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "j5k6l7m8n9o0"
down_revision = "i4j5k6l7m8n9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [
        column_info["name"] for column_info in inspector.get_columns("reminders")
    ]
    if "done" not in columns:
        op.add_column(
            "reminders",
            sa.Column("done", sa.Boolean(), nullable=True, server_default=sa.text("0")),
        )


def downgrade() -> None:
    op.drop_column("reminders", "done")
