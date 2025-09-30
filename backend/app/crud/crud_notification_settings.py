from sqlalchemy.orm import Session
from app import models, schemas

def get_notification_settings(db: Session, user_id: int):
    return db.query(models.NotificationSettings).filter(
        models.NotificationSettings.user_id == user_id
    ).first()

def create_notification_settings(
    db: Session, 
    notification_settings: schemas.NotificationSettingsCreate, 
    user_id: int
):
    db_notification_settings = models.NotificationSettings(
        **notification_settings.model_dump(),
        user_id=user_id
    )
    db.add(db_notification_settings)
    db.commit()
    db.refresh(db_notification_settings)
    return db_notification_settings

def update_notification_settings(
    db: Session, 
    db_notification_settings: models.NotificationSettings, 
    notification_settings: schemas.NotificationSettingsUpdate
):
    for field, value in notification_settings.model_dump(exclude_unset=True).items():
        setattr(db_notification_settings, field, value)
    
    db.add(db_notification_settings)
    db.commit()
    db.refresh(db_notification_settings)
    return db_notification_settings
