#!/usr/bin/env python3
"""
CORS Test Script
Run this to verify CORS configuration is working
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseSettings

class Settings(BaseSettings):
    CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://88.230.79.211:5173", "https://88.230.79.211:5173", "http://88.230.79.211", "https://88.230.79.211"]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_HEADERS = "*"
    CORS_ALLOW_CREDENTIALS = True

    class Config:
        case_sensitive = True

settings = Settings()

app = FastAPI(title="CORS Test")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
    expose_headers=["*"],
    max_age=86400,
)

@app.get("/test-cors")
def test_cors():
    return {
        "status": "CORS working",
        "origins": settings.CORS_ORIGINS,
        "methods": settings.CORS_METHODS
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting CORS test server...")
    print(f"✅ Allowed origins: {settings.CORS_ORIGINS}")
    print(f"✅ Allowed methods: {settings.CORS_METHODS}")
    print("✅ Server running on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
