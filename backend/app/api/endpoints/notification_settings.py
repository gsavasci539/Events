import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from typing import Any

from app import crud, models, schemas
from app.core.security import get_current_active_user
from app.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me/", response_model=schemas.NotificationSettings)
async def read_notification_settings(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Get current user's notification settings.
    """
    try:
        # Log request headers for debugging
        logger.info(f"Request headers: {dict(request.headers)}")
        
        # Add CORS headers to the response
        origin = request.headers.get('origin', '*')
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS, PUT, DELETE, POST"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "*"
        
        logger.info(f"Fetching notification settings for user {current_user.id}")
        
        try:
            db_notification_settings = crud.get_notification_settings(db, user_id=current_user.id)
        except Exception as e:
            logger.error(f"Database error in get_notification_settings: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
        if not db_notification_settings:
            logger.info(f"No settings found for user {current_user.id}, creating default settings")
            try:
                # Create default settings if not exists
                settings = crud.create_notification_settings(
                    db=db,
                    notification_settings=schemas.NotificationSettingsCreate(),
                    user_id=current_user.id
                )
                logger.info(f"Created default settings for user {current_user.id}")
                return settings
            except Exception as e:
                logger.error(f"Error creating default settings: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to create default settings: {str(e)}"
                )
        
        logger.info(f"Successfully retrieved settings for user {current_user.id}")
        return db_notification_settings
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in read_notification_settings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error: {str(e)}"
        )

@router.put("/me/", response_model=schemas.NotificationSettings)
async def update_notification_settings(
    request: Request,
    response: Response,
    *,
    db: Session = Depends(get_db),
    notification_settings_in: schemas.NotificationSettingsUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update current user's notification settings.
    """
    db_notification_settings = crud.get_notification_settings(db, user_id=current_user.id)
    if not db_notification_settings:
        return crud.create_notification_settings(
            db=db,
            notification_settings=notification_settings_in,
            user_id=current_user.id
        )
    
    return crud.update_notification_settings(
        db=db,
        db_notification_settings=db_notification_settings,
        notification_settings=notification_settings_in
    )

@router.options("/me/")
async def options_notification_settings(request: Request):
    response = Response()
    origin = request.headers.get('origin', '*')
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS, PUT, DELETE, POST"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Max-Age"] = "600"  # 10 minutes
    response.status_code = 200
    return response

# Admin endpoints for managing other users' settings
@router.get("/user/{user_id}", response_model=schemas.NotificationSettings)
def read_user_notification_settings(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Get notification settings for a specific user (admin only).
    """
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_notification_settings = crud.get_notification_settings(db, user_id=user_id)
    if not db_notification_settings:
        raise HTTPException(status_code=404, detail="Notification settings not found")
    return db_notification_settings
