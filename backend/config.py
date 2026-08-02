"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings for Axiomm backend services."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: Optional[str] = None
    neo4j_uri: Optional[str] = None
    neo4j_username: str = "neo4j"
    neo4j_password: Optional[str] = None
    demo_mode: bool = False
    chroma_path: str = "./chroma_db"
    chroma_collection: str = "industry_skills_2026"
    # gemini-2.5-flash is closed to new API keys; use 3.x Flash for free tier.
    gemini_model: str = "gemini-3.5-flash"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
