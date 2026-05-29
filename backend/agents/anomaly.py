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
            
            # ======================== INBOX ANOMALIES ========================
            inbox = orchestrator_results.get("inbox", {})
            
            # High email volume
            if inbox.get("needsAttention", 0) > 5:
                anomalies.append({
                    "id": "anomaly_inbox_overload",
                    "type": "inbox_overload",
                    "title": "High email volume",
                    "description": f"{inbox.get('needsAttention')} emails need your attention",
                    "severity": "medium",
                    "suggestedAction": "Block 15 minutes to clear urgent emails"
                })
            
            # Overdue follow-up: urgent emails that haven't been handled yet
            needs = inbox.get("needsAttention", 0)
            if 0 < needs <= 5:
                anomalies.append({
                    "id": "anomaly_overdue_followup",
                    "type": "overdue_followup",
                    "title": "Urgent emails need follow-up",
                    "description": f"{needs} email(s) require your response",
                    "severity": "medium",
                    "suggestedAction": "Respond to flagged emails first thing"
                })
            
            # No inbox activity: zero emails in the last 24h (possible issue or day off)
            if inbox.get("totalEmails", 0) == 0:
                anomalies.append({
                    "id": "anomaly_no_inbox_activity",
                    "type": "no_inbox_activity",
                    "title": "No new emails detected",
                    "description": "Zero emails in the last 24 hours — unusual pattern",
                    "severity": "low",
                    "suggestedAction": "Check email connection or enjoy the quiet day"
                })
            
            # ======================== SCHEDULE ANOMALIES ========================
            # Empty calendar: nothing scheduled today
            if schedule.get("totalMeetings", 0) == 0:
                anomalies.append({
                    "id": "anomaly_empty_calendar",
                    "type": "empty_calendar",
                    "title": "Nothing on your calendar today",
                    "description": "No meetings or events scheduled — you may have a free day",
                    "severity": "low",
                    "suggestedAction": "Block focus time or plan your day proactively"
                })
            
            # ======================== FINANCE ANOMALIES ========================
            # Budget overspend / near-limit warnings
            budget = finance.get("budget", {})
            for category, cat_data in budget.items():
                pct = cat_data.get("percentage", 0)
                if pct >= 100:
                    anomalies.append({
                        "id": f"anomaly_budget_exceeded_{category}",
                        "type": "budget_exceeded",
                        "title": f"{category.capitalize()} budget exceeded",
                        "description": f"Spent ${cat_data['spent']:.0f} of ${cat_data['limit']:.0f} limit ({pct:.0f}%)",
                        "severity": "high",
                        "suggestedAction": f"Review {category} spending and adjust budget"
                    })
                elif pct >= 80:
                    anomalies.append({
                        "id": f"anomaly_budget_near_limit_{category}",
                        "type": "budget_near_limit",
                        "title": f"{category.capitalize()} near budget limit",
                        "description": f"Spent ${cat_data['spent']:.0f} of ${cat_data['limit']:.0f} limit ({pct:.0f}%)",
                        "severity": "medium",
                        "suggestedAction": f"Reduce {category} spending to stay within budget"
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
