"""OpenWeatherMap weather tool for ORACLE."""
import logging

import requests
from langchain_core.tools import tool

from oracle.config import settings

logger = logging.getLogger(__name__)

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


@tool
def get_weather_data(location: str) -> dict:
    """Fetch current weather for a location via the OpenWeatherMap API."""
    try:
        params = {
            "q": location,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",
        }
        response = requests.get(OPENWEATHER_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
        }
    except Exception as e:
        return {"error": str(e)}
