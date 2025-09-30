import sys
from pathlib import Path
from datetime import datetime

# Ensure backend package is importable
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
from app.db import SessionLocal
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.guest import Guest
from app.models.notification import NotificationLog
from app.models.activity import ActivityLog


def create_notifications_for_event(db, event: Event, max_per_event: int = 3):
    guests = db.query(Guest).filter(Guest.event_id == event.id).limit(max_per_event).all()
    created = 0
    for g in guests:
        recipient = g.email or g.phone or None
        if not recipient:
            continue
        message = f"Merhaba {g.name}, '{event.title}' etkinliğine bekleriz. Konum: {event.location or '-'}"
        log = NotificationLog(
            channel="email" if g.email else "whatsapp",
            recipient=recipient,
            message=message,
            status="sent",
            event_id=event.id,
            sent_at=datetime.utcnow(),
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        # Activity summary per log (notify)
        db.add(ActivityLog(
            action="notify",
            entity_type="notification",
            entity_id=log.id,
            user_id=event.owner_id,
            detail=f"{('Email' if g.email else 'Whatsapp')} ile {recipient} alıcısına gönderim (Etkinlik #{event.id}): sent",
        ))
        db.commit()
        created += 1
    return created


def main():
    load_dotenv()
    db = SessionLocal()
    total = 0
    try:
        # Only distributor users
        users = db.query(User).filter(User.role == UserRole.distributor).all()
        for u in users:
            events = db.query(Event).filter(Event.owner_id == u.id).all()
            for ev in events:
                c = create_notifications_for_event(db, ev)
                if c:
                    print(f"Olusturulan bildirim: {c} adet (Etkinlik #{ev.id} - {u.email})")
                total += c
    finally:
        db.close()
    print(f"Bitti. Toplam olusturulan bildirim: {total}")


if __name__ == "__main__":
    main()
