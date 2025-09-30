from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload, selectinload
from datetime import datetime, time

from ...db import get_db
from ...models.event import Event
from ...models.guest import Guest
from ...models.user import User
from ...models.notification import NotificationLog
from ...models.activity import ActivityLog
from ...models.user import UserRole
from ...security.auth import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    today_only: bool = True,
    show_all: bool = False,  # Debug parameter to bypass user restrictions
    current_user: User = Depends(get_current_user),
):
    # Base queries
    q_events = db.query(Event)
    q_guests = db.query(Guest)
    q_notifications = db.query(NotificationLog)

    # Restrict to current user's scope if not superadmin (unless show_all is True)
    if current_user.role != UserRole.superadmin and not show_all:
        q_events = q_events.filter(Event.owner_id == current_user.id)
        # Guests via user's events
        q_guests = (
            q_guests.join(Event, Guest.event_id == Event.id)
            .filter(Event.owner_id == current_user.id)
        )
        # Notifications via user's events
        q_notifications = (
            q_notifications.join(Event, NotificationLog.event_id == Event.id)
            .filter(Event.owner_id == current_user.id)
        )

    events_count = q_events.count()
    guests_count = q_guests.count()
    users_count = db.query(User).count() if current_user.role == UserRole.superadmin else 1
    notifications_count = q_notifications.count()

    latest_notifications = (
        q_notifications.options(joinedload(NotificationLog.event))
        .order_by(NotificationLog.sent_at.desc())
        .limit(10)
        .all()
    )
    latest = [
        {
            "id": n.id,
            "channel": n.channel,
            "recipient": n.recipient,
            "status": n.status,
            "sent_at": n.sent_at.isoformat(),
            "message": n.message,
            "event_title": getattr(getattr(n, "event", None), "title", None),
        }
        for n in latest_notifications
    ]

    # Get current time in UTC for filtering
    now = datetime.utcnow()
    
    # Filter activities
    q_act = db.query(ActivityLog)
    
    # For non-superadmins, only show their own activities (unless show_all is True)
    if current_user.role != UserRole.superadmin and not show_all:
        q_act = q_act.filter(ActivityLog.user_id == current_user.id)
    
    # Filter for today's activities if requested
    if today_only:
        start_utc = datetime.combine(now.date(), time.min)
        q_act = q_act.filter(ActivityLog.created_at >= start_utc)
    
    # Get the latest activities with user information
    latest_activities = (
        q_act.options(joinedload(ActivityLog.user))
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    
    # Only include activities for future events
    if latest_activities:
        # Get event IDs from activities that are related to events
        event_ids = [a.entity_id for a in latest_activities 
                    if a.entity_type == 'event' and a.entity_id is not None]
        
        # Get future events for these activities
        future_events = db.query(Event.id).filter(
            Event.id.in_(event_ids),
            Event.start_time >= now
        ).all()
        future_event_ids = {e.id for e in future_events}
        
        # Filter activities to only include those related to future events
        # or non-event related activities
        latest_activities = [
            a for a in latest_activities 
            if a.entity_type != 'event' or 
               (a.entity_id is not None and a.entity_id in future_event_ids)
        ]
    
    # Prepare activities with user information
    activities = []
    for a in latest_activities:
        user_name = None
        # Safely access user attributes with proper null checks
        if hasattr(a, 'user') and a.user:
            user_name = getattr(a.user, 'full_name', None) or (a.user.email.split('@')[0] if hasattr(a.user, 'email') and a.user.email else 'Unknown')
        
        activities.append({
            "id": a.id,
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "user_id": a.user_id,
            "user_name": user_name or 'Sistem',
            "detail": a.detail,
            "created_at": a.created_at.isoformat() if a.created_at else datetime.utcnow().isoformat(),
        })

    return {
        'events': events_count,
        'guests': guests_count,
        'users': users_count,
        'notifications': notifications_count,
        'latest_notifications': latest,
        'latest_activities': activities,
    }

@router.get("/debug")
def debug_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Debug endpoint to check database contents"""
    total_events = db.query(Event).count()
    total_users = db.query(User).count()
    total_guests = db.query(Guest).count()
    total_notifications = db.query(NotificationLog).count()

    # Check user's events
    user_events = db.query(Event).filter(Event.owner_id == current_user.id).count()

    # Check all events with details
    all_events = db.query(Event).limit(5).all()

    return {
        "total_events": total_events,
        "total_users": total_users,
        "total_guests": total_guests,
        "total_notifications": total_notifications,
        "user_events": user_events,
        "current_user_id": current_user.id,
        "current_user_role": current_user.role,
        "sample_events": [
            {
                "id": e.id,
                "title": e.title,
                "owner_id": e.owner_id,
                "start_time": e.start_time.isoformat() if e.start_time else None,
                "is_blocked": e.is_blocked
            }
            for e in all_events
        ]
    }
