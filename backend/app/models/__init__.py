# Import all models here so they are registered with SQLAlchemy
from .user import User
from .event import Event
from .guest import Guest
from .activity import ActivityLog  # Changed from .activity_log to .activity
from .notification_settings import NotificationSettings

__all__ = [
    'User',
    'Event',
    'Guest',
    'ActivityLog',
    'NotificationSettings',
]
