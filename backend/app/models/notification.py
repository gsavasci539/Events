from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(50), nullable=False)  # email or whatsapp
    recipient = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    event_id = Column(Integer, ForeignKey("dbo.events.id"), nullable=False)
    event = relationship("Event", back_populates="notifications")
