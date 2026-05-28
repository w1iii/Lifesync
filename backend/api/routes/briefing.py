"""
Briefing routes for LifeSync API
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
from services.firestore import firestore_service

router = APIRouter()

@router.get("/briefing/{briefing_date}")
async def get_briefing(user_id: str = Query(...), briefing_date: str = Query(...)):
    """
    Get a specific briefing
    
    Example: GET /api/briefing?user_id=user123&briefing_date=2026-05-29
    """
    try:
        briefing = await firestore_service.get_briefing(user_id, briefing_date)
        
        if not briefing:
            raise HTTPException(status_code=404, detail="Briefing not found")
        
        return briefing
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/briefing/latest")
async def get_latest_briefing(user_id: str = Query(...)):
    """
    Get the most recent briefing
    
    Example: GET /api/briefing/latest?user_id=user123
    """
    try:
        briefing = await firestore_service.get_latest_briefing(user_id)
        
        if not briefing:
            raise HTTPException(status_code=404, detail="No briefings found")
        
        return briefing
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/briefings")
async def list_briefings(user_id: str = Query(...), limit: int = Query(10, ge=1, le=100)):
    """
    List recent briefings
    
    Example: GET /api/briefings?user_id=user123&limit=10
    """
    try:
        briefings = await firestore_service.list_briefings(user_id, limit)
        return {"briefings": briefings, "count": len(briefings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
