"""
Firestore service for LifeSync
Handles all database operations
"""

import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, List, Any, Optional
import os
from datetime import datetime, timedelta

class FirestoreService:
    _instance = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirestoreService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._db is None:
            self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            firebase_admin.get_app()
        except ValueError:
            # Initialize with credentials from environment
            # In production, this uses Application Default Credentials (ADC)
            firebase_admin.initialize_app()
        
        self._db = firestore.client()
        print("Firestore initialized successfully")
    
    # ==================== BRIEFING OPERATIONS ====================
    
    async def create_briefing(self, user_id: str, briefing_data: Dict[str, Any]) -> str:
        """Create a new briefing snapshot"""
        briefing_id = f"briefing_{datetime.now().strftime('%Y-%m-%d')}"
        
        doc_ref = self._db.collection("users").document(user_id).collection("briefings").document(briefing_id)
        doc_ref.set({
            "id": briefing_id,
            "createdAt": datetime.now(),
            "status": "generating",
            "modules": briefing_data.get("modules", {}),
            "syncMetadata": briefing_data.get("syncMetadata", {}),
        })
        
        return briefing_id
    
    async def update_briefing(self, user_id: str, briefing_id: str, updates: Dict[str, Any]):
        """Update an existing briefing"""
        doc_ref = self._db.collection("users").document(user_id).collection("briefings").document(briefing_id)
        doc_ref.update(updates)
    
    async def get_briefing(self, user_id: str, briefing_date: str) -> Optional[Dict[str, Any]]:
        """Get a specific briefing"""
        doc = self._db.collection("users").document(user_id).collection("briefings").document(f"briefing_{briefing_date}").get()
        return doc.to_dict() if doc.exists else None
    
    async def get_latest_briefing(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent briefing"""
        docs = self._db.collection("users").document(user_id).collection("briefings").order_by("createdAt", direction=firestore.Query.DESCENDING).limit(1).stream()
        for doc in docs:
            return doc.to_dict()
        return None
    
    async def list_briefings(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """List recent briefings"""
        docs = self._db.collection("users").document(user_id).collection("briefings").order_by("createdAt", direction=firestore.Query.DESCENDING).limit(limit).stream()
        return [doc.to_dict() for doc in docs]
    
    # ==================== CACHE OPERATIONS ====================
    
    async def get_cache(self, cache_id: str) -> Optional[Dict[str, Any]]:
        """Get cached data"""
        doc = self._db.collection("dataCache").document(cache_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        
        # Check if cache is expired
        if "expiresAt" in data and data["expiresAt"] < datetime.now():
            await self.delete_cache(cache_id)
            return None
        
        return data
    
    async def set_cache(self, cache_id: str, data: Dict[str, Any], ttl_minutes: int = 45):
        """Cache data with TTL"""
        expires_at = datetime.now() + timedelta(minutes=ttl_minutes)
        
        self._db.collection("dataCache").document(cache_id).set({
            "id": cache_id,
            "data": data,
            "expiresAt": expires_at,
            "lastUpdated": datetime.now(),
        })
    
    async def delete_cache(self, cache_id: str):
        """Delete cached data"""
        self._db.collection("dataCache").document(cache_id).delete()
    
    # ==================== USER PREFERENCES ====================
    
    async def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences"""
        doc = self._db.collection("users").document(user_id).collection("userPreferences").document("settings").get()
        return doc.to_dict() if doc.exists else None
    
    async def set_user_preferences(self, user_id: str, preferences: Dict[str, Any]):
        """Update user preferences"""
        self._db.collection("users").document(user_id).collection("userPreferences").document("settings").set(preferences, merge=True)
    
    # ==================== ACTIONS ====================
    
    async def create_action(self, user_id: str, briefing_id: str, action_data: Dict[str, Any]) -> str:
        """Create an action record"""
        action_id = f"action_{datetime.now().timestamp()}"
        
        self._db.collection("users").document(user_id).collection("userActions").document(action_id).set({
            "id": action_id,
            "briefingId": briefing_id,
            "type": action_data.get("type"),
            "moduleId": action_data.get("moduleId"),
            "itemId": action_data.get("itemId"),
            "actionedAt": datetime.now(),
            "status": "pending",
        })
        
        return action_id
    
    async def update_action_status(self, user_id: str, action_id: str, status: str, executed_at: Optional[datetime] = None):
        """Update action execution status"""
        updates = {"status": status}
        if executed_at:
            updates["executedAt"] = executed_at
        
        self._db.collection("users").document(user_id).collection("userActions").document(action_id).update(updates)
    
    # ==================== NOTIFICATIONS ====================
    
    async def create_notification(self, user_id: str, notification_data: Dict[str, Any]) -> str:
        """Create an async notification"""
        notif_id = f"notif_{datetime.now().timestamp()}"
        
        self._db.collection("users").document(user_id).collection("notifications").document(notif_id).set({
            "id": notif_id,
            "type": notification_data.get("type"),
            "title": notification_data.get("title"),
            "message": notification_data.get("message"),
            "severity": notification_data.get("severity", "info"),
            "createdAt": datetime.now(),
            "read": False,
        })
        
        return notif_id
    
    async def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        """Get unread notifications"""
        docs = self._db.collection("users").document(user_id).collection("notifications").where("read", "==", False).stream()
        return [doc.to_dict() for doc in docs]
    
    async def dismiss_notification(self, user_id: str, notification_id: str):
        """Mark notification as read"""
        self._db.collection("users").document(user_id).collection("notifications").document(notification_id).update({"read": True})
    
    # ==================== EXECUTION LOG ====================
    
    async def log_agent_execution(self, user_id: str, execution_data: Dict[str, Any]):
        """Log agent execution"""
        exec_id = f"exec_{datetime.now().strftime('%Y-%m-%d')}"
        
        self._db.collection("executionLog").document(exec_id).set({
            "id": exec_id,
            "userId": user_id,
            "timestamp": datetime.now(),
            "agentRunId": execution_data.get("agentRunId"),
            "status": execution_data.get("status"),
            "duration": execution_data.get("duration"),
            "errors": execution_data.get("errors", []),
            "moduleResults": execution_data.get("moduleResults", {}),
        })


# Singleton instance
firestore_service = FirestoreService()
