"""
Briefing routes for LifeSync API
"""

from fastapi import APIRouter, HTTPException, Query, Path, Request
from typing import Optional, List
from datetime import datetime
from services.firestore import firestore_service
from agents.orchestrator import orchestrator
from agents.anomaly import anomaly_module

router = APIRouter()

@router.get("/{briefing_date}")
async def get_briefing(briefing_date: str = Path(...), user_id: str = Query(...)):
    """
    Get a specific briefing
    
    Example: GET /api/briefing/2026-05-29?user_id=user123
    """
    try:
        briefing = await firestore_service.get_briefing(user_id, briefing_date)
        
        if not briefing:
            raise HTTPException(status_code=404, detail="Briefing not found")
        
        return briefing
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
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

@router.post("/generate")
async def generate_briefing(user_id: str = Query(...)):
    """
    Generate a new briefing by running the overnight agent
    """
    try:
        result = await orchestrator.run_nightly_agent(user_id)
        if result.get("status") == "failed":
            raise HTTPException(status_code=500, detail=result.get("error", "Agent failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/diagnostics")
async def run_diagnostics(request: Request):
    """
    Run only the anomaly detection module on existing briefing data.

    Body: { "modules": { "inbox": {...}, "finance": {...}, "schedule": {...} } }
    """
    try:
        body = await request.json()
        modules = body.get("modules", {})
        result = await anomaly_module.run(modules)
        return result
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
