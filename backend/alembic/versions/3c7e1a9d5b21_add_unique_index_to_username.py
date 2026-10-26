"""Add unique index to username

Revision ID: 3c7e1a9d5b21
Revises: fabcfa674c51
Create Date: 2026-10-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '3c7e1a9d5b21'
down_revision: Union[str, Sequence[str], None] = 'fabcfa674c51'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Упадёт, если в базе уже есть одинаковые ники: найти — select username from users group by 1 having count(*) > 1.
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_username'), table_name='users')
