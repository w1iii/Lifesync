from fastapi import APIRouter, HTTPException, Header, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from services.firestore import firestore_service
import firebase_admin
from firebase_admin import auth as admin_auth
import os
import pickle
import secrets

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)

from google_auth_oauthlib.flow import Flow

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]

CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
]

CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GMAIL_CLIENT_ID", ""),
        "client_secret": os.getenv("GMAIL_CLIENT_SECRET", ""),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}

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

def _make_flow(redirect_uri: str, scopes: list[str]) -> Flow:
    config = {**CLIENT_CONFIG, "web": {**CLIENT_CONFIG["web"], "redirect_uris": [redirect_uri]}}
    return Flow.from_client_config(config, scopes=scopes, redirect_uri=redirect_uri)

@router.get("/gmail-connect")
async def gmail_connect(user_id: str = Query(...)):
    redirect_uri = os.getenv("GMAIL_REDIRECT_URI", "http://localhost:8000/api/auth/gmail/callback")
    flow = _make_flow(redirect_uri, GMAIL_SCOPES)
    state = secrets.token_urlsafe(32)
    os.makedirs("/tmp/lifesync/gmail_states", exist_ok=True)
    with open(f"/tmp/lifesync/gmail_states/{state}", "w") as f:
        f.write(user_id)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state,
        prompt="consent",
    )
    return {"url": auth_url}

@router.get("/gmail/callback")
async def gmail_callback(code: str = Query(...), state: str = Query(...)):
    state_path = f"/tmp/lifesync/gmail_states/{state}"
    if not os.path.exists(state_path):
        raise HTTPException(status_code=400, detail="Invalid state")
    with open(state_path) as f:
        user_id = f.read().strip()
    os.remove(state_path)
    redirect_uri = os.getenv("GMAIL_REDIRECT_URI", "http://localhost:8000/api/auth/gmail/callback")
    flow = _make_flow(redirect_uri, GMAIL_SCOPES)
    flow.fetch_token(code=code)
    creds = flow.credentials
    token_dir = "/tmp/lifesync/gmail_tokens"
    os.makedirs(token_dir, exist_ok=True)
    with open(os.path.join(token_dir, f"token_{user_id}.pickle"), "wb") as f:
        pickle.dump(creds, f)
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(url=f"{frontend}/integrations?connected=gmail")

@router.get("/calendar-connect")
async def calendar_connect(user_id: str = Query(...)):
    redirect_uri = os.getenv("CALENDAR_REDIRECT_URI", "http://localhost:8000/api/auth/calendar/callback")
    flow = _make_flow(redirect_uri, CALENDAR_SCOPES)
    state = secrets.token_urlsafe(32)
    os.makedirs("/tmp/lifesync/calendar_states", exist_ok=True)
    with open(f"/tmp/lifesync/calendar_states/{state}", "w") as f:
        f.write(user_id)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state,
        prompt="consent",
    )
    return {"url": auth_url}

@router.get("/calendar/callback")
async def calendar_callback(code: str = Query(...), state: str = Query(...)):
    state_path = f"/tmp/lifesync/calendar_states/{state}"
    if not os.path.exists(state_path):
        raise HTTPException(status_code=400, detail="Invalid state")
    with open(state_path) as f:
        user_id = f.read().strip()
    os.remove(state_path)
    redirect_uri = os.getenv("CALENDAR_REDIRECT_URI", "http://localhost:8000/api/auth/calendar/callback")
    flow = _make_flow(redirect_uri, CALENDAR_SCOPES)
    flow.fetch_token(code=code)
    creds = flow.credentials
    token_dir = "/tmp/lifesync/calendar_tokens"
    os.makedirs(token_dir, exist_ok=True)
    with open(os.path.join(token_dir, f"token_{user_id}.pickle"), "wb") as f:
        pickle.dump(creds, f)
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(url=f"{frontend}/integrations?connected=calendar")
