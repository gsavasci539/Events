from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class NotificationSettingsBase(BaseModel):
    email_enabled: bool = False
    email_from: Optional[str] = None
    email_server: Optional[str] = None
    email_port: Optional[int] = None
    email_username: Optional[str] = None
    email_password: Optional[str] = None
    email_use_tls: bool = True
    whatsapp_enabled: bool = False
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    sms_enabled: bool = False

    @validator('email_port')
    def validate_port(cls, v):
        if v is not None and (v < 1 or v > 65535):
            raise ValueError('Port must be between 1 and 65535')
        return v

class NotificationSettingsCreate(NotificationSettingsBase):
    pass

class NotificationSettingsUpdate(NotificationSettingsBase):
    pass

class NotificationSettingsInDBBase(NotificationSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class NotificationSettings(NotificationSettingsInDBBase):
    pass
