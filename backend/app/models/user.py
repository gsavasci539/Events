from sqlalchemy import Column, Integer, String, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from ..db import Base


class UserRole(str, enum.Enum):
    distributor = "distributor"
    superadmin = "superadmin"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    # Use NVARCHAR for proper Unicode support including Turkish characters
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)  # Already supports Unicode
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.distributor)
    has_paid = Column(Boolean, default=False, nullable=False)
    # Temporarily make these optional for existing database compatibility
    # is_active = Column(Boolean, default=True)
    # is_superuser = Column(Boolean, default=False)

    events = relationship("Event", back_populates="owner", cascade="all,delete")
    activities = relationship("ActivityLog", back_populates="user")
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False, cascade="all,delete-orphan")
