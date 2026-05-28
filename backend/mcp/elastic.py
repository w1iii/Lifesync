"""
Elastic MCP integration for LifeSync
Fetches real news via RSS feeds, filtered by user interests
"""

from typing import Dict, Any, List, Optional
import os
import feedparser
from datetime import datetime
from services.cache import cache_service

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)

DEFAULT_FEEDS = [
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "https://www.theverge.com/rss/index.xml",
    "https://feeds.bloomberg.com/markets/news.rss",
    "https://feeds.content.dowjones.io/public/rss/mw_topstories",
]

INTEREST_KEYWORDS = {
    "AI": ["artificial intelligence", "AI", "machine learning", "LLM", "GPT", "OpenAI", "neural"],
    "technology": ["tech", "startup", "software", "app", "digital", "cyber", "cloud", "data"],
    "finance": ["stock", "market", "finance", "investing", "economy", "crypto", "banking"],
    "science": ["research", "study", "discovery", "space", "climate", "biology", "physics"],
    "business": ["business", "startup", "IPO", "acquisition", "funding", "revenue"],
}


class ElasticMCPClient:
    
    def __init__(self):
        self.api_key = os.getenv("ELASTIC_API_KEY")
        self.endpoint = os.getenv("ELASTIC_ENDPOINT")
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.endpoint)
    
    async def _fetch_rss_feed(self, feed_url: str) -> List[Dict[str, Any]]:
        """Fetch and parse an RSS feed using httpx + feedparser"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(feed_url, headers={"User-Agent": "LifeSync/1.0"})
                resp.raise_for_status()
                feed = feedparser.parse(resp.text)
            
            articles = []
            for entry in feed.entries[:10]:
                source = getattr(entry, "source", None)
                source_title = getattr(source, "title", None) if source else None
                if not source_title:
                    source_title = feed.feed.get("title", "Unknown")
                
                articles.append({
                    "id": entry.get("id", entry.get("link", "")),
                    "title": entry.get("title", ""),
                    "source": source_title,
                    "url": entry.get("link", ""),
                    "published_at": entry.get("published", ""),
                    "summary": entry.get("summary", entry.get("description", ""))[:300],
                    "tags": [],
                })
            return articles
        except Exception as e:
            print(f"  RSS fetch error: {feed_url.split('/')[2]} - {e}")
            return []
    
    def _score_article(self, article: Dict[str, Any], interests: List[str]) -> float:
        """Score an article's relevance to user interests"""
        title = article.get("title", "").lower()
        summary = article.get("summary", "").lower()
        text = f"{title} {summary}"
        
        score = 0.0
        for interest in interests:
            keywords = INTEREST_KEYWORDS.get(interest, [interest.lower()])
            for kw in keywords:
                if kw.lower() in text:
                    score += 0.25
        
        return min(score, 1.0)
    
    async def search_news(
        self,
        user_id: str,
        interests: List[str],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Fetch news filtered by user interests
        
        Returns filtered articles from RSS feeds ranked by relevance
        """
        cache_key = "_".join(sorted(interests))
        cache_id = f"cache_elastic_news_{user_id}_{cache_key}"
        
        try:
            return await cache_service.get_or_fetch(
                cache_id,
                lambda: self._search_news_fresh(interests, limit),
                ttl_minutes=60
            )
        except Exception as e:
            print(f"  News fetch error: {e}")
            return self._mock_news(interests, limit)
    
    async def _search_news_fresh(self, interests: List[str], limit: int) -> List[Dict[str, Any]]:
        """Fetch fresh news from RSS feeds in parallel"""
        import asyncio
        
        all_articles = []
        feeds = DEFAULT_FEEDS
        # If Elastic is configured, also try it
        # if self.is_configured:
        #     feeds += await self._elastic_search(interests)
        
        # Fetch RSS feeds concurrently
        tasks = [self._fetch_rss_feed(url) for url in feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)
        
        # Score and filter by interests
        scored = []
        for article in all_articles:
            score = self._score_article(article, interests)
            if score > 0:
                article["relevance_score"] = round(score, 2)
                scored.append(article)
        
        # Sort by relevance score, then by date
        scored.sort(key=lambda a: (
            a.get("relevance_score", 0),
            a.get("published_at", "")
        ), reverse=True)
        
        if scored:
            return scored[:limit]
        
        # Fallback: return all articles scored 0 (user may not have interests configured)
        for article in all_articles[:limit]:
            article["relevance_score"] = 0.5
        return all_articles[:limit]
    
    def _mock_news(self, interests: List[str], limit: int) -> List[Dict[str, Any]]:
        return [
            {
                "id": "article_1", "title": "EU passes new AI transparency law",
                "source": "Reuters", "url": "https://reuters.com/tech/eu-ai-law",
                "published_at": "2026-05-29",
                "summary": "The European Parliament voted to require AI model transparency...",
                "relevance_score": 0.95, "tags": ["AI", "regulation", "EU"]
            },
            {
                "id": "article_2", "title": "OpenAI releases new reasoning model",
                "source": "TechCrunch", "url": "https://techcrunch.com/openai-new-model",
                "published_at": "2026-05-29",
                "summary": "OpenAI announced a new large language model with improved reasoning...",
                "relevance_score": 0.88, "tags": ["AI", "technology", "OpenAI"]
            },
            {
                "id": "article_3", "title": "Stock market up 2.3% this week",
                "source": "Bloomberg", "url": "https://bloomberg.com/stocks",
                "published_at": "2026-05-29",
                "summary": "Major indices reached new highs as investors react to positive...",
                "relevance_score": 0.72, "tags": ["finance", "stocks", "markets"]
            },
        ]
    
    async def get_feed_articles(
        self,
        user_id: str,
        feed_url: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get articles from a specific RSS feed"""
        articles = await self._fetch_rss_feed(feed_url)
        return articles[:limit]


elastic_mcp = ElasticMCPClient()
