"""add_payment_fields_to_users

Revision ID: 812066d76c34
Revises: 762339124d34
Create Date: 2025-09-20 20:30:26.462164

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql


# revision identifiers, used by Alembic.
revision: str = '812066d76c34'
down_revision: Union[str, Sequence[str], None] = '762339124d34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add payment-related columns to users table
    op.add_column('users', sa.Column('has_paid', sa.Boolean(), nullable=True, default=False), schema='dbo')
    op.add_column('users', sa.Column('subscription_plan', sa.String(50), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('subscription_start_date', mssql.DATETIMEOFFSET(), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('subscription_end_date', mssql.DATETIMEOFFSET(), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('payment_id', sa.String(255), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), nullable=True, default=False), schema='dbo')

    # Add first_name and last_name columns if they don't exist
    op.add_column('users', sa.Column('first_name', sa.String(100), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('last_name', sa.String(100), nullable=True), schema='dbo')


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the added columns
    op.drop_column('users', 'last_name', schema='dbo')
    op.drop_column('users', 'first_name', schema='dbo')
    op.drop_column('users', 'is_superuser', schema='dbo')
    op.drop_column('users', 'payment_id', schema='dbo')
    op.drop_column('users', 'subscription_end_date', schema='dbo')
    op.drop_column('users', 'subscription_start_date', schema='dbo')
    op.drop_column('users', 'subscription_plan', schema='dbo')
    op.drop_column('users', 'has_paid', schema='dbo')
