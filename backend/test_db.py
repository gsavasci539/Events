#!/usr/bin/env python3
"""
Test database connection and create a test user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db import get_db, engine
from app.models.user import User, UserRole
from app.security.auth import get_password_hash

def test_db_connection():
    """Test database connection"""
    try:
        # Test connection
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            
        # Test session
        db = next(get_db())
        
        # Check if test user exists
        test_user = db.query(User).filter(User.email == "admin@example.com").first()
        
        if test_user:
            print("✅ Test user already exists!")
            print(f"   Email: {test_user.email}")
            print(f"   Role: {test_user.role}")
        else:
            print("Creating test user...")
            # Create test user
            test_user = User(
                email="admin@example.com",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.superadmin,
                is_active=True,
                is_superuser=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print("✅ Test user created successfully!")
            print(f"   Email: {test_user.email}")
            print(f"   Role: {test_user.role}")
            
        db.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_db_connection()
