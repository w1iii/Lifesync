# Implementation Plan: Items 3, 4, 5

Fixes for production-hardening the LifeSync backend.

---

## Item 3 — Fix `actions.py` Hardcoded Values

**File:** `backend/api/routes/actions.py`  
**Problem:** `POST /api/actions/approve` sends emails to `to="test@example.com"` instead of resolving the actual recipient from the action/item data.

### Current behavior (line 43-48):
```python
result = await gmail_mcp.send_email(
    request.user_id,
    to="test@example.com",  # TODO: Get from item_id
    subject="Reply",
    body="Test reply"
)
```

### Implementation:

**Step 1 — Resolve `item_id` to email data.**
The `action_id` maps to a drafted reply in Firestore. We need a lookup method in `firestore_service`:

- Add `get_drafted_reply(user_id, item_id) → dict` to `firestore_service` that queries `users/{userId}/briefings/*/draftedReplies` or stores replies in a dedicated subcollection.
- Alternative: pass the full reply details in the `ApproveActionRequest` model (simpler, less DB round-trips).

**Step 2 — Update `ApproveActionRequest` model.**

```python
class ApproveActionRequest(BaseModel):
    user_id: str
    action_id: str
    action_type: str       # "email_reply" | "unsubscribe" | "pay_bill" | etc.
    module_id: str         # "inbox" | "finance" | "schedule"
    item_id: str
    # Optional context for the action (avoids DB lookup)
    email_to: Optional[str] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None
```

**Step 3 — Update `approve_action` to use real data.**

```python
if request.action_type == "email_reply":
    to = request.email_to or await resolve_to_from_item(request)
    subject = request.email_subject or f"Re: {item_subject}"
    body = request.email_body or await fetch_draft_body(request)
    result = await gmail_mcp.send_email(request.user_id, to=to, subject=subject, body=body)
```

**Step 4 — Add fallback resolution method.**

```python
async def _resolve_action_details(user_id, action_type, item_id):
    """Fetch action details from Firestore if not provided in request."""
    if action_type == "email_reply":
        reply = await firestore_service.get_drafted_reply(user_id, item_id)
        return reply.get("to"), reply.get("subject"), reply.get("body")
    return None, None, None
```

**Step 5 — Extend firestore_service.**

```python
async def get_drafted_reply(self, user_id, item_id) -> Optional[Dict]:
    """Fetch a drafted reply by item_id from the user's latest briefing."""
    if not self.is_ready:
        return None
    briefing = await self.get_latest_briefing(user_id)
    if not briefing:
        return None
    replies = briefing.get("modules", {}).get("inbox", {}).get("draftedReplies", [])
    for r in replies:
        if r.get("id") == item_id:
            return r
    return None
```

**Files to modify:**
- `backend/api/routes/actions.py` — update model + handler
- `backend/services/firestore.py` — add `get_drafted_reply()`
- `frontend/lib/api.ts` — update `approveAction()` to pass optional context

---

## Item 4 — Headless OAuth Flow (Cloud Run)

**Files:** `backend/mcp/gmail.py`, `backend/mcp/calendar.py`, `backend/api/routes/auth.py`  
**Problem:** `InstalledAppFlow.run_local_server()` opens a browser on the machine — impossible on Cloud Run or any headless server.

### Architecture

```
User clicks "Connect" in frontend
  → Frontend calls GET /api/auth/{service}-connect?user_id=xyz
  → Backend generates Google OAuth URL with callback pointing to backend
  → Backend returns { url: "https://accounts.google.com/..." }
  → Frontend opens URL in new tab (window.open)
  → User consents in browser
  → Google redirects to backend /api/auth/{service}/callback
  → Backend exchanges code for tokens
  → Backend stores tokens in Firestore (not /tmp/)
  → Backend redirects user to frontend /integrations?connected={service}
```

### Implementation Steps

**Step 1 — Token storage: Firestore instead of filesystem.**

Replace `/tmp/lifesync/gmail_tokens/token_{user_id}.pickle` with Firestore document:

```
users/{userId}/tokens/{service}
```

New Firestore method:

```python
async def set_user_token(self, user_id: str, service: str, token_data: dict):
    self._db.collection("users").document(user_id).collection("tokens").document(service).set(token_data)

async def get_user_token(self, user_id: str, service: str) -> Optional[dict]:
    doc = self._db.collection("users").document(user_id).collection("tokens").document(service).get()
    return doc.to_dict() if doc.exists else None
```

**Step 2 — Rewrite `gmail.py` credential loading.**

```python
def _get_credentials(self, user_id: str) -> Optional[Credentials]:
    stored = await firestore_service.get_user_token(user_id, "gmail")
    if stored:
        creds = Credentials.from_authorized_user_info(stored, SCOPES)
        if creds.valid:
            return creds
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            await firestore_service.set_user_token(user_id, "gmail", json.loads(creds.to_json()))
            return creds
    return None  # No valid token — user needs to re-auth
```

Remove `_get_token_path()`, all `/tmp/` file I/O, and `run_local_server()` fallback entirely.

**Step 3 — Clean up auth.py.**

Remove file-based state tracking (`/tmp/lifesync/gmail_states/{state}`). Use Firestore or in-memory (with TTL) for CSRF state:

