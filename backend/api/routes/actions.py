"""
Actions routes for LifeSync API
Handles user approvals and rejections
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.firestore import firestore_service
from services.notifications import notification_service
from mcp.gmail import gmail_mcp
from datetime import datetime

router = APIRouter()

class ApproveActionRequest(BaseModel):
    user_id: str
    action_id: str
    action_type: str
    module_id: str
    item_id: str

@router.post("/approve")
async def approve_action(request: ApproveActionRequest):
    """
    Approve and execute an action
    
    Example: POST /api/actions/approve
    {
        "user_id": "user123",
        "action_id": "action_1",
        "action_type": "email_reply",
        "module_id": "inbox",
        "item_id": "reply_1"
    }
    """
    try:
        # Execute action based on type
        executed = False
        
        if request.action_type == "email_reply":
            # Send email via Gmail MCP
            # TODO: Get full email details and send
            result = await gmail_mcp.send_email(
                request.user_id,
                to="test@example.com",  # TODO: Get from item_id
                subject="Reply",
                body="Test reply"
            )
            executed = result.get("status") == "sent"
        
        # Update action status
        await firestore_service.update_action_status(
            request.user_id,
            request.action_id,
            "success" if executed else "failed",
            datetime.now() if executed else None
        )
        
        if executed:
            await notification_service.notify_action_success(
                request.user_id,
                request.action_id,
                request.action_type
            )
        else:
            await notification_service.notify_action_failed(
                request.user_id,
                request.action_id,
                request.action_type,
                "Action execution failed"
            )
        
        return {
            "action_id": request.action_id,
            "status": "success" if executed else "failed",
            "executed_at": datetime.now().isoformat() if executed else None
        }
    except Exception as e:
        await notification_service.notify_action_failed(
            request.user_id,
            request.action_id,
            request.action_type,
            str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reject")
async def reject_action(user_id: str = Query(...), action_id: str = Query(...)):
    """
    Reject an action (user declined it)
    
    Example: POST /api/actions/reject?user_id=user123&action_id=action_1
    """
    try:
        await firestore_service.update_action_status(user_id, action_id, "rejected")
        
        return {
            "action_id": action_id,
            "status": "rejected"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
