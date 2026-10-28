import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "ResQFlow Engine"
    API_V1_STR: str = "/api/v1"
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "resqflow-demo")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    ALLOW_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