```python
# Transient state store (short TTL, for CSRF protection)
_state_store: dict[str, tuple[str, datetime]] = {}  # state → (user_id, expires)

def _store_state(state: str, user_id: str):
    _state_store[state] = (user_id, datetime.now() + timedelta(minutes=10))

def _consume_state(state: str) -> Optional[str]:
    entry = _state_store.pop(state, None)
    if entry and entry[1] > datetime.now():
        return entry[0]
    return None
```

**Step 4 — Ensure `FRONTEND_URL` redirect works.**

The OAuth callback should redirect to `{FRONTEND_URL}/integrations?connected={service}`. This is already implemented in `auth.py` but verify the env var propagation in Cloud Run.

**Step 5 — Test headless flow.**

```bash
# 1. Get auth URL
curl "http://localhost:8000/api/auth/gmail-connect?user_id=test_user"
# 2. Open URL in browser → consent → lands on callback
# 3. Callback stores token in Firestore
# 4. Next agent run reads from Firestore — no browser needed
```

**Files to modify:**
- `backend/mcp/gmail.py` — replace `_get_credentials()` with Firestore-backed token loading
- `backend/mcp/calendar.py` — same treatment
- `backend/api/routes/auth.py` — replace `/tmp/` state with in-memory store, ensure `FRONTEND_URL` redirect
- `backend/services/firestore.py` — add `set_user_token()` / `get_user_token()`

---

## Item 5 — Wire Gemini AI Drafting

**Files:** `backend/agents/inbox.py`, `backend/requirements.txt`  
**Problem:** `_draft_reply()` returns a static template ("Thank you for reaching out...") instead of an AI-generated contextual reply.

### Current stub (inbox.py line 97-107):

```python
async def _draft_reply(self, email: Dict[str, Any]) -> Dict[str, Any]:
    """Draft a reply to an email using Gemini"""
    # TODO: Use Gemini to draft contextual reply
    return {
        "id": f"reply_{email.get('id')}",
        "from": email.get("from"),
        "subject": f"Re: {email.get('subject')}",
        "draft": "Thank you for reaching out. I'll get back to you soon.",
        ...
    }
```

### Implementation Steps

**Step 1 — Create a GenAI service wrapper.**

New file: `backend/services/genai.py`

```python
"""
Gemini AI service for LifeSync
Handles content generation (draft replies, summaries, etc.)
"""

import os
import google.generativeai as genai
from typing import Optional

class GenAIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self._configured = bool(api_key) and api_key != "your-gemini-api-key"
        if self._configured:
            genai.configure(api_key=api_key)
            self._model = genai.GenerativeModel("gemini-2.0-flash")
    
    @property
    def is_configured(self) -> bool:
        return self._configured
    
    async def draft_reply(self, email_body: str, email_subject: str, sender: str) -> Optional[str]:
        """Generate a contextual email reply using Gemini."""
        if not self._configured:
            return None
        
        prompt = f"""You are a professional assistant drafting an email reply.
        
Original email from: {sender}
Subject: {email_subject}
Body: {email_body}

Draft a concise, professional reply. Keep it under 3 sentences.
Be polite but direct. If the email requires a specific action,
acknowledge it and state when the sender can expect follow-up.
Only output the reply text, nothing else."""
        
        try:
            response = self._model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[GenAI] Draft reply failed: {e}")
            return None

genai_service = GenAIService()
```

**Step 2 — Update `inbox.py` to use GenAI.**

```python
from services.genai import genai_service

async def _draft_reply(self, email: Dict[str, Any]) -> Dict[str, Any]:
    draft_text = None
    
    if genai_service.is_configured:
        draft_text = await genai_service.draft_reply(
            email_body=email.get("body", ""),
            email_subject=email.get("subject", ""),
            sender=email.get("from", "")
        )
    
    return {
        "id": f"reply_{email.get('id')}",
        "from": email.get("from"),
        "to": email.get("from"),  # reply-to the sender
        "subject": f"Re: {email.get('subject')}",
        "body": draft_text or "Thank you for reaching out. I'll get back to you soon.",
        "approved": False,
        "executedAt": None,
    }
```

**Step 3 — Verify `google-generativeai` is in requirements.txt.**

`backend/requirements.txt` already includes:
```
google-generativeai>=0.3.0
```

No dependency change needed.

**Step 4 — Test.**

```bash
# Set GEMINI_API_KEY in .env
cd backend && source venv/bin/activate && python3 -c "
import asyncio
from services.genai import genai_service
result = asyncio.run(genai_service.draft_reply(
    'Hey, can we move the 3pm meeting to 4pm? Thanks!',
    'Meeting reschedule',
    'sarah@example.com'
))
print(result)
"
```

Expected output: AI-generated reply like "Hi Sarah, thanks for the note. I've updated the meeting to 4pm. See you then."

**Files to create/modify:**
- `backend/services/genai.py` — CREATE new file
- `backend/agents/inbox.py` — UPDATE `_draft_reply()` to use `genai_service`

---

## Summary of Changes

| Item | Files Modified/Created | Complexity | Risk |
|------|----------------------|------------|------|
| 3 — Fix actions hardcode | `actions.py`, `firestore.py`, `api.ts` | Low | Low |
| 4 — Headless OAuth | `gmail.py`, `calendar.py`, `auth.py`, `firestore.py` | Medium | Medium |
| 5 — Gemini drafting | `genai.py` (create), `inbox.py` | Low | Low |

**Total:** ~200 new lines, ~100 modified lines across 8 files.
