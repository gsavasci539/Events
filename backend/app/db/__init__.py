from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


engine = create_engine(
    settings.DB_CONN,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
    future=True,
    connect_args={
        'charset': 'utf8',
        # For SQL Server ODBC driver
        'driver': 'ODBC Driver 17 for SQL Server',
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
