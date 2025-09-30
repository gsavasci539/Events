"""
Map URL utilities for generating links to various map providers
"""

from typing import Optional
from enum import Enum


class MapProvider(str, Enum):
    GOOGLE = "google"
    OPENSTREETMAP = "openstreetmap"
    YANDEX = "yandex"
    APPLE = "apple"


def generate_map_url(
    lat: float,
    lng: float,
    provider: MapProvider = MapProvider.GOOGLE,
    zoom: int = 15,
    marker: bool = True,
    directions: bool = False
) -> str:
    """
    Generate map URL for given coordinates and options

    Args:
        lat: Latitude coordinate
        lng: Longitude coordinate
        provider: Map provider to use
        zoom: Zoom level (default: 15)
        marker: Whether to show marker at location
        directions: Whether to open in directions mode

    Returns:
        str: Complete map URL
    """
    if provider == MapProvider.GOOGLE:
        params = f"q={lat},{lng}" if not directions else f"q={lat},{lng}"
        return f"https://www.google.com/maps?{params}&z={zoom}"
    elif provider == MapProvider.OPENSTREETMAP:
        layers = "&layers=M" if marker else ""
        return f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}&zoom={zoom}{layers}"
    elif provider == MapProvider.YANDEX:
        pt_param = f"&pt={lng},{lat},pm2rdm" if marker else ""
        return f"https://yandex.com/maps/?ll={lng},{lat}&z={zoom}{pt_param}"
    elif provider == MapProvider.APPLE:
        dir_flag = "&dirflg=d" if directions else ""
        return f"https://maps.apple.com/?ll={lat},{lng}&z={zoom}{dir_flag}"
    else:
        # Default to Google Maps
        return f"https://www.google.com/maps?q={lat},{lng}"


def generate_short_map_url(lat: float, lng: float, provider: MapProvider = MapProvider.GOOGLE) -> str:
    """
    Generate short map URL for notifications and sharing
    """
    return generate_map_url(lat, lng, provider, zoom=16, marker=True)


def generate_directions_url(lat: float, lng: float, provider: MapProvider = MapProvider.GOOGLE) -> str:
    """
    Generate map URL with directions mode
    """
    return generate_map_url(lat, lng, provider, zoom=15, directions=True)


def get_map_url_for_notification(event_location: Optional[str], lat: Optional[float], lng: Optional[float]) -> str:
    """
    Generate appropriate map URL for notifications based on event data

    Args:
        event_location: Event location string (for fallback)
        lat: Latitude coordinate
        lng: Longitude coordinate

    Returns:
        str: Map URL or empty string if no location data available
    """
    if lat is not None and lng is not None:
        return generate_short_map_url(lat, lng, MapProvider.GOOGLE)
    elif event_location:
        # Fallback: try to create a search URL
        return f"https://www.google.com/maps/search/?api=1&query={event_location.replace(' ', '+')}"
    else:
        return ""
