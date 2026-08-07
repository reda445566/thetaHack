"""Tools package for ORACLE.

Exports curated tool lists for binding to agents.
"""
from oracle.tools.search_tool import search_latest_data
from oracle.tools.weather_tool import get_weather_data

climate_tools = [get_weather_data, search_latest_data]
general_tools = [search_latest_data]

__all__ = ["climate_tools", "general_tools", "get_weather_data", "search_latest_data"]
