"""move guest fields from addresses to orders, make orders.user_id nullable

Revision ID: 1cfaf9ab633b
Revises: 5f5678d344ee
Create Date: 2026-09-08 12:30:47.952274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1cfaf9ab633b'
down_revision: Union[str, Sequence[str], None] = '5f5678d344ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('addresses', 'guest_email')
    op.drop_column('addresses', 'guest_name')
    op.add_column('orders', sa.Column('guest_email', sa.String(255), nullable=True))
    op.add_column('orders', sa.Column('guest_name', sa.String(100), nullable=True))
    op.alter_column('orders', 'user_id', existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column('orders', 'user_id', existing_type=sa.Integer(), nullable=False)
    op.drop_column('orders', 'guest_name')
    op.drop_column('orders', 'guest_email')
    op.add_column('addresses', sa.Column('guest_name', sa.String(100), nullable=True))
    op.add_column('addresses', sa.Column('guest_email', sa.String(255), nullable=True))
