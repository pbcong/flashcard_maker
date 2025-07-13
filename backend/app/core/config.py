from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Allow extra fields to be ignored instead of causing errors
    )

    openai_api_key: str
    supabase_url: str
    supabase_service_key: str
    openai_model: str = "gpt-4o"
    database_url: str = ""  # Add database_url field
    allowed_origins: str = "http://localhost:5173"  # Add allowed_origins field


settings = Settings()
