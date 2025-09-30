from pydantic import BaseModel, EmailStr
from typing import Optional


class GuestBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class GuestCreate(GuestBase):
    event_id: int


class GuestUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class GuestRead(GuestBase):
    id: int
    event_id: int

    class Config:
        from_attributes = True
