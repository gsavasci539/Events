from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter()

# Mock payment processor - replace with actual payment gateway integration
async def process_payment(amount: int, package_id: str, user_id: int) -> Dict[str, Any]:
    """Mock payment processing.
    
    In a real application, this would integrate with a payment gateway like Stripe, PayPal, etc.
    """
    # Simulate payment processing delay
    import time
    time.sleep(1)
    
    # In a real app, this would be the actual payment processing logic
    return {
        "success": True,
        "payment_id": f"pmt_{int(datetime.utcnow().timestamp())}",
        "amount": amount,
        "currency": "TRY",
        "status": "succeeded"
    }

@router.post("/process", response_model=PaymentResponse)
async def process_payment_endpoint(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process a payment for a subscription package."""
    # In a real app, validate the package_id and amount against your products
    packages = {
        "basic": {"name": "Temel Paket", "price": 99, "duration_days": 30},
        "pro": {"name": "Profesyonel Paket", "price": 199, "duration_days": 30},
        "enterprise": {"name": "Kurumsal Paket", "price": 499, "duration_days": 30}
    }
    
    if payment_data.package_id not in packages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz paket"
        )
    
    package = packages[payment_data.package_id]
    
    # Process the payment
    try:
        payment_result = await process_payment(
            amount=package["price"],
            package_id=payment_data.package_id,
            user_id=current_user.id
        )
        
        if not payment_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ödeme işlemi başarısız oldu"
            )
        
        # Update user's subscription
        now = datetime.utcnow()
        end_date = now + timedelta(days=package["duration_days"])
        
        current_user.has_paid = True
        current_user.subscription_plan = package["name"]
        current_user.subscription_start_date = now
        current_user.subscription_end_date = end_date
        current_user.payment_id = payment_result["payment_id"]
        
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Ödeme başarıyla tamamlandı",
            "subscription_plan": package["name"],
            "start_date": now,
            "end_date": end_date,
            "payment_id": payment_result["payment_id"]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ödeme işlenirken bir hata oluştu: {str(e)}"
        )

@router.get("/subscription/status")
async def get_subscription_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's subscription status."""
    return {
        "has_paid": current_user.has_paid,
        "subscription_plan": current_user.subscription_plan,
        "subscription_start_date": current_user.subscription_start_date,
        "subscription_end_date": current_user.subscription_end_date,
        "is_active": current_user.is_active
    }
