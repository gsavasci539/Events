from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...db import get_db
from ...models.guest import Guest
from ...models.event import Event
from ...models.user import User, UserRole
from ...schemas.guest import GuestCreate, GuestRead, GuestUpdate
from ...security.auth import get_current_user
from ...models.activity import ActivityLog

router = APIRouter(prefix="/guests", tags=["guests"])


@router.get("/event/{event_id}", response_model=List[GuestRead])
def list_event_guests(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return db.query(Guest).filter(Guest.event_id == event_id).all()


@router.post("/", response_model=GuestRead)
def add_guest(guest_in: GuestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.get(Event, guest_in.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    guest = Guest(**guest_in.dict())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    # Log create activity
    db.add(ActivityLog(
        action="create",
        entity_type="guest",
        entity_id=guest.id,
        user_id=current_user.id,
        detail=f"Davetli eklendi: '{guest.name}' (Etkinlik #{guest.event_id})",
    ))
    db.commit()
    return guest


@router.put("/{guest_id}", response_model=GuestRead)
def update_guest(guest_id: int, guest_in: GuestUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    guest = db.get(Guest, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    event = db.get(Event, guest.event_id)
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for k, v in guest_in.dict(exclude_unset=True).items():
        setattr(guest, k, v)
    db.add(guest)
    db.commit()
    db.refresh(guest)
    # Log update activity
    db.add(ActivityLog(
        action="update",
        entity_type="guest",
        entity_id=guest.id,
        user_id=current_user.id,
        detail=f"Davetli güncellendi: '{guest.name}' (Etkinlik #{guest.event_id})",
    ))
    db.commit()
    return guest


@router.delete("/{guest_id}")
def delete_guest(guest_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    guest = db.get(Guest, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    event = db.get(Event, guest.event_id)
    if current_user.role != UserRole.superadmin and event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    log = ActivityLog(
        action="delete",
        entity_type="guest",
        entity_id=guest.id,
        user_id=current_user.id,
        detail=f"Davetli silindi: '{guest.name}' (Etkinlik #{guest.event_id})",
    )
    db.delete(guest)
    db.add(log)
    db.commit()
    return {"ok": True}
