#!/usr/bin/env python3

import sys
import os

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    print("Testing database connection...")
    print("-" * 50)

    # Try to import and test database connection
    from app.core.config import settings
    print(f"Database URL: {settings.DB_CONN}")

    # Try to create engine and connect
    from sqlalchemy import create_engine, text

    engine = create_engine(
        settings.DB_CONN,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,
        future=True,
    )

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"✅ Basic connection: OK (result: {row[0]})")

            # Test database exists
            result = conn.execute(text("SELECT name FROM sys.databases WHERE name = :db_name"),
                                {"db_name": settings.DB_NAME})
            if result.fetchone():
                print(f"✅ Database '{settings.DB_NAME}' exists")
            else:
                print(f"❌ Database '{settings.DB_NAME}' does not exist")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("This might be due to:")
        print("1. Network connectivity issues")
        print("2. Wrong database credentials")
        print("3. Database server not running")
        print("4. Firewall blocking the connection")

except Exception as e:
    print(f"❌ Configuration error: {e}")
    print("Make sure your .env file has correct database settings")
