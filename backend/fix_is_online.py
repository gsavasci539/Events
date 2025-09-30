#!/usr/bin/env python3
"""
Fix is_online field in database
This script will update any NULL is_online values to False
"""

from sqlalchemy import create_engine, text

def fix_is_online_field():
    try:
        # Database connection details
        DB_SERVER = "104.247.167.130,57673"
        DB_NAME = "yazil112_events"
        DB_USER = "yazil112_test2"
        DB_PASSWORD = "GURkan5391"
        DB_DRIVER = "ODBC+Driver+17+for+SQL+Server"

        # Create database URL
        DATABASE_URL = f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER}"

        print("🔧 Fixing is_online field in database...")
        print(f"📍 Connecting to: {DB_SERVER}")

        # Create engine
        engine = create_engine(DATABASE_URL)

        with engine.connect() as conn:
            # Check current NULL values
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.events WHERE is_online IS NULL"))
            null_count = result.scalar()
            print(f"📊 NULL is_online values found: {null_count}")

            if null_count > 0:
                # Update NULL values to False
                result = conn.execute(text("""
                    UPDATE dbo.events
                    SET is_online = 0
                    WHERE is_online IS NULL
                """))
                conn.commit()
                print(f"✅ Updated {result.rowcount} rows - set is_online to False")
            else:
                print("✅ No NULL values found - database is clean")

            # Verify the fix
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.events WHERE is_online IS NULL"))
            remaining_null = result.scalar()
            print(f"📊 Remaining NULL values: {remaining_null}")

            # Show sample data
            result = conn.execute(text("""
                SELECT TOP 5 id, title, is_online, is_blocked
                FROM dbo.events
                ORDER BY id DESC
            """))
            events = result.fetchall()
            print("\n📋 Sample events after fix:")
            for event in events:
                print(f"  - ID: {event.id}, Title: '{event.title}', is_online: {event.is_online}, is_blocked: {event.is_blocked}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🛠️  Database Fix Script")
    print("=" * 50)

    success = fix_is_online_field()

    if success:
        print("\n✅ Database fix completed successfully!")
        print("🎯 Your API should work now without validation errors.")
    else:
        print("\n❌ Database fix failed!")
        print("🔧 You may need to run this manually or check your database connection.")
