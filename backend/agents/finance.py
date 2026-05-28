"""
Finance module for LifeSync agent
Analyzes spending, detects anomalies, tracks budgets
"""

from typing import Dict, Any, List
from mcp.fivetran import fivetran_mcp
from services.firestore import firestore_service
from datetime import datetime, timedelta

class FinanceModule:
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        """
        Run the finance module
        
        Returns:
        {
            "budget": {"food": {"spent": 340, "limit": 500, "percentage": 68}},
            "billsDue": [...],
            "unusualCharges": [...],
            "portfolioChange": "+2.3%"
        }
        """
        try:
            # Fetch bank data
            bank_data = await fivetran_mcp.fetch_bank_accounts(user_id)
            
            # Get user budgets
            prefs = await firestore_service.get_user_preferences(user_id)
            budgets = prefs.get("budgets", {}) if prefs else {}
            
            # Calculate spending by category
            budget_spending = await self._calculate_budget_spending(bank_data, budgets)
            
            # Detect unusual charges
            unusual_charges = await self._detect_unusual_charges(bank_data)
            
            # Extract bills due
            bills_due = await self._extract_bills_due(bank_data)
            
            # Calculate portfolio change (if available)
            portfolio_change = "+2.3%"  # TODO: Fetch from data source
            
            return {
                "budget": budget_spending,
                "billsDue": bills_due,
                "unusualCharges": unusual_charges,
                "portfolioChange": portfolio_change,
                "totalSpent": self._sum_spending(budget_spending),
                "accounts": bank_data.get("accounts", [])
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _calculate_budget_spending(self, bank_data: Dict[str, Any], budgets: Dict[str, float]) -> Dict[str, Any]:
        """Calculate spending against budgets"""
        result = {}
        transactions = bank_data.get("transactions", [])
        
        # Map merchants to categories
        for category, limit in budgets.items():
            spent = 0
            for txn in transactions:
                if txn.get("category") == category and txn.get("amount", 0) < 0:
                    spent += abs(txn["amount"])
            
            percentage = (spent / limit * 100) if limit > 0 else 0
            result[category] = {
                "spent": spent,
                "limit": limit,
                "percentage": round(percentage, 1)
            }
        
        return result
    
    async def _detect_unusual_charges(self, bank_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect duplicate charges, new subscriptions, unusual amounts"""
        unusual = []
        transactions = bank_data.get("transactions", [])
        subscriptions = bank_data.get("subscriptions", [])
        
        # Check for duplicate charges (same merchant, same amount within 24h)
        merchants_seen = {}
        for txn in transactions:
            merchant = txn.get("merchant")
            amount = txn.get("amount")
            key = f"{merchant}_{amount}"
            
            if key in merchants_seen:
                # Duplicate charge detected
                unusual.append({
                    "id": f"anomaly_dup_{txn.get('id')}",
                    "type": "duplicate_charge",
                    "title": f"{merchant} charged twice",
                    "description": f"${abs(amount):.2f} charged multiple times",
                    "severity": "high",
                    "suggestedAction": "Contact merchant to request refund",
                    "txnIds": [merchants_seen[key]["id"], txn.get("id")]
                })
            else:
                merchants_seen[key] = txn
        
        return unusual
    
    async def _extract_bills_due(self, bank_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract bills due in next 7 days"""
        bills = []
        subscriptions = bank_data.get("subscriptions", [])
        today = datetime.now()
        
        for sub in subscriptions:
            next_charge = datetime.fromisoformat(sub.get("next_charge", ""))
            days_until = (next_charge - today).days
            
            if 0 <= days_until <= 7:
                bills.append({
                    "name": sub.get("name"),
                    "amount": sub.get("amount"),
                    "dueDate": sub.get("next_charge"),
                    "daysUntilDue": days_until
                })
        
        return sorted(bills, key=lambda x: x["daysUntilDue"])
    
    def _sum_spending(self, budget_spending: Dict[str, Any]) -> float:
        """Sum total spending across all budgets"""
        return sum(cat.get("spent", 0) for cat in budget_spending.values())

finance_module = FinanceModule()
