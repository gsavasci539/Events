from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base


class Guest(Base):
    __tablename__ = "guests"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    event_id = Column(Integer, ForeignKey("dbo.events.id"), nullable=False)
    event = relationship("Event", back_populates="guests")
