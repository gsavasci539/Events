from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
import logging
import requests
from datetime import datetime, timedelta

from ...db import get_db
from ...models.event import Event
from ...models.guest import Guest
from ...models.user import User
from ...security.auth import get_current_user
from ...schemas.search import SearchResult, SearchResponse

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)

@router.get("/reverse")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Reverse geocode coordinates to get address information
    """
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "format": "json",
                "lat": lat,
                "lon": lon,
                "addressdetails": 1,
                "accept-language": "tr"
            },
            headers={
                "User-Agent": "EventApp/1.0"
            },
            timeout=10
        )

        if response.status_code != 200:
            logger.error(f"Reverse geocoding API error: {response.status_code}")
            raise HTTPException(
                status_code=500,
                detail="Reverse geocoding servisi şu anda kullanılamıyor"
            )

        result = response.json()
        return result

    except requests.Timeout:
        logger.error(f"Reverse geocoding request timed out for coordinates: {lat},{lon}")
        raise HTTPException(
            status_code=504,
            detail="Reverse geocoding servisi yanıt vermedi"
        )
    except Exception as e:
        logger.error(f"Reverse geocoding error for coordinates {lat},{lon}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Reverse geocoding sırasında bir hata oluştu"
        )

@router.get("/geocode")
async def geocode_search(
    q: str = Query(..., min_length=2, description="Search query for locations"),
    limit: int = Query(5, ge=1, le=10, description="Number of results")
):
    """
    Geocode search using OpenStreetMap Nominatim API
    """
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "format": "json",
                "q": q,
                "limit": limit,
                "addressdetails": 1,
                "countrycodes": "tr",
                "accept-language": "tr"
            },
            headers={
                "User-Agent": "EventApp/1.0"
            },
            timeout=10
        )

        if response.status_code != 200:
            logger.error(f"Geocoding API error: {response.status_code}")
            raise HTTPException(
                status_code=500,
                detail="Geocoding servisi şu anda kullanılamıyor"
            )

        results = response.json()
        return results

    except requests.Timeout:
        logger.error(f"Geocoding request timed out for query: {q}")
        raise HTTPException(
            status_code=504,
            detail="Geocoding servisi yanıt vermedi"
        )
    except Exception as e:
        logger.error(f"Geocoding error for query '{q}': {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Geocoding sırasında bir hata oluştu"
        )

@router.get("/", response_model=List[SearchResult])
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results per type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search across events, guests, and users.
    For users, only superadmin can search all users.
    """
    try:
        search_query = q.strip()
        if not search_query:
            return []
            
        results = []
        
        # Search events with related data
        events = db.query(Event).options(
            joinedload(Event.guests)
        ).filter(
            or_(
                Event.title.ilike(f"%{search_query}%"),
                Event.description.ilike(f"%{search_query}%"),
                Event.location.ilike(f"%{search_query}%")
            )
        ).order_by(Event.start_date.desc()).limit(limit).all()
        
        for event in events:
            guest_count = len(event.guests) if hasattr(event, 'guests') else 0
            results.append(SearchResult(
                id=event.id,
                type="event",
                title=event.title,
                description=event.description or "",
                metadata={
                    "start_date": event.start_date.isoformat() if event.start_date else None,
                    "location": event.location,
                    "guest_count": guest_count
                },
                url=f"/events/{event.id}"
            ))
        
        # Search guests
        guests = db.query(Guest).filter(
            or_(
                Guest.name.ilike(f"%{search_query}%"),
                Guest.email.ilike(f"%{search_query}%"),
                Guest.phone.ilike(f"%{search_query}%")
            )
        ).options(
            joinedload(Guest.event)
        ).limit(limit).all()
        
        for guest in guests:
            event_title = guest.event.title if guest.event else "Etkinlik yok"
            results.append(SearchResult(
                id=guest.id,
                type="guest",
                title=guest.name or "İsimsiz Misafir",
                description=guest.email or guest.phone or "İletişim bilgisi yok",
                metadata={
                    "event_id": guest.event_id,
                    "event_title": event_title,
                    "phone": guest.phone,
                    "email": guest.email
                },
                url=f"/guests/{guest.id}"
            ))
        
        # Search users (only for superadmin)
        if current_user.role == "superadmin":
            users = db.query(User).filter(
                and_(
                    User.is_active == True,
                    or_(
                        User.full_name.ilike(f"%{search_query}%"),
                        User.email.ilike(f"%{search_query}%")
                    )
                )
            ).limit(limit).all()
            
            for user in users:
                results.append(SearchResult(
                    id=user.id,
                    type="user",
                    title=user.full_name or user.email,
                    description=user.role or "Kullanıcı",
                    metadata={
                        "email": user.email,
                        "role": user.role,
                        "is_active": user.is_active
                    },
                    url=f"/users/{user.id}"
                ))
        
        # Sort results by relevance (simple implementation - can be improved)
        search_lower = search_query.lower()
        def sort_key(result: SearchResult) -> int:
            # Higher score for matches in title than in description
            title_score = 2 if search_lower in (result.title or "").lower() else 0
            desc_score = 1 if search_lower in (result.description or "").lower() else 0
            return -(title_score + desc_score)
            
        results.sort(key=sort_key)
        
        return results
        
    except Exception as e:
        logger.error(f"Search error for query '{q}': {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Arama sırasında bir hata oluştu: {str(e)}"
        )
