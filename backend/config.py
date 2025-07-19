import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = "https://klethzffhbnkpflbfufs.supabase.co"
    supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZXRoemZmaGJua3BmbGJmdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA5NTIsImV4cCI6MjA2NzkwNjk1Mn0.ojgULbT0x-x-3iTOwYRhs4ERkOxp8Lh225ENpuufSqM"
    
    # AI Model API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_ai_api_key: str = ""
    
    # Modal Configuration
    modal_token_id: str = ""
    modal_token_secret: str = ""
    
    # Application Settings
    environment: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 