import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Set
from functools import lru_cache

load_dotenv()

class Settings(BaseSettings):
    """Application Settings using Pydantic"""
    
    # App Settings
    app_name: str = "Student Attendance AI System"
    app_version: str = "1.0.0"
    debug: bool = Field(default=True, alias="FLASK_DEBUG")
    secret_key: str = Field(default="dev-secret-key-change-in-production", alias="SECRET_KEY")
    
    # MySQL Configuration
    mysql_host: str = Field(default="localhost", alias="MYSQL_HOST")
    mysql_user: str = Field(default="root", alias="MYSQL_USER")
    mysql_password: str = Field(default="", alias="MYSQL_PASSWORD")
    mysql_database: str = Field(default="student_attendance", alias="MYSQL_DATABASE")
    mysql_port: int = Field(default=3306, alias="MYSQL_PORT")
    
    # Upload Configuration
    max_file_size: int = 16 * 1024 * 1024  # 16MB
    allowed_extensions: Set[str] = {"jpg", "jpeg", "png", "gif"}
    
    # AI Configuration
    face_detection_model: str = "buffalo_l"
    face_similarity_threshold: float = 0.6
    
    @property
    def upload_folder(self) -> str:
        return os.path.join(os.path.dirname(__file__), 'uploads')
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# For backward compatibility
Config = get_settings()
