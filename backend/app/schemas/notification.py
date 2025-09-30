from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    event_id: int
    channel: str  # email or whatsapp
    recipient: Optional[str] = None
    message: str


class NotificationRead(BaseModel):
    id: int
    event_id: int
    channel: str
    recipient: str
    message: str
    status: str
    sent_at: datetime

    class Config:
        from_attributes = True
