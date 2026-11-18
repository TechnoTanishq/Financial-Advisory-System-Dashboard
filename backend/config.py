"""
Central configuration — loaded once at startup from .env
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Groq
    groq_api_key: str
    groq_model: str = "llama-3.1-8b-instant"
    groq_url: str = "https://api.groq.com/openai/v1/chat/completions"

    # CORS — comma-separated origins
    allowed_origins: str = "http://localhost:5173,http://localhost:4173"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


# Single shared instance — import this everywhere
settings = Settings()
