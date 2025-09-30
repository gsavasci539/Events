from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    is_online: Optional[bool] = False
    online_link: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_online: Optional[bool] = None
    online_link: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class EventRead(EventBase):
    id: int
    owner_id: Optional[int] = None
    owner_email: Optional[str] = None
    is_blocked: Optional[bool] = False

    class Config:
        from_attributes = True
