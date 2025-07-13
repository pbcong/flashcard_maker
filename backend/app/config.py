import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "https://flashcard-maker-lyart.vercel.app,http://localhost:5173"
    ).split(",")
    
    class Config:
        env_file = ".env"


settings = Settings()
