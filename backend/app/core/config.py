import os
from pydantic import PostgresDsn, validator
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any, Union


class Settings(BaseSettings):
    # API Settings
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # JWT Settings
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Database Settings
    DB_SERVER: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_DRIVER: str = "ODBC+Driver+17+for+SQL+Server"
    DB_CONN: Optional[str] = None
    
    @validator("DB_CONN", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        if isinstance(v, str):
            return v
        # Add charset and collation parameters for Turkish character support
        return f"mssql+pyodbc://{values.get('DB_USER')}:{values.get('DB_PASSWORD')}@{values.get('DB_SERVER')}/{values.get('DB_NAME')}?driver={values.get('DB_DRIVER')}&charset=utf8mb4"

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://88.230.79.211:5173",
        "https://88.230.79.211:5173",
        "http://88.230.79.211",
        "https://88.230.79.211",
        "http://event.bytebridge.com.tr",
        "https://event.bytebridge.com.tr",
        "http://89.252.184.134:5003",
        "http://89.252.184.134:5173"
    ]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_HEADERS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True

    # SMTP Settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    SMTP_FROM: Optional[str] = None

    # Twilio Settings
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_FROM: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True


# Create settings instance
settings = Settings()
