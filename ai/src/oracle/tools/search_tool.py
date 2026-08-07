"""Tavily web search tool for ORACLE."""
import logging

from langchain_community.tools import TavilySearchResults
from langchain_core.tools import tool

from oracle.config import settings

logger = logging.getLogger(__name__)


@tool
def search_latest_data(query: str) -> list[dict]:
    """Search the web for the latest information on a query via Tavily."""
    try:
        client = TavilySearchResults(
            tavily_api_key=settings.TAVILY_API_KEY, max_results=3
        )
        results = client.invoke(query)
        return [
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", ""),
            }
            for item in results
        ]
    except Exception as e:
        return [{"error": str(e)}]
