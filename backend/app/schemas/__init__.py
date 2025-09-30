# This file makes the schemas directory a Python package

# Re-export commonly used schema classes so they can be accessed as
# attributes on the package, e.g. `from app import schemas` then
# `schemas.NotificationSettings`
from .notification_settings import (
    NotificationSettings,
    NotificationSettingsCreate,
    NotificationSettingsUpdate,
)
from .user import (
    UserCreate,
    UserRead,
    UserUpdate,
    UserRole,
)
from .event import (
    EventCreate,
    EventRead,
    EventUpdate,
)
from .guest import (
    GuestCreate,
    GuestRead,
    GuestUpdate,
)
from .notification import (
    NotificationCreate,
    NotificationRead,
)

__all__ = [
    "NotificationSettings",
    "NotificationSettingsCreate",
    "NotificationSettingsUpdate",
    "UserCreate",
    "UserRead", 
    "UserUpdate",
    "UserRole",
    "EventCreate",
    "EventRead",
    "EventUpdate",
    "GuestCreate",
    "GuestRead",
    "GuestUpdate",
    "NotificationCreate",
    "NotificationRead",
]
