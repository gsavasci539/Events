from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)  # create, update, delete, notify
    entity_type = Column(String(50), nullable=False)  # event, guest, notification
    entity_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("dbo.users.id"), nullable=True)
    user = relationship("User", back_populates="activities")
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
