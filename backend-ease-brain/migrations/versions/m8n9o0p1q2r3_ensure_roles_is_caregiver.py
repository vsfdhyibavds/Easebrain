"""Ensure roles.is_caregiver column exists (repair schema drift)

Revision ID: m8n9o0p1q2r3
Revises: l7m8n9o0p1q2
Create Date: 2026-07-13 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "m8n9o0p1q2r3"
down_revision = "l7m8n9o0p1q2"
branch_labels = None
depends_on = None


def column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table(table_name):
        return False
    return any(c["name"] == column_name for c in inspector.get_columns(table_name))


def upgrade() -> None:
    # Repair schema drift: an earlier db.create_all()/migration may have
    # created the roles table WITHOUT is_caregiver, which makes
    # Role.query.all() fail with "column roles.is_caregiver does not exist".
    # Guard with table_exists so this is a no-op if roles is absent, and
    # column_exists so it is idempotent on every deploy.
    if not column_exists("roles", "is_caregiver"):
        with op.batch_alter_table("roles") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "is_caregiver",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                )
            )


def downgrade() -> None:
    if column_exists("roles", "is_caregiver"):
        with op.batch_alter_table("roles") as batch_op:
            batch_op.drop_column("is_caregiver")
