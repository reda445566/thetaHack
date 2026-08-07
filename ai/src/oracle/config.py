"""Configuration and settings for ORACLE.

Loads environment variables via python-dotenv and exposes a Pydantic
`Settings` instance for application use. Looks for `.env` in repository root
and in the `ai/` folder (where environments and venv are kept).
"""
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import os

# Load project-level .env and ai/.env (ai folder preferred for developer venv)
load_dotenv(dotenv_path=".env", override=False)
load_dotenv(dotenv_path=os.path.join("ai", ".env"), override=False)


class Settings(BaseSettings):
    OPENAI_API_KEY: str | None = None
    OPENWEATHER_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    class Config:
        env_file = os.path.join("ai", ".env")
        env_file_encoding = "utf-8"


settings = Settings()
