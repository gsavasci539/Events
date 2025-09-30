import sys
from pathlib import Path

# Ensure backend package is importable
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
from passlib.context import CryptContext
from app.db import SessionLocal
from app.models.user import User, UserRole  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.guest import Guest  # noqa: F401
from app.models.notification import NotificationLog  # noqa: F401


TEST_USERS = [
    {"email": "gsavasci@gmail.com", "full_name": "Gürkan Savaşçı", "password": "test12345"},
    {"email": "hozturk@gmail.com", "full_name": "Hüseyin Öztürk", "password": "test12345"},
    {"email": "user1@example.com", "full_name": "User One", "password": "test12345"},
    {"email": "user2@example.com", "full_name": "User Two", "password": "test12345"},
]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upsert_user(db, email: str, full_name: str, password: str, role: UserRole = UserRole.distributor):
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.full_name = full_name
        user.hashed_password = pwd_context.hash(password)
        user.role = role
        db.add(user)
        print(f"Updated user: {email}")
    else:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=pwd_context.hash(password),
            role=role,
        )
        db.add(user)
        print(f"Created user: {email}")


def main():
    load_dotenv()
    db = SessionLocal()
    try:
        for u in TEST_USERS:
            upsert_user(db, u["email"], u["full_name"], u["password"], UserRole.distributor)
        db.commit()
        print("Done creating/updating test distributor users.")
        print("Emails & default password: test12345")
    finally:
        db.close()


if __name__ == "__main__":
    main()
