"""
Notification service for LifeSync
Handles async notifications for errors and updates
"""

from typing import Dict, Any, Optional
from services.firestore import firestore_service
from enum import Enum

class NotificationType(str, Enum):
    ACTION_FAILED = "action_failed"
    ACTION_SUCCESS = "action_success"
    BRIEFING_READY = "briefing_ready"
    AGENT_ERROR = "agent_error"
    DATA_SYNC_ERROR = "data_sync_error"
    INFO = "info"

class NotificationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationService:
    
    @staticmethod
    async def notify_action_failed(
        user_id: str,
        action_id: str,
        action_type: str,
        error_message: str
    ):
        """Notify user that an action failed"""
        await firestore_service.create_notification(
            user_id,
            {
                "type": NotificationType.ACTION_FAILED,
                "title": f"Action failed: {action_type}",
                "message": error_message,
                "severity": NotificationSeverity.HIGH,
                "actionId": action_id,
            }
        )
    
    @staticmethod
    async def notify_action_success(
        user_id: str,
        action_id: str,
        action_type: str,
    ):
        """Notify user that an action succeeded"""
        await firestore_service.create_notification(
            user_id,
            {
                "type": NotificationType.ACTION_SUCCESS,
                "title": f"Action completed: {action_type}",
                "message": "Your action has been executed successfully.",
                "severity": NotificationSeverity.LOW,
                "actionId": action_id,
            }
        )
    
    @staticmethod
    async def notify_briefing_ready(user_id: str, briefing_id: str):
        """Notify user that briefing is ready"""
        await firestore_service.create_notification(
            user_id,
            {
                "type": NotificationType.BRIEFING_READY,
                "title": "Your morning briefing is ready",
                "message": "Check out what's new in your LifeSync dashboard.",
                "severity": NotificationSeverity.LOW,
                "briefingId": briefing_id,
            }
        )
    
    @staticmethod
    async def notify_agent_error(user_id: str, error_message: str):
        """Notify user of agent execution error"""
        await firestore_service.create_notification(
            user_id,
            {
                "type": NotificationType.AGENT_ERROR,
                "title": "Agent run failed",
                "message": error_message,
                "severity": NotificationSeverity.HIGH,
            }
        )
    
    @staticmethod
    async def notify_sync_error(user_id: str, source: str, error_message: str):
        """Notify user of data sync error"""
        await firestore_service.create_notification(
            user_id,
            {
                "type": NotificationType.DATA_SYNC_ERROR,
                "title": f"Data sync failed: {source}",
                "message": error_message,
                "severity": NotificationSeverity.MEDIUM,
            }
        )
    
    @staticmethod
    async def get_notifications(user_id: str) -> list:
        """Get all unread notifications for user"""
        return await firestore_service.get_notifications(user_id)
    
    @staticmethod
    async def dismiss_notification(user_id: str, notification_id: str):
        """Mark notification as read"""
        await firestore_service.dismiss_notification(user_id, notification_id)

notification_service = NotificationService()
