"""
Google Calendar MCP for LifeSync
Fetches calendar events via Google Calendar API
"""

from typing import Dict, Any, List, Optional
import os
import pickle
import asyncio
from datetime import datetime, timedelta
from services.cache import cache_service

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
]

class CalendarMCPClient:
    
    def __init__(self):
        self.client_id = os.getenv("GMAIL_CLIENT_ID")
        self.client_secret = os.getenv("GMAIL_CLIENT_SECRET")
    
    def _get_token_path(self, user_id: str) -> str:
        token_dir = "/tmp/lifesync/calendar_tokens"
        os.makedirs(token_dir, exist_ok=True)
        return os.path.join(token_dir, f"token_{user_id}.pickle")
    
    def _get_credentials(self, user_id: str) -> Optional[Credentials]:
        token_path = self._get_token_path(user_id)
        creds = None
        
        if os.path.exists(token_path):
            with open(token_path, "rb") as f:
                creds = pickle.load(f)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(token_path, "wb") as f:
                    pickle.dump(creds, f)
                return creds
            
            flow = InstalledAppFlow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "redirect_uris": ["http://localhost:8080/"],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                SCOPES
            )
            
            print(f"\n  =============================================")
            print(f"  Google Calendar Authorization Required")
            print(f"  =============================================")
            creds = flow.run_local_server(
                port=8081,
                open_browser=True,
                success_message="LifeSync Calendar auth successful! You can close this window."
            )
            
            with open(token_path, "wb") as f:
                pickle.dump(creds, f)
            print(f"  ✓ Calendar token saved!\n")
        
        return creds
    
    def _get_service(self, user_id: str):
        creds = self._get_credentials(user_id)
        if not creds:
            raise RuntimeError("Failed to get Calendar credentials")
        return build("calendar", "v3", credentials=creds, cache_discovery=False)
    
    def _mock_events(self) -> List[Dict[str, Any]]:
        """Fallback mock data"""
        now = datetime.now()
        return [
            {
                "id": "event_1",
                "title": "Team standup",
                "start": now.replace(hour=9, minute=0).isoformat(),
                "end": now.replace(hour=9, minute=30).isoformat(),
                "duration_minutes": 30,
                "priority": "medium",
                "attendees": ["team@company.com"],
            },
            {
                "id": "event_2",
                "title": "Client meeting",
                "start": now.replace(hour=13, minute=0).isoformat(),
                "end": now.replace(hour=14, minute=0).isoformat(),
                "duration_minutes": 60,
                "priority": "high",
                "attendees": ["client@company.com"],
            },
            {
                "id": "event_3",
                "title": "Project review",
                "start": now.replace(hour=13, minute=30).isoformat(),
                "end": now.replace(hour=14, minute=30).isoformat(),
                "duration_minutes": 60,
                "priority": "medium",
                "attendees": [],
            },
        ]
    
    async def fetch_todays_events(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch today's calendar events"""
        cache_id = f"cache_calendar_events_{user_id}"
        
        try:
            return await cache_service.get_or_fetch(
                cache_id,
                lambda: self._fetch_events_fresh(user_id),
                ttl_minutes=5
            )
        except Exception as e:
            print(f"  Calendar error: {e}")
            return self._mock_events()
    
    async def _fetch_events_fresh(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return self._mock_events()
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            
            now = datetime.utcnow()
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            events_result = service.events().list(
                calendarId="primary",
                timeMin=start_of_day.isoformat() + "Z",
                timeMax=end_of_day.isoformat() + "Z",
                singleEvents=True,
                orderBy="startTime",
                maxResults=20,
            ).execute()
            
            events = events_result.get("items", [])
            result = []
            
            for event in events:
                start = event["start"].get("dateTime", event["start"].get("date"))
                end = event["end"].get("dateTime", event["end"].get("date"))
                
                result.append({
                    "id": event.get("id"),
                    "title": event.get("summary", "No title"),
                    "start": start,
                    "end": end,
                    "duration_minutes": self._calc_duration(start, end),
                    "priority": self._determine_priority(event),
                    "attendees": [a.get("email") for a in event.get("attendees", [])],
                    "location": event.get("location", ""),
                    "description": event.get("description", "")[:200],
                })
            
            return result if result else self._mock_events()
        
        except HttpError as e:
            if e.resp.status == 401:
                print("  Calendar token expired, clearing for re-auth...")
                tp = self._get_token_path(user_id)
                if os.path.exists(tp):
                    os.remove(tp)
            raise
    
    def _calc_duration(self, start: str, end: str) -> int:
        try:
            s = datetime.fromisoformat(start.replace("Z", "+00:00"))
            e = datetime.fromisoformat(end.replace("Z", "+00:00"))
            return int((e - s).total_seconds() / 60)
        except:
            return 60
    
    def _determine_priority(self, event: Dict) -> str:
        summary = event.get("summary", "").lower()
        if any(w in summary for w in ["urgent", "deadline", "client", "ceo", "review"]):
            return "high"
        if any(w in summary for w in ["standup", "1:1", "sync", "lunch"]):
            return "medium"
        return "low"


calendar_mcp = CalendarMCPClient()
