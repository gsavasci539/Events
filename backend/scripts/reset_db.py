import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the backend directory to Python path
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.db import Base, engine
from app.models.user import User  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.guest import Guest  # noqa: F401
from app.models.notification import NotificationLog  # noqa: F401


def main():
    load_dotenv()
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")


if __name__ == "__main__":
    main()
