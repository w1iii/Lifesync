"""
Scheduler routes for LifeSync API
Triggers the nightly agent run
"""

from fastapi import APIRouter, HTTPException, Query
from agents.orchestrator import orchestrator
import os

router = APIRouter()

@router.post("/trigger-nightly-agent")
async def trigger_nightly_agent(user_id: str = Query(...)):
    """
    Manually trigger the nightly agent run
    (Normally called by Cloud Scheduler at midnight)
    
    Example: POST /api/scheduler/trigger-nightly-agent?user_id=user123
    """
    try:
        # TODO: Add API key validation for Cloud Scheduler
        
        result = await orchestrator.run_nightly_agent(user_id)
        
        return {
            "status": "triggered",
            "briefing_id": result.get("briefing_id"),
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-agent")
async def test_agent(user_id: str = Query("test_user")):
    """
    Quick test endpoint for the agent (for development)
    
    Example: GET /api/scheduler/test-agent?user_id=user123
    """
    try:
        result = await orchestrator.run_nightly_agent(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
