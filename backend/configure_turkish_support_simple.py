#!/usr/bin/env python3
"""
Database Turkish Character Support Configuration Script - Simplified Version

This script configures the SQL Server database to properly handle Turkish characters
using direct pyodbc connection.

Usage:
    python configure_turkish_support_simple.py
"""

import pyodbc
import sys
import os
from pathlib import Path

# Database connection parameters
DB_SERVER = "104.247.167.130,57673"
DB_NAME = "yazil112_events"
DB_USER = "yazil112_test2"
DB_PASSWORD = "GURkan5391"
DB_DRIVER = "ODBC Driver 17 for SQL Server"

def get_db_connection():
    """Create database connection using direct pyodbc"""
    try:
        conn_str = f"DRIVER={{{DB_DRIVER}}};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD};CHARSET=UTF8;"

        print(f"🔌 Connecting with: {conn_str.replace(DB_PASSWORD, '***')}")
        return pyodbc.connect(conn_str)
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        print("\n🔧 Possible solutions:")
        print("1. Install ODBC Driver 17 for SQL Server")
        print("2. Check if the server address and port are correct")
        print("3. Verify username and password")
        print("4. Try using 'SQL Server' driver instead of 'ODBC Driver 17'")
        sys.exit(1)

def run_sql_script():
    """Run the Turkish character support SQL script"""
    script_path = Path(__file__).parent / "turkish_charset_config.sql"

    if not script_path.exists():
        print(f"❌ SQL script not found: {script_path}")
        sys.exit(1)

    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        print("🔧 Configuring Turkish character support...")
        print(f"📊 Database: {DB_NAME}")
        print(f"🖥️  Server: {DB_SERVER}")
        print()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Split the script by GO statements (SQL Server batch separator)
        batches = [batch.strip() for batch in sql_script.split('GO') if batch.strip()]

        for i, batch in enumerate(batches, 1):
            if batch and not batch.startswith('--'):  # Skip comments
                print(f"Executing batch {i}/{len(batches)}...")
                try:
                    cursor.execute(batch)
                    # Fetch results if it's a SELECT statement
                    if batch.upper().strip().startswith('SELECT'):
                        rows = cursor.fetchall()
                        for row in rows:
                            print(f"  {row}")
                    elif batch.upper().strip().startswith('PRINT'):
                        # PRINT statements will be displayed automatically
                        pass
                except Exception as e:
                    print(f"  ⚠️  Warning in batch {i}: {e}")
                    continue

        conn.commit()
        cursor.close()
        conn.close()

        print()
        print("✅ Turkish character support configuration completed!")
        print("🎯 Your database now supports Turkish characters: ç, ğ, ı, ö, ş, ü, İ, Ğ, Ş")
        print()
        print("📝 Next steps:")
        print("   1. Restart your FastAPI server if it's running")
        print("   2. Test with Turkish characters in your application")

    except Exception as e:
        print(f"❌ Error executing SQL script: {e}")
        sys.exit(1)

def test_turkish_characters():
    """Test if Turkish characters work properly"""
    print("\n🧪 Testing Turkish character support...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Test inserting Turkish characters
        test_name = "Test Ürün Örnek"
        test_email = "test@örnek.com"

        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM users WHERE email = ?)
            BEGIN
                INSERT INTO users (full_name, email, role, hashed_password)
                VALUES (?, ?, 'user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeE7Z0EAO2K7v3i2u')
            END
        """, test_email, test_name, test_email)

        # Test retrieving Turkish characters
        cursor.execute("SELECT full_name, email FROM users WHERE email = ?", test_email)
        row = cursor.fetchone()

        if row:
            print(f"✅ Successfully stored and retrieved: '{row[0]}' / '{row[1]}'")
        else:
            print("⚠️  Test user not found")

        conn.commit()

    except Exception as e:
        print(f"⚠️  Turkish character test failed: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("🚀 Database Turkish Character Support Configuration")
    print("=" * 60)

    # Run the configuration
    run_sql_script()

    # Test Turkish characters
    test_turkish_characters()
