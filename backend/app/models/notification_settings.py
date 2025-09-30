from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..db import Base

class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    __table_args__ = {"schema": "dbo"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("dbo.users.id"), unique=True, nullable=False)
    
    # Email Settings
    email_enabled = Column(Boolean, default=False)
    email_from = Column(String(255), nullable=True)
    email_server = Column(String(255), nullable=True)
    email_port = Column(Integer, nullable=True)
    email_username = Column(String(255), nullable=True)
    email_password = Column(String(255), nullable=True)
    email_use_tls = Column(Boolean, default=True)
    
    # WhatsApp Settings (Twilio)
    whatsapp_enabled = Column(Boolean, default=False)
    twilio_account_sid = Column(String(255), nullable=True)
    twilio_auth_token = Column(String(255), nullable=True)
    twilio_phone_number = Column(String(50), nullable=True)
    
    # SMS Settings (Twilio)
    sms_enabled = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="notification_settings")
