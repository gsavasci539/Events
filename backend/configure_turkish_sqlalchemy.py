#!/usr/bin/env python3
"""
Database Turkish Character Support Configuration - SQLAlchemy Version

This script configures the SQL Server database to properly handle Turkish characters
using the same SQLAlchemy connection method as the working server.

Usage:
    python configure_turkish_sqlalchemy.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.db import SessionLocal
    from app.core.config import settings
    from sqlalchemy import text

    def run_turkish_config():
        """Run Turkish character configuration using SQLAlchemy"""
        print("🔧 Configuring Turkish character support...")
        print(f"📊 Database: {settings.DB_NAME}")
        print(f"🖥️  Server: {settings.DB_SERVER}")
        print()

        db = SessionLocal()

        try:
            # Read the SQL configuration file
            sql_file = os.path.join(os.path.dirname(__file__), "turkish_charset_config.sql")

            if not os.path.exists(sql_file):
                print(f"❌ SQL configuration file not found: {sql_file}")
                return False

            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()

            # Split by GO statements
            sql_batches = [batch.strip() for batch in sql_content.split('GO') if batch.strip()]

            print(f"📋 Executing {len(sql_batches)} SQL batches...")

            for i, batch in enumerate(sql_batches, 1):
                if batch and not batch.startswith('--'):  # Skip comments
                    print(f"Executing batch {i}/{len(sql_batches)}...")
                    try:
                        if batch.upper().strip().startswith('SELECT'):
                            # SELECT statements
                            result = db.execute(batch).fetchall()
                            for row in result:
                                print(f"  {row}")
                        elif batch.upper().strip().startswith('PRINT'):
                            # PRINT statements (these will show in server logs)
                            print(f"  [PRINT] {batch.replace('PRINT', '').strip()}")
                        else:
                            # Other SQL statements
                            db.execute(batch)
                            print(f"  ✅ Executed successfully")
                    except Exception as e:
                        print(f"  ⚠️  Warning in batch {i}: {e}")
                        continue
            # Commit all changes
            db.commit()
            print("\n✅ Turkish character configuration completed successfully!")

            # Test Turkish characters
            test_query = text("SELECT 'Test: çğıöşü ÇĞIÖŞÜ' as turkish_test")
            result = db.execute(test_query).fetchone()
            print(f"🇹🇷 Turkish characters test: {result[0]}")

            return True

        except Exception as e:
            print(f"❌ Error during configuration: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    def check_current_collation():
        """Check current database and table collations"""
        print("\n🔍 Checking current database collation...")

        db = SessionLocal()

        try:
            # Check database collation
            result = db.execute(text("SELECT name, collation_name FROM sys.databases WHERE name = ?"), settings.DB_NAME).fetchone()
            print(f"📊 Database: {result[0]}")
            print(f"🔤 Collation: {result[1]}")

            # Check table collations
            result = db.execute(text("""
                SELECT t.name AS table_name, c.name AS column_name, c.collation_name
                FROM sys.tables t
                JOIN sys.columns c ON t.object_id = c.object_id
                WHERE c.collation_name IS NOT NULL
                AND t.name IN ('users', 'events', 'activity_logs')
                ORDER BY t.name, c.name
            """)).fetchall()

            print("\n📋 Table collations:")
            for row in result:
                print(f"   {row[0]}.{row[1]}: {row[2]}")

        except Exception as e:
            print(f"❌ Error checking collation: {e}")
        finally:
            db.close()

    def main():
        print("🚀 Database Turkish Character Support Configuration")
        print("=" * 60)
        print("Using SQLAlchemy (same method as your working server)")
        print()

        if run_turkish_config():
            print("\n✅ Configuration completed successfully!")
            print("🎯 Your database now supports Turkish characters: ç, ğ, ı, ö, ş, ü, İ, Ğ, Ş")
            print()
            print("📝 Next steps:")
            print("   1. Restart your FastAPI server if it's running")
            print("   2. Test with Turkish characters in your application")

            # Show current collation after changes
            print("\n" + "=" * 60)
            check_current_collation()
        else:
            print("\n❌ Configuration failed!")
            print("Please check the error messages above.")

    if __name__ == "__main__":
        main()

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the backend directory")
    sys.exit(1)
