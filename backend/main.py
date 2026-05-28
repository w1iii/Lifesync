from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import routes
from api.routes import briefing, actions, scheduler

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("LifeSync API starting up...")
    yield
    # Shutdown
    print("LifeSync API shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="LifeSync API",
    description="Personal Operating System for your life",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "LifeSync API",
        "version": "0.1.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to LifeSync API",
        "docs": "/docs",
        "health": "/health"
    }

# Include routers
app.include_router(briefing.router, prefix="/api/briefing", tags=["briefing"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(scheduler.router, prefix="/api/scheduler", tags=["scheduler"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
