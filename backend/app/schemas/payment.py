from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class PaymentCreate(BaseModel):
    """Schema for creating a payment."""
    package_id: str = Field(..., description="ID of the subscription package")
    amount: Optional[float] = Field(None, description="Amount in the smallest currency unit (e.g., kuruş for TRY)")
    token: Optional[str] = Field(None, description="Payment token from the payment processor")

class PaymentResponse(BaseModel):
    """Schema for payment response."""
    success: bool = Field(..., description="Whether the payment was successful")
    message: str = Field(..., description="Status message")
    subscription_plan: Optional[str] = Field(None, description="Name of the subscribed plan")
    start_date: Optional[datetime] = Field(None, description="Subscription start date")
    end_date: Optional[datetime] = Field(None, description="Subscription end date")
    payment_id: Optional[str] = Field(None, description="Payment processor's transaction ID")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Payment processed successfully",
                "subscription_plan": "Pro Plan",
                "start_date": "2023-01-01T00:00:00",
                "end_date": "2023-02-01T00:00:00",
                "payment_id": "pmt_123456789"
            }
        }
