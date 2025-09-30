from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ...db import get_db
from ...models.event import Event
from ...models.user import User, UserRole
from ...schemas.event import EventCreate, EventRead, EventUpdate
from ...security.auth import get_current_user, require_superadmin
from ...models.activity import ActivityLog

router = APIRouter(prefix="/events", tags=["events"])


class PaginatedResponse(BaseModel):
    items: List[EventRead]
    total: int
    page: int
    per_page: int
    total_pages: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=PaginatedResponse)
def list_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page")
):
    try:
        q = db.query(Event)

        # Get current datetime in UTC for comparison
        now = datetime.utcnow()

        if current_user.role == UserRole.superadmin:
            # Superadmins can see all events, including blocked ones
            # Add a show_past parameter for superadmins to optionally see past events
            show_past = Query(False, description="Show past events (superadmin only)")
            show_blocked = Query(False, description="Show blocked events (superadmin only)")
            if not show_past:
                q = q.filter(Event.start_time >= now)
            if not show_blocked:
                q = q.filter(Event.is_blocked == False)
        else:
            # Regular users can only see their own non-blocked future events
            q = q.filter(
                Event.owner_id == current_user.id,
                Event.is_blocked == False,
                Event.start_time >= now
            )

        # Get total count for pagination
        total = q.count()

        # Apply pagination
        offset = (page - 1) * per_page
        items = q.order_by(Event.start_time.desc())\
                  .offset(offset)\
                  .limit(per_page)\
                  .all()

        total_pages = (total + per_page - 1) // per_page  # Ceiling division

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        # Log the error and return a user-friendly message
        print(f"Database error in list_events: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection error. Please try again later."
        )


@router.post("/", response_model=EventRead)
def create_event(event_in: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = Event(**event_in.dict(), owner_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    # Log create activity
    db.add(ActivityLog(
        action="create",
        entity_type="event",
        entity_id=event.id,
        user_id=current_user.id,
        detail=f"Etkinlik oluşturuldu: '{event.title}' (#{event.id})",
    ))
    db.commit()
    return event


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        event = db.get(Event, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return event
    except Exception as e:
        print(f"Database error in get_event: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection error. Please try again later."
        )


@router.put("/{event_id}", response_model=EventRead)
def update_event(event_id: int, event_in: EventUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for k, v in event_in.dict(exclude_unset=True).items():
        setattr(event, k, v)
    db.add(event)
    db.commit()
    db.refresh(event)
    # Log update activity
    db.add(ActivityLog(
        action="update",
        entity_type="event",
        entity_id=event.id,
        user_id=current_user.id,
        detail=f"Etkinlik güncellendi: '{event.title}' (#{event.id})",
    ))
    db.commit()
    return event


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # Log activity before deletion
    log = ActivityLog(
        action="delete",
        entity_type="event",
        entity_id=event.id,
        user_id=current_user.id,
        detail=f"Etkinlik silindi: '{event.title}' (#{event.id})",
    )
    db.delete(event)
    db.add(log)
    db.commit()
    return {"ok": True}


@router.post("/{event_id}/block", response_model=EventRead)
def block_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_superadmin)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    if event.is_blocked:
        return event
        
    event.is_blocked = True
    db.add(event)
    
    # Log the action
    db.add(ActivityLog(
        action="block",
        entity_type="event",
        entity_id=event.id,
        user_id=current_user.id,
        detail=f"Etkinlik engellendi: '{event.title}' (#{event.id})",
    ))
    db.commit()
    db.refresh(event)
    return event


@router.post("/{event_id}/unblock", response_model=EventRead)
def unblock_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_superadmin)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    if not event.is_blocked:
        return event
        
    event.is_blocked = False
    db.add(event)
    
    # Log the action
    db.add(ActivityLog(
        action="unblock",
        entity_type="event",
        entity_id=event.id,
        user_id=current_user.id,
        detail=f"Etkinlik engeli kaldırıldı: '{event.title}' (#{event.id})",
    ))
    db.commit()
    db.refresh(event)
    return event
