"""Create roles table

Revision ID: l7m8n9o0p1q2
Revises: k6l7m8n9o0p1
Create Date: 2026-07-08 19:15:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "l7m8n9o0p1q2"
down_revision = "k6l7m8n9o0p1"
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


def upgrade() -> None:
    # Create roles table if it doesn't exist
    if not table_exists("roles"):
        op.create_table(
            "roles",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=50), nullable=False, unique=True),
            sa.Column("role_type", sa.String(length=20), nullable=False),
            sa.Column("is_caregiver", sa.Boolean(), nullable=True, default=False),
            sa.PrimaryKeyConstraint("id"),
        )
    # Create indexes if they don't exist
    if not index_exists("ix_roles_name"):
        op.create_index("ix_roles_name", "roles", ["name"], unique=True)
    if not index_exists("ix_roles_role_type"):
        op.create_index("ix_roles_role_type", "roles", ["role_type"])


def downgrade() -> None:
    if index_exists("ix_roles_role_type"):
        op.drop_index("ix_roles_role_type", table_name="roles")
    if index_exists("ix_roles_name"):
        op.drop_index("ix_roles_name", table_name="roles")
    if table_exists("roles"):
        op.drop_table("roles")
