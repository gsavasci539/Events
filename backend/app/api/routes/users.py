from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.sql import func

from ...db import get_db
from ...models.user import User, UserRole
from ...models.disabled_user import DisabledUser
from ...schemas.user import UserRead, UserUpdate
from ...security.auth import get_current_user, require_superadmin, require_superadmin_or_self

router = APIRouter(prefix="/users", tags=["users"])

class PaginatedResponse(BaseModel):
    items: List[UserRead]
    total: int
    page: int
    per_page: int
    total_pages: int

@router.get("/", response_model=PaginatedResponse)
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_superadmin),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page")
):
    # Calculate offset and limit
    offset = (page - 1) * per_page
    
    # Get total count
    total = db.query(func.count(User.id)).scalar()
    total_pages = (total + per_page - 1) // per_page  # Ceiling division
    
    # Get paginated users
    users = db.query(User).order_by(User.id.asc()).offset(offset).limit(per_page).all()
    
    # Annotate disabled flag
    disabled_ids = {row.user_id for row in db.query(DisabledUser).all()}
    items: List[UserRead] = []
    for u in users:
        data = UserRead.model_validate(u)
        data.disabled = u.id in disabled_ids
        items.append(data)
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


def get_user_for_update(user_id: int, current_user: User = Depends(get_current_user)):
    """Get user for update with proper permission check"""
    return require_superadmin_or_self(current_user, target_user_id=user_id)

@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information for debugging"""
    return current_user

@router.get("/test-auth")
def test_auth(current_user: User = Depends(get_current_user)):
    """Test authentication endpoint"""
    return {
        "authenticated": True,
        "user_id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@router.put("/simple-update/{user_id}", response_model=UserRead)
def simple_update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simple user update - allows any authenticated user to update any user"""
    print(f"DEBUG: Simple update - user_id: {user_id}, current_user_id: {current_user.id}, current_user_role: {current_user.role}")

    user_obj = db.get(User, user_id)
    if not user_obj:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")

    # Allow any authenticated user to update any user (for testing)
    print(f"DEBUG: Allowing update by user {current_user.id} to user {user_id}")

    if payload.email is not None:
        user_obj.email = payload.email
    if payload.full_name is not None:
        user_obj.full_name = payload.full_name

    # Only superadmin can change roles
    if payload.role is not None:
        if current_user.role != UserRole.superadmin:
            raise HTTPException(status_code=403, detail="Only superadmin can change user roles")
        user_obj.role = payload.role

    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)

    # compute disabled flag
    disabled = db.get(DisabledUser, user_obj.id) is not None
    data = UserRead.model_validate(user_obj)
    data.disabled = disabled
    return data

