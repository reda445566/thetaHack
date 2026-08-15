"""Configuration and settings for ORACLE.

Loads environment variables via python-dotenv and exposes a Pydantic
`Settings` instance for application use. Looks for `.env` in repository root
and in the `ai/` folder (where environments and venv are kept).
"""
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import os
from typing import Any

try:
    from langchain_openrouter import ChatOpenRouter
except ImportError:
    ChatOpenRouter = None

try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None

# Load project-level .env and ai/.env (ai folder preferred for developer venv)
load_dotenv(dotenv_path=".env", override=False)
load_dotenv(dotenv_path=os.path.join("ai", ".env"), override=False)


class Settings(BaseSettings):
    NVIDIA_API_KEY: str | None = None
    NVIDIA_MODEL: str = "meta/llama-3.1-8b-instruct"
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    ZAI_API_KEY: str | None = None
    ZAI_MODEL: str = "glm-5.1"
    ZAI_BASE_URL: str = "https://api.z.ai/api/paas/v4/"
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str | None = None
    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str | None = None
    LLM_TIMEOUT_SECONDS: int = 30
    DECISION_MEMORY_DB_PATH: str = "ai/oracle_memory.sqlite3"
    DECISION_MEMORY_DATABASE_URL: str | None = None

    class Config:
        env_file = os.path.join("ai", ".env")
        env_file_encoding = "utf-8"


settings = Settings()


def get_decision_memory_database_url() -> str:
    """Return the configured decision-memory database URL."""
    if settings.DECISION_MEMORY_DATABASE_URL:
        return settings.DECISION_MEMORY_DATABASE_URL
    if os.environ.get("VERCEL"):
        return "sqlite:////tmp/oracle_memory.sqlite3"
    return f"sqlite:///{settings.DECISION_MEMORY_DB_PATH}"


def get_chat_model(model: str, temperature: float = 0.7) -> Any:
    """Return a configured chat model for NVIDIA NIM, GLM, OpenRouter, or OpenAI."""
    if settings.NVIDIA_API_KEY and ChatOpenAI is not None:
        return ChatOpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url=settings.NVIDIA_BASE_URL,
            model=settings.NVIDIA_MODEL,
            temperature=temperature,
            timeout=settings.LLM_TIMEOUT_SECONDS,
            max_retries=3,
        )

    if settings.ZAI_API_KEY and ChatOpenAI is not None:
        # Z.AI's GLM API is OpenAI-compatible, so the existing LangChain
        # integration needs no custom client or changes in the agents.
        return ChatOpenAI(
            api_key=settings.ZAI_API_KEY,
            base_url=settings.ZAI_BASE_URL,
            model=settings.ZAI_MODEL,
            temperature=temperature,
            timeout=settings.LLM_TIMEOUT_SECONDS,
            max_retries=3,
        )

    if settings.OPENROUTER_API_KEY and ChatOpenAI is not None:
        # OpenRouter exposes an OpenAI-compatible endpoint. Using the standard
        # client here makes its HTTP timeout apply consistently to every agent.
        return ChatOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            # OpenRouter expects provider-qualified model IDs. Keep this
            # fallback valid even when OPENROUTER_MODEL is not set.
            model=settings.OPENROUTER_MODEL or "openai/gpt-4o-mini",
            temperature=temperature,
            timeout=settings.LLM_TIMEOUT_SECONDS,
            max_retries=3,
        )

    if settings.OPENROUTER_API_KEY and ChatOpenRouter is not None:
        return ChatOpenRouter(
            api_key=settings.OPENROUTER_API_KEY,
            model=settings.OPENROUTER_MODEL or "openai/gpt-4o-mini",
            temperature=temperature,
            timeout=settings.LLM_TIMEOUT_SECONDS,
            max_retries=3,
        )

    if settings.OPENAI_API_KEY and ChatOpenAI is not None:
        return ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL or model,
            temperature=temperature,
            timeout=settings.LLM_TIMEOUT_SECONDS,
            max_retries=3,
        )

    return None
