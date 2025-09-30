import sys
from pathlib import Path

# Ensure backend package is importable
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
from app.db import SessionLocal
from app.models.user import User  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.guest import Guest  # noqa: F401
from app.models.notification import NotificationLog  # noqa: F401


def main():
    load_dotenv()
    db = SessionLocal()
    try:
        email = "test@example.com"
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"FOUND: id={user.id}, email={user.email}, role={user.role}")
        else:
            print("NOT FOUND")
        count = db.query(User).count()
        print(f"Total users: {count}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
