"""
Fivetran MCP integration for LifeSync
Manages Fivetran connectors and queries financial data
"""

from typing import Dict, Any, Optional, List
import httpx
import os
import base64
from datetime import datetime, timedelta
from services.cache import cache_service

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)

FIVETRAN_BASE_URL = "https://api.fivetran.com/v1"

class FivetranMCPClient:
    
    def __init__(self):
        self.api_key = os.getenv("FIVETRAN_API_KEY")
        self.api_secret = os.getenv("FIVETRAN_API_SECRET")
        self._auth_header = None
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_secret and self.api_key != "your-fivetran-api-key")
    
    def _get_auth_header(self) -> str:
        if not self._auth_header and self.is_configured:
            token = f"{self.api_key}:{self.api_secret}"
            encoded = base64.b64encode(token.encode()).decode()
            self._auth_header = f"Basic {encoded}"
        return self._auth_header
    
    def _get_client(self) -> httpx.AsyncClient:
        headers = {"Authorization": self._get_auth_header()} if self.is_configured else {}
        return httpx.AsyncClient(base_url=FIVETRAN_BASE_URL, headers=headers)
    
    # ==================== ACCOUNT / CONNECTORS ====================
    
    async def get_account_info(self) -> Dict[str, Any]:
        """Get Fivetran account info"""
        if not self.is_configured:
            return {"status": "not_configured", "message": "Fivetran API credentials not set"}
        async with self._get_client() as client:
            resp = await client.get("/account")
            return resp.json()
    
    async def list_connectors(self) -> List[Dict[str, Any]]:
        """List all connectors in the Fivetran account"""
        if not self.is_configured:
            return []
        async with self._get_client() as client:
            resp = await client.get("/connections")
            data = resp.json()
            return data.get("data", {}).get("items", [])
    
    async def get_connector_details(self, connector_id: str) -> Dict[str, Any]:
        """Get details of a specific connector"""
        if not self.is_configured:
            return {}
        async with self._get_client() as client:
            resp = await client.get(f"/connections/{connector_id}")
            return resp.json()
    
    async def trigger_sync(self, connector_id: str) -> Dict[str, Any]:
        """Trigger a manual sync for a connector"""
        if not self.is_configured:
            return {"status": "skipped", "message": "Fivetran not configured"}
        async with self._get_client() as client:
            resp = await client.post(f"/connections/{connector_id}/force")
            return resp.json()
    
    def _parse_financial_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw Fivetran destination data into LifeSync format"""
        # TODO: When Fivetran syncs Plaid/bank data to a destination,
        # query the destination (BigQuery/Postgres) and parse it here
        return {}
    
    # ==================== FINANCIAL DATA ====================
    
    async def fetch_bank_accounts(self, user_id: str) -> Dict[str, Any]:
        cache_id = f"cache_fivetran_bank_accounts_{user_id}"
        
        try:
            return await cache_service.get_or_fetch(
                cache_id,
                lambda: self._fetch_bank_accounts_fresh(user_id),
                ttl_minutes=45
            )
        except Exception as e:
            error_msg = str(e) or "Unknown Fivetran error"
            print(f"  Fivetran fetch error: {error_msg}")
            # Return mock data on any error
            return self._mock_data()
    
    async def _fetch_bank_accounts_fresh(self, user_id: str) -> Dict[str, Any]:
        if self.is_configured:
            connectors = await self.list_connectors()
            print(f"  Fivetran: {len(connectors)} connector(s) available")
            for c in connectors:
                print(f"    - {c.get('service')}: {c.get('status', {}).get('syncState')}")
        
        return self._mock_data()
    
    def _mock_data(self) -> Dict[str, Any]:
        return {
            "accounts": [
                {"id": "acc_checking_123", "name": "Checking", "balance": 5000.00, "type": "checking"},
                {"id": "acc_savings_123", "name": "Savings", "balance": 25000.00, "type": "savings"},
            ],
            "transactions": [
                {"id": "txn_1", "date": "2026-05-29", "merchant": "Netflix", "amount": -15.99, "category": "entertainment", "account_id": "acc_checking_123"},
                {"id": "txn_2", "date": "2026-05-29", "merchant": "Netflix", "amount": -15.99, "category": "entertainment", "account_id": "acc_checking_123"},
            ],
            "subscriptions": [
                {"id": "sub_1", "name": "Netflix", "amount": 15.99, "frequency": "monthly", "next_charge": "2026-06-29"},
            ],
            "synced_at": datetime.now().isoformat(),
        }
    
    async def fetch_recurring_charges(self, user_id: str) -> List[Dict[str, Any]]:
        data = await self.fetch_bank_accounts(user_id)
        return data.get("subscriptions", [])
    
    async def fetch_recent_transactions(self, user_id: str, days_back: int = 1) -> List[Dict[str, Any]]:
        data = await self.fetch_bank_accounts(user_id)
        return data.get("transactions", [])


fivetran_mcp = FivetranMCPClient()
