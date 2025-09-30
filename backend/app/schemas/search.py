from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class SearchResult(BaseModel):
    """Represents a single search result item."""
    id: int
    type: str  # 'event', 'guest', or 'user'
    title: str
    description: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    url: str

class SearchResponse(BaseModel):
    """Response model for search results."""
    results: list[SearchResult]
    total: int
    page: int
    size: int
    pages: int
    query: str
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)
