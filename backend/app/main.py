import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db import engine, Base
from .api.routes import auth as auth_routes
from .api.routes import events as events_routes
from .api.routes import guests as guests_routes
from .api.routes import notifications as notifications_routes
from .api.routes import stats as stats_routes
from .api.routes import users as users_routes
from .api.routes import search as search_routes
from .api.routes import notification_settings as notification_settings_routes
from .models import activity  # noqa: F401 ensure ActivityLog is registered

app = FastAPI(title="Herbalife Events API")

# Configure CORS with specific allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://event.bytebridge.com.tr",
        "https://event.bytebridge.com.tr",
        "http://localhost:3000",  # For local development
        "http://localhost:5173",  # Common Vite dev server port
        "http://89.252.184.134:5003",  # Backend server
        "http://89.252.184.134:5173",  # Frontend server
        "http://88.230.79.211:5173",   # Alternative frontend
        "https://88.230.79.211:5173",  # Alternative frontend HTTPS
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # 10 minutes
)

# Add middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request
    logger = logging.getLogger("uvicorn.access")
    try:
        logger.info(f"Request: {request.method} {request.url}")
        logger.info(f"Headers: {dict(request.headers)}")
    except Exception as log_error:
        print(f"Logging error: {log_error}")
        print(f"Request: {request.method} {request.url}")
        print(f"Headers: {dict(request.headers)}")

    # Call the next middleware/route handler
    response = await call_next(request)

    # Log response status code
    try:
        logger.info(f"Response: {response.status_code}")
    except Exception as log_error:
        print(f"Logging error: {log_error}")
        print(f"Response: {response.status_code}")

    return response

# CORS is already configured above, no need for additional middleware

# Create tables if not exist (with error handling)
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"⚠️  Warning: Could not create database tables: {e}")
    print("This might be due to database connectivity issues")

# Include routers
app.include_router(auth_routes.router, prefix=settings.API_PREFIX)
app.include_router(events_routes.router, prefix=settings.API_PREFIX)
app.include_router(guests_routes.router, prefix=settings.API_PREFIX)
app.include_router(notifications_routes.router, prefix=settings.API_PREFIX)
app.include_router(stats_routes.router, prefix=settings.API_PREFIX)
app.include_router(users_routes.router, prefix=settings.API_PREFIX)
app.include_router(search_routes.router, prefix=settings.API_PREFIX)
app.include_router(notification_settings_routes.router, prefix=settings.API_PREFIX)
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "cors_origins": settings.CORS_ORIGINS,
        "api_prefix": settings.API_PREFIX
    }

@app.get("/db-test")
def db_test():
    try:
        from .db import get_db
        from .models.user import User
        from .models.notification_settings import NotificationSettings
        from sqlalchemy import inspect
        
        db = next(get_db())
        
        # Test users table
        user_count = db.query(User).count()
        
        # Test notification_settings table
        inspector = inspect(db.bind)
        table_exists = inspector.has_table('notification_settings', schema='dbo')
        
        if table_exists:
            notification_count = db.query(NotificationSettings).count()
            return {
                "status": "db_ok", 
                "user_count": user_count,
                "notification_settings_table_exists": True,
                "notification_settings_count": notification_count
            }
        else:
            return {
                "status": "db_ok", 
                "user_count": user_count,
                "notification_settings_table_exists": False,
                "error": "notification_settings table does not exist"
            }
    except Exception as e:
        return {"status": "db_error", "error": str(e)}
    finally:
        if 'db' in locals():
            db.close()
