"""
Anomaly detection module for LifeSync agent
Detects unusual patterns across all modules
"""

from typing import Dict, Any, List

class AnomalyModule:
    
    async def run(self, orchestrator_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run anomaly detection across all module results
        
        Args:
            orchestrator_results: Results from all modules
        
        Returns:
        {
            "anomalies": [
                {
                    "id": "anomaly_1",
                    "type": "duplicate_charge",
                    "title": "Netflix charged twice",
                    "severity": "high",
                    "suggestedAction": "Contact Netflix support"
                }
            ]
        }
        """
        try:
            anomalies = []
            
            # Extract anomalies from finance module
            finance = orchestrator_results.get("finance", {})
            anomalies.extend(finance.get("unusualCharges", []))
            
            # Extract anomalies from schedule module
            schedule = orchestrator_results.get("schedule", {})
            for conflict in schedule.get("conflicts", []):
                anomalies.append({
                    "id": f"anomaly_conflict_{conflict.get('meeting1')}",
                    "type": "meeting_conflict",
                    "title": f"Meeting conflict detected",
                    "description": f"{conflict.get('meeting1_title')} conflicts with {conflict.get('meeting2_title')}",
                    "severity": "medium",
                    "suggestedAction": conflict.get("suggestion")
                })
            
            # Check for overloaded day
            if schedule.get("estimatedOverload"):
                anomalies.append({
                    "id": "anomaly_overload",
                    "type": "schedule_overload",
                    "title": "Your day is overloaded",
                    "description": f"You have {schedule.get('totalMeetingMinutes', 0) / 60:.1f} hours of meetings today",
                    "severity": "medium",
                    "suggestedAction": "Consider blocking focus time or rescheduling lower-priority meetings"
                })
            
            # Check for overdue tasks or emails (simple rule-based)
            inbox = orchestrator_results.get("inbox", {})
            if inbox.get("needsAttention", 0) > 5:
                anomalies.append({
                    "id": "anomaly_inbox_overload",
                    "type": "inbox_overload",
                    "title": "High email volume",
                    "description": f"{inbox.get('needsAttention')} emails need your attention",
                    "severity": "medium",
                    "suggestedAction": "Block 15 minutes to clear urgent emails"
                })
            
            # Sort by severity
            severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            anomalies = sorted(
                anomalies,
                key=lambda x: severity_order.get(x.get("severity", "low"), 3)
            )
            
            return {
                "anomalies": anomalies,
                "totalAnomalies": len(anomalies),
                "criticalCount": sum(1 for a in anomalies if a.get("severity") == "critical"),
                "highCount": sum(1 for a in anomalies if a.get("severity") == "high")
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed",
                "anomalies": []
            }

anomaly_module = AnomalyModule()
