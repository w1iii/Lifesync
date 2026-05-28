"""
Orchestrator agent for LifeSync
Main entry point that coordinates all modules
"""

from typing import Dict, Any
from agents.inbox import inbox_module
from agents.finance import finance_module
from agents.schedule import schedule_module
from agents.anomaly import anomaly_module
from services.firestore import firestore_service
from services.notifications import notification_service
from datetime import datetime
import asyncio

class OrchestratorAgent:
    
    async def run_nightly_agent(self, user_id: str) -> Dict[str, Any]:
        """
        Main orchestrator - runs all modules and aggregates results
        
        Returns:
        {
            "briefing_id": "briefing_2026-05-29",
            "status": "completed",
            "modules": {
                "inbox": {...},
                "finance": {...},
                "schedule": {...},
                "anomalies": {...}
            },
            "timestamp": "2026-05-29T08:00:00Z",
            "duration_seconds": 45
        }
        """
        start_time = datetime.now()
        
        try:
            # Create briefing document with "generating" status
            briefing_id = await firestore_service.create_briefing(
                user_id,
                {"modules": {}, "syncMetadata": {}}
            )
            
            print(f"[Orchestrator] Starting briefing generation for user {user_id}")
            
            # Run all modules in parallel
            results = await asyncio.gather(
                inbox_module.run(user_id),
                finance_module.run(user_id),
                schedule_module.run(user_id),
                return_exceptions=True
            )
            
            inbox_result = results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])}
            finance_result = results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])}
            schedule_result = results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])}
            
            print(f"[Orchestrator] Module results: Inbox={inbox_result.get('status', 'ok')}, Finance={finance_result.get('status', 'ok')}, Schedule={schedule_result.get('status', 'ok')}")
            
            # Aggregate module results
            aggregated_results = {
                "inbox": inbox_result,
                "finance": finance_result,
                "schedule": schedule_result
            }
            
            # Run anomaly detection on aggregated results
            anomaly_result = await anomaly_module.run(aggregated_results)
            
            # Build final briefing
            briefing = {
                "modules": {
                    "inbox": self._clean_module_result(inbox_result),
                    "finance": self._clean_module_result(finance_result),
                    "schedule": self._clean_module_result(schedule_result),
                    "anomalies": anomaly_result
                },
                "status": "ready",
                "completedAt": datetime.now()
            }
            
            # Update briefing in Firestore
            await firestore_service.update_briefing(user_id, briefing_id, briefing)
            
            # Log execution
            duration = (datetime.now() - start_time).total_seconds()
            await firestore_service.log_agent_execution(
                user_id,
                {
                    "agentRunId": f"run_{user_id}_{start_time.timestamp()}",
                    "status": "completed",
                    "duration": duration,
                    "errors": [],
                    "moduleResults": {
                        "inbox": "completed" if not isinstance(results[0], Exception) else "failed",
                        "finance": "completed" if not isinstance(results[1], Exception) else "failed",
                        "schedule": "completed" if not isinstance(results[2], Exception) else "failed",
                        "anomalies": "completed"
                    }
                }
            )
            
            # Notify user
            await notification_service.notify_briefing_ready(user_id, briefing_id)
            
            print(f"[Orchestrator] Briefing completed in {duration:.2f} seconds")
            
            return {
                "briefing_id": briefing_id,
                "status": "completed",
                "modules": briefing["modules"],
                "timestamp": start_time.isoformat(),
                "duration_seconds": duration
            }
        
        except Exception as e:
            print(f"[Orchestrator] Error: {str(e)}")
            
            # Log error
            await notification_service.notify_agent_error(user_id, f"Briefing generation failed: {str(e)}")
            
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": start_time.isoformat()
            }
    
    def _clean_module_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Remove internal fields from module results"""
        if "error" in result or "status" in result and result["status"] == "failed":
            return {"error": result.get("error", "Unknown error")}
        
        # Remove nested "emails" field from inbox
        if "emails" in result:
            del result["emails"]
        
        return result

orchestrator = OrchestratorAgent()
