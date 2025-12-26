from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    openrouter_api_key: str
    supabase_url: str
    supabase_service_key: str
    openrouter_model: str = "google/gemini-3-flash-preview"
    allowed_origins: str = "http://localhost:5173"


settings = Settings()
