from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core.config import settings
from ..db import get_db
from ..models.user import User, UserRole
from ..models.disabled_user import DisabledUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    # Block disabled users
    if db.get(DisabledUser, user.id) is not None:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı bırakılmıştır")
    return user


def require_superadmin_or_self(user: User = Depends(get_current_user), target_user_id: int = None) -> User:
    """Allow superadmin or the user themselves to perform the action"""
    if user.role == UserRole.superadmin:
        return user
    if target_user_id and user.id == target_user_id:
        return user
    raise HTTPException(status_code=403, detail="Insufficient permissions - Only superadmin or the user themselves can perform this action")


def require_superadmin(user: User = Depends(get_current_user)) -> User:
    """Require the user to be a superadmin"""
    if user.role != UserRole.superadmin:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user
