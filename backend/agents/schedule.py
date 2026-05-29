"""
Schedule module for LifeSync agent
Analyzes calendar, detects conflicts, ranks priorities
"""

from typing import Dict, Any, List
from datetime import datetime
from mcp.calendar import calendar_mcp

class ScheduleModule:
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        try:
            meetings = await calendar_mcp.fetch_todays_events(user_id)
            
            for m in meetings:
                if m.get("start") and not m.get("duration_minutes"):
                    try:
                        m["duration_minutes"] = self._calc_dur(m.get("start"), m.get("end"))
                    except:
                        m["duration_minutes"] = 60
            
            priorities = self._rank_by_priority(meetings)
            conflicts = self._detect_conflicts(meetings)
            total_minutes = sum(m.get("duration_minutes", 0) for m in meetings)
            overloaded = total_minutes / 60 > 6
            
            return {
                "todaysMeetings": meetings,
                "topPriorities": priorities[:3],
                "conflicts": conflicts,
                "estimatedOverload": overloaded,
                "totalMeetings": len(meetings),
                "totalMeetingMinutes": total_minutes,
            }
        except Exception as e:
            return {"error": str(e), "status": "failed"}
    
    def _calc_dur(self, start, end):
        try:
            s = datetime.fromisoformat(start.replace("Z", "+00:00"))
            e = datetime.fromisoformat(end.replace("Z", "+00:00"))
            return int((e - s).total_seconds() / 60)
        except:
            return 60
    
    def _rank_by_priority(self, meetings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        order = {"high": 0, "medium": 1, "low": 2}
        return sorted(
            meetings,
            key=lambda m: (order.get(m.get("priority", "low"), 2), m.get("start", ""))
        )
    
    def _detect_conflicts(self, meetings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        conflicts = []
        for i, m1 in enumerate(meetings):
            for m2 in meetings[i+1:]:
                if self._overlaps(m1, m2):
                    conflicts.append({
                        "meeting1": m1.get("id"),
                        "meeting1_title": m1.get("title"),
                        "meeting2": m2.get("id"),
                        "meeting2_title": m2.get("title"),
                        "suggestion": f"Reschedule {m2.get('title')}"
                    })
        return conflicts
    
    def _overlaps(self, a, b) -> bool:
        try:
            a_start = datetime.fromisoformat(a.get("start", "").replace("Z", "+00:00"))
            a_end = datetime.fromisoformat(a.get("end", "").replace("Z", "+00:00"))
            b_start = datetime.fromisoformat(b.get("start", "").replace("Z", "+00:00"))
            b_end = datetime.fromisoformat(b.get("end", "").replace("Z", "+00:00"))
            return a_start < b_end and b_start < a_end
        except:
            return False


schedule_module = ScheduleModule()
