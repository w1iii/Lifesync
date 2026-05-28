"""
Cache service for LifeSync
Handles data caching with TTL
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from services.firestore import firestore_service

class CacheService:
    
    @staticmethod
    async def get_or_fetch(
        cache_id: str,
        fetch_fn,
        ttl_minutes: int = 45
    ) -> Dict[str, Any]:
        """
        Get from cache or fetch fresh data
        
        Args:
            cache_id: Unique cache key
            fetch_fn: Async function to fetch fresh data
            ttl_minutes: Cache TTL in minutes
        
        Returns:
            Cached or fresh data
        """
        # Try to get from cache
        cached = await firestore_service.get_cache(cache_id)
        if cached:
            return cached["data"]
        
        # Fetch fresh data
        fresh_data = await fetch_fn()
        
        # Cache it
        await firestore_service.set_cache(cache_id, fresh_data, ttl_minutes)
        
        return fresh_data
    
    @staticmethod
    async def invalidate_cache(cache_id: str):
        """Invalidate a specific cache entry"""
        await firestore_service.delete_cache(cache_id)
    
    @staticmethod
    async def invalidate_user_cache(user_id: str, cache_type: str):
        """Invalidate all cache for a user and type"""
        cache_id = f"cache_{cache_type}_{user_id}"
        await firestore_service.delete_cache(cache_id)

cache_service = CacheService()
