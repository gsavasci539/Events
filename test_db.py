#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.config import settings
    from app.db import engine, Base
    from sqlalchemy import text

    print("Testing database connection...")
    print("-" * 50)
    print(f"Database URL: {settings.DB_CONN}")

    try:
        # Test basic connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"✅ Basic connection: OK (result: {row[0]})")

            # Test database exists
            result = conn.execute(text("SELECT name FROM sys.databases WHERE name = :db_name"),
                                {"db_name": settings.DB_NAME})
            if result.fetchone():
                print(f"✅ Database '{settings.DB_NAME}' exists")

                # Test if we can query a table
                try:
                    result = conn.execute(text("SELECT COUNT(*) FROM users"))
                    count = result.fetchone()[0]
                    print(f"✅ Users table accessible, count: {count}")
                except Exception as e:
                    print(f"⚠️  Users table not accessible: {e}")

            else:
                print(f"❌ Database '{settings.DB_NAME}' does not exist")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")

except Exception as e:
    print(f"❌ Configuration error: {e}")
