from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


class Config:
    SECRET_KEY = "dev-secret-key-change-me"
    DATABASE = str(DATA_DIR / "app.db")
    TOKEN_EXPIRES_SECONDS = 60 * 60 * 24 * 7

