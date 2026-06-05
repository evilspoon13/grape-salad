"""App settings loaded from the environment (.env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase Postgres — transaction-mode pooler connection string.
    DATABASE_URL: str = ""

    # Supabase project (Storage signed uploads only).
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Anthropic (digest generation).
    ANTHROPIC_API_KEY: str = ""

    # Default Claude model for the digest.
    ANTHROPIC_MODEL: str = "claude-opus-4-8"

    # CORS — allowed frontend origin.
    FRONTEND_ORIGIN: str = "http://localhost:5173"


settings = Settings()
