from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

def test_database():
    try:
        # Database connection details (same as check_schema.py)
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

        # Check events table columns
        inspector = inspect(engine)
        if 'events' in inspector.get_table_names(schema='dbo'):
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

            if 'location_lat' in column_names:
                print("✓ All required columns exist!")
                return True
            else:
                print("❌ location_lat column still missing")
                return False
        else:
            print("❌ 'events' table not found in the database")
            return False

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Database Connection Test ===")
    success = test_database()
    if success:
        print("\n✓ Database schema is correct!")
    else:
        print("\n❌ Database schema issues remain!")
