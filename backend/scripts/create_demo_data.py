import sys
from datetime import datetime, timedelta
from pathlib import Path
import random

# Ensure backend package is importable
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
from app.db import SessionLocal
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.guest import Guest
from app.models.notification import NotificationLog  # noqa: F401

USERS = [
    "gsavasci@gmail.com",
    "hozturk@gmail.com",
    "user1@example.com",
    "user2@example.com",
]

SAMPLE_TITLES = [
    "Ürün Tanıtım Toplantısı",
    "Ağ Buluşması",
    "Motivasyon Semineri",
    "Aylık Değerlendirme",
]
SAMPLE_LOCS = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"]
FIRST_NAMES = ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Ali", "Zeynep", "Can", "Ece", "Mert", "Elif"]
LAST_NAMES = ["Yılmaz", "Demir", "Şahin", "Çelik", "Kaya", "Yıldız", "Aydın", "Arslan", "Doğan", "Kurt"]


def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def ensure_events_and_guests(db, user: User, events_per_user: int = 2, guests_per_event: int = 5):
    # Create a few events in the future for this user
    created_events = []
    for i in range(events_per_user):
        title = random.choice(SAMPLE_TITLES)
        start = datetime.utcnow() + timedelta(days=i + 1)
        evt = Event(
            title=title,
            description=f"{title} için bilgilendirme",
            location=random.choice(SAMPLE_LOCS),
            start_time=start,
            owner_id=user.id,
        )
        db.add(evt)
        db.commit()
        db.refresh(evt)
        created_events.append(evt)
        print(f"Etkinlik oluşturuldu: {evt.title} (#{evt.id}) - {user.email}")

        # Create guests
        for j in range(guests_per_event):
            name = random_name()
            email = f"{name.split()[0].lower()}.{name.split()[1].lower()}+{evt.id}@example.com"
            phone = f"5{random.randint(0,9)}{random.randint(0,9)}{random.randint(0,9)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
            g = Guest(name=name, email=email, phone=phone, event_id=evt.id)
            db.add(g)
            db.commit()
            db.refresh(g)
            print(f"  Davetli eklendi: {g.name} (#{g.id}) -> Etkinlik #{evt.id}")


def main():
    load_dotenv()
    db = SessionLocal()
    try:
        for email in USERS:
            user = db.query(User).filter(User.email == email, User.role == UserRole.distributor).first()
            if not user:
                print(f"Kullanıcı bulunamadı (atlandı): {email}")
                continue
            ensure_events_and_guests(db, user)
        print("Demo verileri oluşturma tamamlandı.")
    finally:
        db.close()


if __name__ == "__main__":
    random.seed(42)
    main()
