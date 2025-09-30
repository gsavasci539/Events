#!/usr/bin/env python3
"""
Simple Database Connection Test

This script tests the database connection using the same method as the working server.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.config import settings
    from app.db import SessionLocal
    import pyodbc

    def test_connection():
        """Test database connection"""
        print("🔍 Testing database connection...")

        # Method 1: Using SQLAlchemy engine (same as the server)
        try:
            print("📊 Method 1: SQLAlchemy connection (same as server)")
            db = SessionLocal()
            result = db.execute("SELECT @@VERSION").fetchone()
            print(f"✅ SQLAlchemy connection successful!")
            print(f"📊 SQL Server version: {result[0]}")

            # Test Turkish characters
            test_query = "SELECT 'Test: çğıöşü ÇĞIÖŞÜ' as turkish_test"
            result = db.execute(test_query).fetchone()
            print(f"🇹🇷 Turkish characters: {result[0]}")

            db.close()
            return True

        except Exception as e:
            print(f"❌ SQLAlchemy connection failed: {e}")

        # Method 2: Direct pyodbc connection
        try:
            print("\n📊 Method 2: Direct pyodbc connection")
            conn_str = f"DRIVER={{{settings.DB_DRIVER}}};SERVER={settings.DB_SERVER};DATABASE={settings.DB_NAME};UID={settings.DB_USER};PWD={settings.DB_PASSWORD}"
            print(f"🔌 Connection string: {conn_str.replace(settings.DB_PASSWORD, '***')}")

            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()

            cursor.execute("SELECT @@VERSION")
            version = cursor.fetchone()
            print(f"✅ Direct pyodbc connection successful!")
            print(f"📊 SQL Server version: {version[0]}")

            # Test Turkish characters
            cursor.execute("SELECT 'Test: çğıöşü ÇĞIÖŞÜ' as turkish_test")
            result = cursor.fetchone()
            print(f"🇹🇷 Turkish characters: {result[0]}")

            cursor.close()
            conn.close()
            return True

        except Exception as e:
            print(f"❌ Direct pyodbc connection failed: {e}")
            return False

    def check_database_collation():
        """Check current database collation"""
        print("\n🔍 Checking database collation...")

        try:
            db = SessionLocal()

            # Check database collation
            result = db.execute("SELECT name, collation_name FROM sys.databases WHERE name = ?", settings.DB_NAME).fetchone()
            print(f"📊 Database: {result[0]}")
            print(f"🔤 Collation: {result[1]}")

            # Check table collations
            result = db.execute("""
                SELECT t.name AS table_name, c.name AS column_name, c.collation_name
                FROM sys.tables t
                JOIN sys.columns c ON t.object_id = c.object_id
                WHERE c.collation_name IS NOT NULL
                AND t.name IN ('users', 'events', 'activity_logs')
                ORDER BY t.name, c.name
            """).fetchall()

            print("\n📋 Table collations:")
            for row in result:
                print(f"   {row[0]}.{row[1]}: {row[2]}")

            db.close()

        except Exception as e:
            print(f"❌ Error checking collation: {e}")

    if __name__ == "__main__":
        print("🚀 Database Connection Test")
        print("=" * 50)

        if test_connection():
            print("\n✅ Database connection is working!")
            check_database_collation()
        else:
            print("\n❌ Database connection failed!")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the backend directory")
    sys.exit(1)
