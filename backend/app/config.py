from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://shop_user:shop_pass@localhost:5432/moj_accessory"
    TEST_DATABASE_URL: str = "postgresql://shop_user:shop_pass@localhost:5432/moj_accessory_test"
    REDIS_URL: str = "redis://localhost:6379/0"
    GOLD_API_KEY: str = ""

    SECRET_KEY: str = "change-me-in-production-32-characters-long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    class Config:
        env_file = ".env"


settings = Settings()