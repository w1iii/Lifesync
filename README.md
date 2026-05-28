# LifeSync

**One agent that runs overnight, connects every corner of your life, and delivers a personalized morning briefing so your day starts organized — automatically.**

## 🎯 What is LifeSync?

LifeSync is an AI-powered personal operating system that:
- Runs an overnight agent that pulls data from your email, bank accounts, calendar, and news
- Analyzes, prioritizes, and detects anomalies across all areas of your life
- Delivers a personalized morning briefing with actionable insights
- Lets you approve/reject suggested actions with one tap

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Firebase CLI
- Google Cloud CLI
- A GitHub account

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/yourusername/lifesync.git
cd lifesync
```

2. **Backend setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. **Frontend setup**
```bash
cd frontend/web
npm install
```

4. **Environment variables**
```bash
cp .env.example .env
# Fill in your GCP, Firebase, and API keys
```

5. **Run locally**
```bash
# Terminal 1: Backend API
cd backend
python main.py

# Terminal 2: Frontend
cd frontend/web
npm run dev
```

## 📁 Project Structure

```
lifesync/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── schemas/
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── inbox.py
│   │   ├── finance.py
│   │   ├── schedule.py
│   │   └── anomaly.py
│   ├── mcp/
│   │   ├── fivetran.py
│   │   ├── gmail.py
│   │   └── elastic.py
│   ├── services/
│   │   ├── firestore.py
│   │   ├── cache.py
│   │   └── notifications.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── frontend/
│   ├── web/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── firebase.json
│   └── mobile/
│       └── package.json
├── infra/
│   ├── firestore-rules.json
│   ├── cloud-scheduler-config.yaml
│   └── cloud-run-service.yaml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
├── .env.example
├── .gitignore
└── README.md
```

## 🗺️ Roadmap

- **Week 1**: Foundation (Firestore, API, OAuth)
- **Week 2**: Agent + Modules (Inbox, Finance, Schedule, Anomaly)
- **Week 3**: Frontend (Web + Mobile dashboards)
- **June 8**: Demo ready

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Setup Guide](./docs/SETUP.md)

## 🤝 Contributing

This is a solo project for now. Once launched, we'll open contributions.

## 📝 License

MIT

---

**Questions?** Check the [full project plan](https://github.com/yourusername/lifesync/wiki/Full-Plan) for detailed timelines and specs.
