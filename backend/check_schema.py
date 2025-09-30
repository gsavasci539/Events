from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import sys

def get_engine():
    try:
        # Database connection details
        DB_SERVER = "104.247.167.130,57673"
        DB_NAME = "yazil112_events"
        DB_USER = "yazil112_test2"
        DB_PASSWORD = "GURkan5391"
        DB_DRIVER = "ODBC+Driver+17+for+SQL+Server"
        
        # Create database URL
        DATABASE_URL = f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER}"
        
        print(f"Connecting to database: {DB_SERVER}/{DB_NAME} as {DB_USER}")
        engine = create_engine(DATABASE_URL)
        
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✓ Successfully connected to the database")
            
        return engine
    except Exception as e:
        print(f"❌ Error connecting to database: {str(e)}")
        sys.exit(1)

def check_columns(engine):
    try:
        inspector = inspect(engine)
        print("\nGetting table information...")
        
        # List all tables in the dbo schema
        tables = inspector.get_table_names(schema='dbo')
        print(f"\nTables in dbo schema: {', '.join(tables) if tables else 'No tables found'}")

        # Check users table
        if 'users' in tables:
            columns = inspector.get_columns('users', schema='dbo')

            print("\nCurrent columns in 'users' table:")
            for column in columns:
                print(f"- {column['name']} ({column['type']})")

            # Check if our new columns exist
            column_names = [col['name'].lower() for col in columns]  # Convert to lowercase for case-insensitive check
            print("\nChecking for new columns:")
            print(f"first_name exists: {'first_name' in column_names}")
            print(f"last_name exists: {'last_name' in column_names}")
            print(f"has_paid exists: {'has_paid' in column_names}")
            print(f"subscription_plan exists: {'subscription_plan' in column_names}")
            print(f"subscription_start_date exists: {'subscription_start_date' in column_names}")
            print(f"subscription_end_date exists: {'subscription_end_date' in column_names}")
            print(f"payment_id exists: {'payment_id' in column_names}")
            print(f"is_superuser exists: {'is_superuser' in column_names}")

            # If columns don't exist, let's try to add them
            missing_columns = []
            if 'first_name' not in column_names:
                missing_columns.append('first_name')
            if 'last_name' not in column_names:
                missing_columns.append('last_name')
            if 'has_paid' not in column_names:
                missing_columns.append('has_paid')
            if 'subscription_plan' not in column_names:
                missing_columns.append('subscription_plan')
            if 'subscription_start_date' not in column_names:
                missing_columns.append('subscription_start_date')
            if 'subscription_end_date' not in column_names:
                missing_columns.append('subscription_end_date')
            if 'payment_id' not in column_names:
                missing_columns.append('payment_id')
            if 'is_superuser' not in column_names:
                missing_columns.append('is_superuser')

            if missing_columns:
                print(f"\nAdding missing columns: {', '.join(missing_columns)}")
                with engine.connect() as conn:
                    if 'first_name' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD first_name NVARCHAR(100) NULL"))
                        print("✓ Added first_name column")
                    if 'last_name' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD last_name NVARCHAR(100) NULL"))
                        print("✓ Added last_name column")
                    if 'has_paid' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD has_paid BIT DEFAULT 0"))
                        print("✓ Added has_paid column")
                    if 'subscription_plan' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD subscription_plan NVARCHAR(50) NULL"))
                        print("✓ Added subscription_plan column")
                    if 'subscription_start_date' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD subscription_start_date DATETIMEOFFSET NULL"))
                        print("✓ Added subscription_start_date column")
                    if 'subscription_end_date' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD subscription_end_date DATETIMEOFFSET NULL"))
                        print("✓ Added subscription_end_date column")
                    if 'payment_id' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD payment_id NVARCHAR(255) NULL"))
                        print("✓ Added payment_id column")
                    if 'is_superuser' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.users ADD is_superuser BIT DEFAULT 0"))
                        print("✓ Added is_superuser column")
                    conn.commit()

                    # Verify the columns were added
                    updated_columns = inspector.get_columns('users', schema='dbo')
                    updated_column_names = [col['name'].lower() for col in updated_columns]
                    print("\nUpdated columns in 'users' table:")
                    print(f"first_name exists: {'first_name' in updated_column_names}")
                    print(f"last_name exists: {'last_name' in updated_column_names}")
                    print(f"has_paid exists: {'has_paid' in updated_column_names}")
                    print(f"subscription_plan exists: {'subscription_plan' in updated_column_names}")
                    print(f"subscription_start_date exists: {'subscription_start_date' in updated_column_names}")
                    print(f"subscription_end_date exists: {'subscription_end_date' in updated_column_names}")
                    print(f"payment_id exists: {'payment_id' in updated_column_names}")
                    print(f"is_superuser exists: {'is_superuser' in updated_column_names}")
            else:
                print("\n✓ All required columns already exist!")
        else:
            print("\n❌ 'users' table not found in the database")

        # Check events table
        if 'events' in tables:
            columns = inspector.get_columns('events', schema='dbo')

            print("\nCurrent columns in 'events' table:")
            for column in columns:
                print(f"- {column['name']} ({column['type']})")

            # Check if our new columns exist
            column_names = [col['name'].lower() for col in columns]
            print("\nChecking for new columns in events table:")
            print(f"is_online exists: {'is_online' in column_names}")
            print(f"online_link exists: {'online_link' in column_names}")
            print(f"location_lat exists: {'location_lat' in column_names}")
            print(f"location_lng exists: {'location_lng' in column_names}")

            # If columns don't exist, let's try to add them
            missing_columns = []
            if 'is_online' not in column_names:
                missing_columns.append('is_online')
            if 'online_link' not in column_names:
                missing_columns.append('online_link')
            if 'location_lat' not in column_names:
                missing_columns.append('location_lat')
            if 'location_lng' not in column_names:
                missing_columns.append('location_lng')

            if missing_columns:
                print(f"\nAdding missing columns to events table: {', '.join(missing_columns)}")
                with engine.connect() as conn:
                    if 'is_online' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.events ADD is_online BIT DEFAULT 0"))
                        print("✓ Added is_online column")
                    if 'online_link' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.events ADD online_link NVARCHAR(500) NULL"))
                        print("✓ Added online_link column")
                    if 'location_lat' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.events ADD location_lat FLOAT NULL"))
                        print("✓ Added location_lat column")
                    if 'location_lng' in missing_columns:
                        conn.execute(text("ALTER TABLE dbo.events ADD location_lng FLOAT NULL"))
                        print("✓ Added location_lng column")
                    conn.commit()

                    # Verify the columns were added
                    updated_columns = inspector.get_columns('events', schema='dbo')
                    updated_column_names = [col['name'].lower() for col in updated_columns]
                    print("\nUpdated columns in 'events' table:")
                    print(f"is_online exists: {'is_online' in updated_column_names}")
                    print(f"online_link exists: {'online_link' in updated_column_names}")
                    print(f"location_lat exists: {'location_lat' in updated_column_names}")
                    print(f"location_lng exists: {'location_lng' in updated_column_names}")
            else:
                print("\n✓ All required columns already exist in events table!")
        else:
            print("\n❌ 'events' table not found in the database")

    except SQLAlchemyError as e:
        print(f"\n❌ Error checking/updating schema: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("=== Database Schema Checker ===")
    engine = get_engine()
    check_columns(engine)
    print("\n✓ Script completed successfully")
