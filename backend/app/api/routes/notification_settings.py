from fastapi import APIRouter
from app.api.endpoints import notification_settings as endpoints

router = APIRouter()
router.include_router(
    endpoints.router,
    prefix="/notification-settings",
    tags=["Notification Settings"]
)
