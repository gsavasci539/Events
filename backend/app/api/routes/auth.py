from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging

from ...db import get_db
from ...models.user import User, UserRole
from ...schemas.user import UserCreate, UserRead
from ...security.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        logging.info(f"Login attempt for email={form_data.username}")
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            logging.warning("Login failed: user not found")
            raise HTTPException(status_code=400, detail="Incorrect username or password")
        if not verify_password(form_data.password, user.hashed_password):
            logging.warning("Login failed: password mismatch")
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        # Debug: Log the user data from database
        logging.info(f"User data from DB - ID: {user.id}, Email: {user.email}, Full Name: {user.full_name}, Role: {user.role}")

        # Include user details in the token
        token_data = {
            "sub": str(user.id),
            "role": user.role.value,
            "email": user.email,
            "full_name": user.full_name if user.full_name else None
        }

        token = create_access_token(token_data)

        # Debug: Log what we're sending back
        logging.info(f"Sending response with user data: {user.email}, {user.full_name}, {user.role.value}")

        # Return both the token and user data for debugging
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
