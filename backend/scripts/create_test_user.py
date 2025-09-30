import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from app.db import SessionLocal, Base, engine

# Import all models to ensure they are registered with SQLAlchemy
# Import individual models first to ensure proper relationship setup
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.guest import Guest
from app.models.notification import NotificationLog  # Import NotificationLog model

# Then import all models to ensure all relationships are properly set up
from app.models import *

# Initialize password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        
        if existing_user:
            # Update existing user
            existing_user.hashed_password = pwd_context.hash("testpassword123")
            existing_user.role = UserRole.superadmin
            existing_user.full_name = "Test User"
            db.commit()
            db.refresh(existing_user)
            print("Test user updated successfully!")
        else:
            # Create new test user
            test_user = User(
                email="test@example.com",
                full_name="Test User",
                hashed_password=pwd_context.hash("testpassword123"),
                role=UserRole.superadmin
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print("Test user created successfully!")
        
        print("Email: test@example.com")
        print("Password: testpassword123")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
