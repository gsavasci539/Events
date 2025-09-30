from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db import Base


class Event(Base):
    __tablename__ = "events"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_time = Column(DateTime, nullable=True)

    # New fields for online/offline event support
    is_online = Column(Boolean, default=False, nullable=False, server_default='0')
    online_link = Column(String(500), nullable=True)

    # New fields for location coordinates
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    owner_id = Column(Integer, ForeignKey("dbo.users.id"), nullable=False)
    owner = relationship("User", back_populates="events")
    is_blocked = Column(Boolean, default=False, nullable=False, server_default='0')

    guests = relationship("Guest", back_populates="event", cascade="all,delete")
    notifications = relationship("NotificationLog", back_populates="event", cascade="all,delete")

    # Computed convenience attribute for serialization
    @property
    def owner_email(self) -> str | None:
        try:
            return self.owner.email if self.owner else None
        except Exception:
            return None
