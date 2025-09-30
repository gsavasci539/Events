"""add_online_event_fields

Revision ID: 5d1a35c18e38
Revises: 812066d76c34
Create Date: 2025-09-20 21:56:22.161763

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d1a35c18e38'
down_revision: Union[str, Sequence[str], None] = '812066d76c34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to events table
    op.add_column('dbo.events', sa.Column('location_lat', sa.Float(), nullable=True))
    op.add_column('dbo.events', sa.Column('location_lng', sa.Float(), nullable=True))
    op.add_column('dbo.events', sa.Column('location_url', sa.String(500), nullable=True))
    op.add_column('dbo.events', sa.Column('is_online', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('dbo.events', sa.Column('online_link', sa.String(500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove columns from events table
    op.drop_column('dbo.events', 'location_lat')
    op.drop_column('dbo.events', 'location_lng')
    op.drop_column('dbo.events', 'location_url')
    op.drop_column('dbo.events', 'is_online')
    op.drop_column('dbo.events', 'online_link')
