#!/usr/bin/env python3
"""
Quick Database Test
Run this to check if database connection works
"""

from sqlalchemy import create_engine, text

def test_database():
    try:
        # Database connection details
        DB_SERVER = "104.247.167.130,57673"
        DB_NAME = "yazil112_events"
        DB_USER = "yazil112_test2"
        DB_PASSWORD = "GURkan5391"
        DB_DRIVER = "ODBC+Driver+17+for+SQL+Server"

        # Create database URL
        DATABASE_URL = f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER}"

        print("🔍 Testing database connection...")
        print(f"📍 Server: {DB_SERVER}")
        print(f"📍 Database: {DB_NAME}")

        # Create engine
        engine = create_engine(DATABASE_URL)

        # Test connection
        with engine.connect() as conn:
            print("✅ Database connection successful!")

            # Check events table
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.events"))
            events_count = result.scalar()
            print(f"✅ Events in database: {events_count}")

            # Check users table
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.users"))
            users_count = result.scalar()
            print(f"✅ Users in database: {users_count}")

            # Check guests table
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.guests"))
            guests_count = result.scalar()
            print(f"✅ Guests in database: {guests_count}")

            # Check notifications table
            result = conn.execute(text("SELECT COUNT(*) FROM dbo.notification_logs"))
            notifications_count = result.scalar()
            print(f"✅ Notifications in database: {notifications_count}")

            # Get sample events
            if events_count > 0:
                result = conn.execute(text("""
                    SELECT TOP 5 id, title, owner_id, start_time, is_blocked
                    FROM dbo.events ORDER BY start_time DESC
                """))
                events = result.fetchall()
                print("\n📋 Sample events:")
                for event in events:
                    print(f"  - ID: {event.id}, Title: '{event.title}', Owner: {event.owner_id}, Blocked: {event.is_blocked}")

            # Get sample users
            if users_count > 0:
                result = conn.execute(text("""
                    SELECT TOP 3 id, email, role, full_name
                    FROM dbo.users ORDER BY id
                """))
                users = result.fetchall()
                print("\n👥 Sample users:")
                for user in users:
                    print(f"  - ID: {user.id}, Email: {user.email}, Role: {user.role}")

            return True

    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    print("🗄️  Database Connection Test")
    print("=" * 50)

    success = test_database()

    if success:
        print("\n✅ Database is working correctly!")
        print("🎯 Your API should be able to access data now.")
    else:
        print("\n❌ Database connection failed!")
        print("🔧 Check your database credentials and connection.")
