"""
Gmail MCP integration for LifeSync
Fetches and sends emails via Gmail API
"""

from typing import Dict, Any, List, Optional
import os
import pickle
import asyncio
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
from services.cache import cache_service

from dotenv import load_dotenv

# Load env vars from project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]

MOCK_MODE = False


class GmailMCPClient:
    
    def __init__(self):
        self.client_id = os.getenv("GMAIL_CLIENT_ID")
        self.client_secret = os.getenv("GMAIL_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GMAIL_REDIRECT_URI", "http://localhost:8000/auth/gmail/callback")
    
    def _get_token_path(self, user_id: str) -> str:
        token_dir = "/tmp/lifesync/gmail_tokens"
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
            print(f"  Gmail Authorization Required")
            print(f"  =============================================")
            print(f"  Opening browser to authorize Gmail access...")
            print(f"  (Make sure http://localhost:8080/ is in your")
            print(f"   GCP Console → Credentials → Redirect URIs)")
            print(f"  =============================================")
            
            creds = flow.run_local_server(
                port=8080,
                open_browser=True,
                success_message="LifeSync Gmail auth successful! You can close this window."
            )
            
            with open(token_path, "wb") as f:
                pickle.dump(creds, f)
            print(f"  ✓ Token saved! Real Gmail data will be used now.\n")
        
        return creds
    
    def _get_service(self, user_id: str):
        creds = self._get_credentials(user_id)
        if not creds:
            raise RuntimeError("Failed to get Gmail credentials")
        return build("gmail", "v1", credentials=creds, cache_discovery=False)
    
    def _parse_message(self, msg_data: Dict) -> Dict[str, Any]:
        headers = msg_data.get("payload", {}).get("headers", [])
        email = {"id": msg_data.get("id")}
        
        for h in headers:
            name = h.get("name", "").lower()
            value = h.get("value", "")
            if name == "from":
                email["from"] = value
            elif name == "to":
                email["to"] = value
            elif name == "subject":
                email["subject"] = value
            elif name == "date":
                email["timestamp"] = value
            elif name == "message-id":
                email["message_id"] = value
        
        email["snippet"] = msg_data.get("snippet", "")
        email["labels"] = msg_data.get("labelIds", [])
        
        body = msg_data.get("payload", {}).get("body", {}).get("data", "")
        if body:
            import base64
            email["body"] = base64.urlsafe_b64decode(body).decode("utf-8", errors="ignore")
        
        return email
    
    def _mock_emails(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "email_1",
                "from": "sarah@example.com",
                "subject": "Re: Meeting reschedule",
                "snippet": "Sounds good! Tuesday at 2pm works for me.",
                "timestamp": "2026-05-29T15:30:00Z",
                "labels": ["INBOX", "UNREAD"],
                "body": "Sounds good! Tuesday at 2pm works for me. Looking forward to it!"
            },
            {
                "id": "email_2",
                "from": "john@example.com",
                "subject": "Invoice approval needed",
                "snippet": "Please approve the attached invoice for client ABC...",
                "timestamp": "2026-05-29T14:00:00Z",
                "labels": ["INBOX", "UNREAD"],
                "body": "Please approve the attached invoice for client ABC for $5,000"
            },
            {
                "id": "email_3",
                "from": "newsletter@techcrunch.com",
                "subject": "Daily Digest: AI News",
                "snippet": "Here's today's top stories...",
                "timestamp": "2026-05-29T09:00:00Z",
                "labels": ["INBOX"],
                "body": "Daily digest of tech news..."
            }
        ]
    
    # ============ PUBLIC API ============
    
    async def fetch_recent_emails(self, user_id: str, hours_back: int = 24) -> List[Dict[str, Any]]:
        cache_id = f"cache_gmail_recent_emails_{user_id}"
        try:
            return await cache_service.get_or_fetch(
                cache_id,
                lambda: self._fetch_recent_emails_fresh(user_id, hours_back),
                ttl_minutes=15
            )
        except Exception as e:
            print(f"  Gmail fetch error: {e}")
            return self._mock_emails()
    
    async def _fetch_recent_emails_fresh(self, user_id: str, hours_back: int) -> List[Dict[str, Any]]:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return self._mock_emails()
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            query = f"newer_than:{hours_back}h"
            
            results = service.users().messages().list(
                userId="me", q=query, maxResults=20
            ).execute()
            
            messages = results.get("messages", [])
            emails = []
            
            for msg in messages[:15]:
                msg_data = service.users().messages().get(
                    userId="me", id=msg["id"], format="metadata",
                    metadataHeaders=["From", "To", "Subject", "Date", "Message-ID"]
                ).execute()
                emails.append(self._parse_message(msg_data))
            
            return emails if emails else self._mock_emails()
        
        except HttpError as e:
            if e.resp.status == 401:
                print("  Gmail token expired, clearing cache for re-auth...")
                token_path = self._get_token_path(user_id)
                if os.path.exists(token_path):
                    os.remove(token_path)
            raise
    
    async def send_email(self, user_id: str, to: str, subject: str, body: str, in_reply_to: Optional[str] = None) -> Dict[str, Any]:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return {"id": f"mock_{int(__import__('time').time())}", "to": to, "subject": subject, "timestamp": datetime.now().isoformat(), "status": "sent"}
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            
            message = MIMEText(body)
            message["to"] = to
            message["subject"] = subject
            
            if in_reply_to:
                message["In-Reply-To"] = in_reply_to
                message["References"] = in_reply_to
            
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
            
            sent = service.users().messages().send(
                userId="me", body={"raw": raw}
            ).execute()
            
            return {
                "id": sent.get("id"),
                "to": to,
                "subject": subject,
                "timestamp": datetime.now().isoformat(),
                "status": "sent"
            }
        except HttpError as e:
            return {
                "id": "",
                "to": to,
                "subject": subject,
                "timestamp": datetime.now().isoformat(),
                "status": "failed",
                "error": str(e)
            }
    
    async def get_email_full(self, user_id: str, email_id: str) -> Dict[str, Any]:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return {}
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            msg_data = service.users().messages().get(
                userId="me", id=email_id, format="full"
            ).execute()
            return self._parse_message(msg_data)
        except HttpError:
            return {}
    
    async def mark_as_read(self, user_id: str, email_id: str) -> bool:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return True
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            service.users().messages().modify(
                userId="me", id=email_id,
                body={"removeLabelIds": ["UNREAD"]}
            ).execute()
            return True
        except HttpError:
            return False
    
    async def archive_email(self, user_id: str, email_id: str) -> bool:
        if not self.client_secret or self.client_secret == "your-gmail-client-secret":
            return True
        
        try:
            service = await asyncio.to_thread(self._get_service, user_id)
            service.users().messages().modify(
                userId="me", id=email_id,
                body={"removeLabelIds": ["INBOX"]}
            ).execute()
            return True
        except HttpError:
            return False


gmail_mcp = GmailMCPClient()
