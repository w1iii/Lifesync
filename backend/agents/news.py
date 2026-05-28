"""
News module for LifeSync agent
Fetches and filters news articles by user interests
"""

from typing import Dict, Any, List
from mcp.elastic import elastic_mcp

class NewsModule:
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        """
        Run the news module
        
        Returns:
        {
            "articles": [...],
            "totalArticles": 5,
            "interests": ["AI", "technology", "finance"]
        }
        """
        try:
            # Default interests (in production, load from user preferences)
            interests = ["AI", "technology", "finance"]
            
            articles = await elastic_mcp.search_news(
                user_id,
                interests=interests,
                limit=5
            )
            
            return {
                "articles": articles,
                "totalArticles": len(articles),
                "interests": interests,
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "failed",
                "articles": [],
                "totalArticles": 0,
            }

news_module = NewsModule()
