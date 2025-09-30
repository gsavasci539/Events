from alembic.config import Config
from alembic import command
import os

def run_migrations():
    # Get the directory of this file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the alembic.ini file
    config_path = os.path.join(current_dir, 'alembic.ini')
    
    # Create Alembic config
    alembic_cfg = Config(config_path)
    
    # Set the script location explicitly
    alembic_cfg.set_main_option('script_location', os.path.join(current_dir, 'migrations'))
    
    print("Running database migrations...")
    
    # Run the migration
    command.upgrade(alembic_cfg, 'head')
    
    print("Database migration completed successfully!")

if __name__ == '__main__':
    run_migrations()
