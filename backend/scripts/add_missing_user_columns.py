#!/usr/bin/env python3
"""
Add missing columns to users table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db import engine

def add_missing_columns():
    """Add missing columns to users table"""
    try:
        with engine.connect() as conn:
            # Check if columns exist first
            result = conn.execute(text("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' 
                AND TABLE_SCHEMA = 'dbo'
                AND COLUMN_NAME IN ('is_active', 'is_superuser')
            """))
            
            existing_columns = [row[0] for row in result]
            
            # Add is_active column if it doesn't exist
            if 'is_active' not in existing_columns:
                print("Adding is_active column...")
                conn.execute(text("""
                    ALTER TABLE dbo.users 
                    ADD is_active BIT NOT NULL DEFAULT 1
                """))
                conn.commit()
                print("✅ is_active column added successfully!")
            else:
                print("✅ is_active column already exists")
            
            # Add is_superuser column if it doesn't exist
            if 'is_superuser' not in existing_columns:
                print("Adding is_superuser column...")
                conn.execute(text("""
                    ALTER TABLE dbo.users 
                    ADD is_superuser BIT NOT NULL DEFAULT 0
                """))
                conn.commit()
                print("✅ is_superuser column added successfully!")
            else:
                print("✅ is_superuser column already exists")
                
        print("✅ Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    add_missing_columns()
