"""add_first_name_last_name_to_users

Revision ID: 1234
Revises: <previous_revision_id>
Create Date: 2025-09-18 16:58:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1234'
down_revision = '762339124d34'  # This should match the previous migration's revision ID
branch_labels = None
depends_on = None


def upgrade():
    # Add first_name and last_name columns to users table
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=True), schema='dbo')
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=True), schema='dbo')
    
    # For existing users, you might want to split the full_name into first and last names
    # This is a simple example - adjust according to your needs
    op.execute("""
    UPDATE dbo.users 
    SET first_name = SUBSTRING(full_name, 1, CHARINDEX(' ', full_name + ' ') - 1),
        last_name = NULLIF(SUBSTRING(full_name, CHARINDEX(' ', full_name + ' ') + 1, LEN(full_name)), '')
    WHERE full_name IS NOT NULL
    """)


def downgrade():
    # Remove the columns if rolling back
    op.drop_column('users', 'last_name', schema='dbo')
    op.drop_column('users', 'first_name', schema='dbo')
