"""
Schedule module for LifeSync agent
Analyzes calendar, detects conflicts, ranks priorities
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta

class ScheduleModule:
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        """
        Run the schedule module
        
        Returns:
        {
            "todaysMeetings": [...],
            "topPriorities": [...],
            "conflicts": [...],
            "estimatedOverload": False
        }
        """
        try:
            # TODO: Fetch calendar via Google Calendar MCP
            meetings = await self._fetch_todays_meetings(user_id)
            
            # Rank by priority
            priorities = self._rank_by_priority(meetings)
            
            # Detect conflicts
            conflicts = self._detect_conflicts(meetings)
            
            # Estimate if day is overloaded
            overloaded = self._estimate_overload(meetings)
            
            return {
                "todaysMeetings": meetings,
                "topPriorities": priorities[:3],  # Top 3
                "conflicts": conflicts,
                "estimatedOverload": overloaded,
                "totalMeetings": len(meetings),
                "totalMeetingMinutes": sum(m.get("duration_minutes", 0) for m in meetings)
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _fetch_todays_meetings(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch today's calendar events"""
        # TODO: Implement Google Calendar MCP call
        # Mock data for now
        return [
            {
                "id": "event_1",
                "title": "Team standup",
                "start": datetime.now().replace(hour=9, minute=0),
                "end": datetime.now().replace(hour=9, minute=30),
                "duration_minutes": 30,
                "priority": "medium"
            },
            {
                "id": "event_2",
                "title": "Client meeting",
                "start": datetime.now().replace(hour=13, minute=0),
                "end": datetime.now().replace(hour=14, minute=0),
                "duration_minutes": 60,
                "priority": "high"
            },
            {
                "id": "event_3",
                "title": "Project review",
                "start": datetime.now().replace(hour=13, minute=30),  # Conflicts with event_2
                "end": datetime.now().replace(hour=14, minute=30),
                "duration_minutes": 60,
                "priority": "medium"
            },
            {
                "id": "event_4",
                "title": "1-on-1 with manager",
                "start": datetime.now().replace(hour=15, minute=0),
                "end": datetime.now().replace(hour=15, minute=30),
                "duration_minutes": 30,
                "priority": "high"
            }
        ]
    
    def _rank_by_priority(self, meetings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank meetings by priority and deadline"""
        # Sort by priority (high > medium > low), then by start time
        priority_order = {"high": 0, "medium": 1, "low": 2}
        
        sorted_meetings = sorted(
            meetings,
            key=lambda m: (priority_order.get(m.get("priority", "low"), 2), m.get("start"))
        )
        
        return sorted_meetings
    
    def _detect_conflicts(self, meetings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect overlapping meetings"""
        conflicts = []
        
        for i, meeting1 in enumerate(meetings):
            for meeting2 in meetings[i+1:]:
                # Check if meetings overlap
                if (meeting1.get("start") < meeting2.get("end") and 
                    meeting2.get("start") < meeting1.get("end")):
                    conflicts.append({
                        "meeting1": meeting1.get("id"),
                        "meeting1_title": meeting1.get("title"),
                        "meeting2": meeting2.get("id"),
                        "meeting2_title": meeting2.get("title"),
                        "suggestion": f"Reschedule {meeting2.get('title')} (lower priority)"
                    })
        
        return conflicts
    
    def _estimate_overload(self, meetings: List[Dict[str, Any]]) -> bool:
        """Estimate if day is overloaded (>6 hours of meetings)"""
        total_minutes = sum(m.get("duration_minutes", 0) for m in meetings)
        total_hours = total_minutes / 60
        
        return total_hours > 6

schedule_module = ScheduleModule()
