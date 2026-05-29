from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.firestore import firestore_service

router = APIRouter()

class ModuleToggle(BaseModel):
    id: str
    enabled: bool
    priority: Optional[bool] = False

class TimePreference(BaseModel):
    hour: int
    minute: int
    ampm: str

class PreferencesRequest(BaseModel):
    userId: str
    briefingTime: TimePreference
    briefingIntensity: int
    modules: list[ModuleToggle]
    connectedServices: list[str]

@router.post("/save")
async def save_preferences(req: PreferencesRequest):
    try:
        prefs = req.model_dump()
        await firestore_service.set_user_preferences(req.userId, prefs)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_preferences(user_id: str):
    try:
        prefs = await firestore_service.get_user_preferences(user_id)
        if not prefs:
            return {
                "briefingTime": {"hour": 7, "minute": 30, "ampm": "AM"},
                "briefingIntensity": 65,
                "modules": [
                    {"id": "circadian", "enabled": True, "priority": True},
                    {"id": "eco", "enabled": False, "priority": False},
                    {"id": "focus", "enabled": True, "priority": True},
                ],
                "connectedServices": ["fivetran"],
            }
        return prefs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