@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user by ID - allows self-update for all users, role changes only by superadmin"""
    try:
        print(f"DEBUG: Update user request - user_id: {user_id}, current_user_id: {current_user.id}, current_user_role: {current_user.role}")

        # Check if the user exists
        user_obj = db.get(User, user_id)
        if not user_obj:
            print(f"DEBUG: User {user_id} not found in database")
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        print(f"DEBUG: Found user {user_id} - email: {user_obj.email}, name: {user_obj.full_name}")

        # Check permissions
        if current_user.role != UserRole.superadmin and current_user.id != user_id:
            print(f"DEBUG: Permission denied - User {current_user.id} cannot update user {user_id}")
            raise HTTPException(
                status_code=403,
                detail="Sadece kendi profilinizi güncelleyebilirsiniz"
            )

        # Store original values for comparison
        original_email = user_obj.email
        original_name = user_obj.full_name

        print(f"DEBUG: Updating user {user_id} with email: {payload.email}, full_name: {payload.full_name}")

        # Allow all users to update their own basic info
        if payload.email is not None:
            print(f"DEBUG: Updating email from '{original_email}' to '{payload.email}'")
            user_obj.email = payload.email
        if payload.full_name is not None:
            print(f"DEBUG: Updating full_name from '{original_name}' to '{payload.full_name}'")
            user_obj.full_name = payload.full_name

        # Only superadmin can change roles
        if payload.role is not None and payload.role != user_obj.role:
            if current_user.role != UserRole.superadmin:
                print(f"DEBUG: User {current_user.id} tried to change role but is not superadmin")
                raise HTTPException(
                    status_code=403,
                    detail="Sadece yöneticiler kullanıcı rolünü değiştirebilir"
                )
            print(f"DEBUG: Superadmin changing role from {user_obj.role} to {payload.role}")
            user_obj.role = payload.role

        # Only process password change if provided
        if payload.password is not None:
            if current_user.role != UserRole.superadmin and current_user.id != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Sadece kendi şifrenizi değiştirebilirsiniz"
                )
            print("DEBUG: Updating password")
            from ...security.auth import get_password_hash
            user_obj.hashed_password = get_password_hash(payload.password)

        print(f"DEBUG: About to commit changes for user {user_id}")

        db.add(user_obj)
        try:
            db.commit()
            print(f"DEBUG: Database commit successful for user {user_obj.id}")
        except Exception as e:
            print(f"DEBUG: Database commit failed: {e}")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Veritabanı hatası: {str(e)}")

        try:
            db.refresh(user_obj)
            print(f"DEBUG: User refreshed successfully - ID: {user_obj.id}, email: {user_obj.email}, name: {user_obj.full_name}")
        except Exception as e:
            print(f"DEBUG: User refresh failed: {e}")
            # Don't raise here as the commit was successful

        # compute disabled flag
        try:
            disabled = db.get(DisabledUser, user_obj.id) is not None
            print(f"DEBUG: Disabled flag computed: {disabled}")
        except Exception as e:
            print(f"DEBUG: Error computing disabled flag: {e}")
            disabled = False

        try:
            data = UserRead.model_validate(user_obj)
            data.disabled = disabled
            print(f"DEBUG: UserRead model created successfully")
            print(f"DEBUG: Returning user data - ID: {data.id}, email: {data.email}, name: {data.full_name}, disabled: {data.disabled}")
            return data
        except Exception as e:
            print(f"DEBUG: UserRead model creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Model doğrulama hatası: {str(e)}")

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch any other exceptions and log them
        print(f"DEBUG: Beklenmeyen hata oluştu: {e}")
        import traceback
        print(f"DEBUG: Hata detayı: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Beklenmeyen bir hata oluştu: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/profile", response_model=UserRead)
def update_own_profile(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update current user's own profile - simplified version for testing"""
    print(f"DEBUG: Profile update - current_user_id: {current_user.id}, role: {current_user.role}")

    # Allow users to update their own profile
    if current_user.role == UserRole.superadmin:
        # Superadmin can update any field including role
        user_obj = current_user
        if payload.role is not None:
            user_obj.role = payload.role
    else:
        # Regular users can only update email and full_name
        user_obj = db.get(User, current_user.id)
        if not user_obj:
            raise HTTPException(status_code=404, detail="User not found")

        # Prevent role changes for non-superadmin users
        if payload.role is not None:
            raise HTTPException(status_code=403, detail="Only superadmin can change user roles")

    if payload.email is not None:
        user_obj.email = payload.email
    if payload.full_name is not None:
        user_obj.full_name = payload.full_name

    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)

    # compute disabled flag
    disabled = db.get(DisabledUser, user_obj.id) is not None
    data = UserRead.model_validate(user_obj)
    data.disabled = disabled
    return data


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_superadmin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.post("/{user_id}/block", response_model=UserRead)
def block_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_superadmin)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")
    
    # Disable the user
    disabled_user = DisabledUser(user_id=user_id)
    db.add(disabled_user)
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/{user_id}/unblock", response_model=UserRead)
def unblock_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_superadmin)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")
    
    # Enable the user
    db.query(DisabledUser).filter(DisabledUser.user_id == user_id).delete()
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/{user_id}/enable", response_model=UserRead)
def enable_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_superadmin)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")
    
    # Remove from disabled users
    db.query(DisabledUser).filter(DisabledUser.user_id == user_id).delete()
    db.commit()
    
    return user
