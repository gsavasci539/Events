import sys
import re
from pathlib import Path

# Ensure backend package is importable
backend_dir = str(Path(__file__).parent.parent)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
from app.db import SessionLocal
from app.models.activity import ActivityLog


PATTERNS = [
    # Events
    (re.compile(r"^Created event '(.+?)' \(#(\d+)\)$"),
     lambda m: f"Etkinlik oluşturuldu: '{m.group(1)}' (#{m.group(2)})"),
    (re.compile(r"^Updated event '(.+?)' \(#(\d+)\)$"),
     lambda m: f"Etkinlik güncellendi: '{m.group(1)}' (#{m.group(2)})"),
    (re.compile(r"^Deleted event '(.+?)' \(#(\d+)\)$"),
     lambda m: f"Etkinlik silindi: '{m.group(1)}' (#{m.group(2)})"),

    # Guests
    (re.compile(r"^Added guest '(.+?)' to event #(\d+)$"),
     lambda m: f"Davetli eklendi: '{m.group(1)}' (Etkinlik #{m.group(2)})"),
    (re.compile(r"^Updated guest '(.+?)' on event #(\d+)$"),
     lambda m: f"Davetli güncellendi: '{m.group(1)}' (Etkinlik #{m.group(2)})"),
    (re.compile(r"^Deleted guest '(.+?)' from event #(\d+)$"),
     lambda m: f"Davetli silindi: '{m.group(1)}' (Etkinlik #{m.group(2)})"),

    # Notifications
    (re.compile(r"^Sent to ([^ ]+) via (\w+) for event #(\d+): (.+)$"),
     lambda m: f"{m.group(2).title()} ile {m.group(1)} alıcısına gönderim (Etkinlik #{m.group(3)}): {m.group(4)}"),
    (re.compile(r"^Broadcast via (\w+) for event #(\d+): sent=(\d+), failed=(\d+)$"),
     lambda m: f"Toplu gönderim ({m.group(1)}) - Etkinlik #{m.group(2)}: başarılı={m.group(3)}, başarısız={m.group(4)}"),
]


def localize_detail(detail: str) -> str | None:
    # If already Turkish (simple heuristic), skip
    if any(keyword in detail for keyword in ["Etkinlik", "Davetli", "gönderim", "Toplu gönderim"]):
        return None
    for pattern, repl in PATTERNS:
        m = pattern.match(detail)
        if m:
            return repl(m)
    return None


def main(dry_run: bool = False):
    load_dotenv()
    db = SessionLocal()
    updated = 0
    total = 0
    try:
        logs = db.query(ActivityLog).all()
        for log in logs:
            total += 1
            new_detail = localize_detail(log.detail or "")
            if new_detail:
                print(f"{log.id}: '{log.detail}' -> '{new_detail}'")
                if not dry_run:
                    log.detail = new_detail
                    db.add(log)
                    updated += 1
        if not dry_run:
            db.commit()
    finally:
        db.close()
    print(f"Done. Scanned: {total}, Updated: {updated}, Dry-run: {dry_run}")


if __name__ == "__main__":
    # To dry-run (no DB commit), run: python scripts/localize_activity_logs.py --dry-run
    dry = "--dry-run" in sys.argv
    main(dry_run=dry)
