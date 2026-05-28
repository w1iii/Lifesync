# LifeSync Backend Setup Guide

## Prerequisites

- Python 3.11+
- pip
- Virtual environment (venv)
- Google Cloud CLI
- Firebase CLI

## Local Development Setup

### 1. Clone and navigate to backend

```bash
cd /Users/wii/Projects/lifesync/backend
```

### 2. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp ../.env.example ../.env
```

Edit `.env` with your actual credentials:
- GOOGLE_CLOUD_PROJECT_ID
- FIREBASE credentials
- FIVETRAN_API_KEY
- GMAIL OAuth credentials
- GEMINI_API_KEY
- ELASTIC credentials

### 5. Set up Firebase Admin SDK

The backend uses Firebase Admin SDK for Firestore access. You need to:

1. Download your service account key from Firebase Console
2. Set the path in your shell:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

Or place it in the project and reference it in main.py

### 6. Run the API locally

```bash
cd /Users/wii/Projects/lifesync/backend
python main.py
```

API will be available at: `http://localhost:8000`

### 7. Test the API

Visit these URLs in your browser:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

### 8. Manual agent test

Trigger the nightly agent manually:
```bash
curl "http://localhost:8000/api/scheduler/test-agent?user_id=test_user"
```

This will:
1. Run all 4 modules
2. Generate a briefing
3. Store in Firestore
4. Return results

## Project Structure

```
backend/
├── main.py                    # FastAPI app entry point
├── requirements.txt           # Python dependencies
├── api/
│   └── routes/
│       ├── briefing.py       # GET briefing endpoints
│       ├── actions.py        # POST approve/reject endpoints
│       └── scheduler.py      # POST trigger agent
├── agents/
│   ├── orchestrator.py       # Main coordinator
│   ├── inbox.py              # Email processing
│   ├── finance.py            # Financial analysis
│   ├── schedule.py           # Calendar processing
│   └── anomaly.py            # Anomaly detection
├── mcp/
│   ├── fivetran.py           # Bank data via MCP
│   ├── gmail.py              # Email via MCP
│   └── elastic.py            # News search via MCP
└── services/
    ├── firestore.py          # Firestore operations
    ├── cache.py              # Caching with TTL
    └── notifications.py      # Async notifications
```

## API Endpoints

### Briefings
- `GET /api/briefing/briefing_2026-05-29?user_id=user123` - Get specific briefing
- `GET /api/briefing/latest?user_id=user123` - Get latest briefing
- `GET /api/briefings?user_id=user123&limit=10` - List recent briefings

### Actions
- `POST /api/actions/approve` - Approve and execute an action
- `POST /api/actions/reject?user_id=user123&action_id=action_1` - Reject an action

### Scheduler
- `POST /api/scheduler/trigger-nightly-agent?user_id=user123` - Manually trigger agent
- `GET /api/scheduler/test-agent?user_id=user123` - Quick test endpoint

## Next Steps

1. **Set up Firebase project** in GCP
2. **Configure OAuth credentials** for Gmail and Fivetran
3. **Deploy Firestore collections** with security rules
4. **Set up Cloud Run** for production deployment
5. **Configure Cloud Scheduler** to trigger agent at midnight

## Troubleshooting

### "Module not found" errors
Make sure you're running from the backend directory with the venv activated:
```bash
cd /Users/wii/Projects/lifesync/backend
source venv/bin/activate
python main.py
```

### Firestore connection errors
Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### MCP integration not working
Currently all MCP integrations use mock data. Real integration requires:
- Fivetran API key and account setup
- Gmail OAuth credentials and user consent
- Elastic API key and cluster setup

See `backend/mcp/*.py` files for TODO comments.

---

Ready to test? Run `python main.py` from the backend directory!
