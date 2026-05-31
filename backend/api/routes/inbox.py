"""
Inbox routes for LifeSync API
Fetches and displays user emails
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from agents.inbox import inbox_module

router = APIRouter()

@router.get("/emails")
async def get_emails(user_id: str = Query(...)):
    """
    Get all emails for a user
    
    Example: GET /api/inbox/emails?user_id=user123
    """
    try:
        result = await inbox_module.run(user_id)
        
        if result.get("status") == "failed":
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to fetch emails"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
