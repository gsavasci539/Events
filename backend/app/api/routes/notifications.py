from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db import get_db
from ...models.notification import NotificationLog
from ...models.event import Event
from ...models.user import User, UserRole
from ...models.activity import ActivityLog
from ...schemas.notification import NotificationCreate, NotificationRead
from ...security.auth import get_current_user
from ...notifications.email_adapter import EmailAdapter
from ...notifications.whatsapp_adapter import WhatsAppAdapter
from ...models.guest import Guest
from ...utils.map_utils import get_map_url_for_notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/send")
def send_notification(payload: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.get(Event, payload.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Choose adapter
    if payload.channel == "email":
        sender = EmailAdapter()
        get_contact = lambda g: g.email
    elif payload.channel == "whatsapp":
        sender = WhatsAppAdapter()
        get_contact = lambda g: g.phone
    else:
        raise HTTPException(status_code=400, detail="Unsupported channel")

    # If a single recipient is provided, send only once.
    if payload.recipient:
        # Build personalized message
        personalized = f"'{event.title}' etkinligi hakkinda bilgi: Konum: {event.location or '-'}, Baslangic: {event.start_time}."

        # Add map URL for face-to-face events with coordinates
        if not event.is_online:
            map_url = get_map_url_for_notification(event.location, event.location_lat, event.location_lng)
            if map_url:
                personalized += f" Harita: {map_url}"

        # Add online link for online events
        if event.is_online and event.online_link:
            personalized += f" Çevrimiçi Katilim: {event.online_link}"

        personalized += f" {payload.message}"

        ok, status_text = sender.send(to=payload.recipient, message=personalized)
        log = NotificationLog(
            channel=payload.channel,
            recipient=payload.recipient,
            message=personalized,
            status="sent" if ok else "failed",
            event_id=payload.event_id,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        # Activity log (single send)
        db.add(ActivityLog(
            action="notify",
            entity_type="notification",
            entity_id=log.id,
            user_id=current_user.id,
            detail=f"{payload.channel.title()} ile {payload.recipient} alicisina gonderim (Etkinlik #{payload.event_id}): {status_text}",
        ))
        db.commit()
        return {
            "ok": ok,
            "status": status_text,
            "log_id": log.id,
            "results": [
                {
                    "guest_id": None,
                    "guest_name": None,
                    "recipient": payload.recipient,
                    "ok": ok,
                    "status": status_text,
                    "log_id": log.id,
                }
            ],
        }

    # Otherwise, broadcast to all guests of the event
    guests = db.query(Guest).filter(Guest.event_id == payload.event_id).all()
    if not guests:
        raise HTTPException(status_code=400, detail="No guests found for this event")

    sent = 0
    failed = 0
    logs: list[int] = []
    detailed: list[dict] = []
    for g in guests:
        contact = get_contact(g)
        if not contact:
            # skip guests without the required contact for the selected channel
            failed += 1
            continue
        # personalize message
        personalized = f"Hello {g.name}, '{event.title}' etkinligi hakkinda bilgi: Konum: {event.location or '-'}, Baslangic: {event.start_time}."

        # Add map URL for face-to-face events with coordinates
        if not event.is_online:
            map_url = get_map_url_for_notification(event.location, event.location_lat, event.location_lng)
            if map_url:
                personalized += f" Harita: {map_url}"

        # Add online link for online events
        if event.is_online and event.online_link:
            personalized += f" Çevrimiçi Katilim: {event.online_link}"

        personalized += f" {payload.message}"
        ok, status_text = sender.send(to=contact, message=personalized)
        log = NotificationLog(
            channel=payload.channel,
            recipient=contact,
            message=personalized,
            status="sent" if ok else "failed",
            event_id=payload.event_id,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        logs.append(log.id)
        detailed.append({
            "guest_id": g.id,
            "guest_name": g.name,
            "recipient": contact,
            "ok": ok,
            "status": status_text,
            "log_id": log.id,
        })
        if ok:
            sent += 1
        else:
            failed += 1

    # Activity log (broadcast summary)
    db.add(ActivityLog(
        action="notify",
        entity_type="notification",
        entity_id=None,
        user_id=current_user.id,
        detail=f"Toplu gonderim ({payload.channel}) - Etkinlik #{payload.event_id}: basarili={sent}, basarisiz={failed}",
    ))
    db.commit()

@router.get("/recent")
def get_recent_notifications(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent notifications for the current user"""
    q_notifications = db.query(NotificationLog)

    # Restrict to current user's scope if not superadmin
    if current_user.role != UserRole.superadmin:
        # Get user's events to filter notifications
        user_events = db.query(Event.id).filter(Event.owner_id == current_user.id).all()
        event_ids = [e.id for e in user_events]
        q_notifications = q_notifications.filter(NotificationLog.event_id.in_(event_ids))

    # Get recent notifications with event information
    recent_notifications = (
        q_notifications
        .options(joinedload(NotificationLog.event))
        .order_by(NotificationLog.sent_at.desc())
        .limit(limit)
        .all()
    )

    # Format the response
    notifications = [
        {
            "id": n.id,
            "channel": n.channel,
            "recipient": n.recipient,
            "status": n.status,
            "sent_at": n.sent_at.isoformat(),
            "message": n.message,
            "event_title": getattr(getattr(n, "event", None), "title", None),
        }
        for n in recent_notifications
    ]

    return {"notifications": notifications}

@router.get("/unread-count")
def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get count of unread notifications for the current user"""
    q_notifications = db.query(NotificationLog)

    # Restrict to current user's scope if not superadmin
    if current_user.role != UserRole.superadmin:
        # Get user's events to filter notifications
        user_events = db.query(Event.id).filter(Event.owner_id == current_user.id).all()
        event_ids = [e.id for e in user_events]
        q_notifications = q_notifications.filter(NotificationLog.event_id.in_(event_ids))

    # Count notifications with failed status (unread)
    unread_count = q_notifications.filter(NotificationLog.status == "failed").count()

    return {"unread_count": unread_count}
