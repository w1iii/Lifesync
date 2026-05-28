"""
Inbox module for LifeSync agent
Fetches and categorizes emails
"""

from typing import Dict, Any, List
from mcp.gmail import gmail_mcp
from datetime import datetime

class InboxModule:
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        """
        Run the inbox module
        
        Returns:
        {
            "totalEmails": 47,
            "needsAttention": 3,
            "draftedReplies": [...],
            "categorized": {"urgent": 3, "fyi": 12, "archive": 32},
            "suggestedUnsubscribes": 5
        }
        """
        try:
            # Fetch recent emails
            emails = await gmail_mcp.fetch_recent_emails(user_id, hours_back=24)
            
            # Categorize emails
            urgent = []
            fyi = []
            archive = []
            drafted_replies = []
            
            for email in emails:
                category = self._categorize_email(email)
                
                if category == "urgent":
                    urgent.append(email)
                    # Draft reply for urgent emails if needed
                    if "reply_needed" in email.get("labels", []):
                        reply = await self._draft_reply(email)
                        drafted_replies.append(reply)
                elif category == "fyi":
                    fyi.append(email)
                else:
                    archive.append(email)
            
            return {
                "totalEmails": len(emails),
                "needsAttention": len(urgent),
                "draftedReplies": drafted_replies,
                "categorized": {
                    "urgent": len(urgent),
                    "fyi": len(fyi),
                    "archive": len(archive)
                },
                "suggestedUnsubscribes": self._count_newsletter_spam(emails),
                "emails": {
                    "urgent": urgent,
                    "fyi": fyi,
                    "archive": archive
                }
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }
    
    def _categorize_email(self, email: Dict[str, Any]) -> str:
        """Categorize an email as urgent, fyi, or archive"""
        subject_lower = email.get("subject", "").lower()
        from_addr = email.get("from", "").lower()
        
        # Rule-based categorization
        urgent_keywords = ["urgent", "asap", "critical", "action required", "deadline"]
        newsletter_keywords = ["unsubscribe", "newsletter", "digest", "no-reply"]
        
        # Check for urgent markers
        for keyword in urgent_keywords:
            if keyword in subject_lower:
                return "urgent"
        
        # Check for newsletters/spam
        for keyword in newsletter_keywords:
            if keyword in from_addr or keyword in subject_lower:
                return "archive"
        
        # Check if from known contacts (boss, clients)
        if any(domain in from_addr for domain in ["boss@", "ceo@", "manager@"]):
            return "urgent"
        
        # Default to FYI
        return "fyi"
    
    async def _draft_reply(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """Draft a reply to an email using Gemini"""
        # TODO: Use Gemini to draft contextual reply
        return {
            "id": f"reply_{email.get('id')}",
            "from": email.get("from"),
            "subject": f"Re: {email.get('subject')}",
            "draft": "Thank you for reaching out. I'll get back to you soon.",
            "approved": False,
            "executedAt": None
        }
    
    def _count_newsletter_spam(self, emails: List[Dict[str, Any]]) -> int:
        """Count newsletter/spam emails for unsubscribe suggestions"""
        count = 0
        newsletter_keywords = ["unsubscribe", "newsletter", "digest", "no-reply"]
        
        for email in emails:
            from_addr = email.get("from", "").lower()
            for keyword in newsletter_keywords:
                if keyword in from_addr:
                    count += 1
                    break
        
        return count

inbox_module = InboxModule()
