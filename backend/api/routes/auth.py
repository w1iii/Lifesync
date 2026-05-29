from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.firestore import firestore_service
import firebase_admin
from firebase_admin import auth as admin_auth

router = APIRouter()

class CreateProfileRequest(BaseModel):
    uid: str
    name: str
    email: str

@router.post("/create-profile")
async def create_profile(req: CreateProfileRequest, authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        decoded = admin_auth.verify_id_token(token)
        if decoded["uid"] != req.uid:
            raise HTTPException(status_code=403, detail="UID mismatch")
        await firestore_service.create_user(req.uid, req.name, req.email)
        return {"status": "ok", "uid": req.uid}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
