import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import text

# Add the backend directory to Python path
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.db import SessionLocal

def main():
    load_dotenv()
    db = SessionLocal()
    
    try:
        # Check if the column already exists
        result = db.execute(
            text("""
            SELECT COUNT(*)
            FROM information_schema.columns 
            WHERE table_schema = 'dbo' 
            AND table_name = 'events' 
            AND column_name = 'is_blocked'
            """)
        ).scalar()
        
        if result == 0:
            print("Adding 'is_blocked' column to 'events' table...")
            db.execute(
                text("""
                ALTER TABLE dbo.events 
                ADD is_blocked BIT NOT NULL 
                CONSTRAINT DF_events_is_blocked DEFAULT 0
                """)
            )
            db.commit()
            print("Successfully added 'is_blocked' column to 'events' table.")
        else:
            print("'is_blocked' column already exists in 'events' table.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
