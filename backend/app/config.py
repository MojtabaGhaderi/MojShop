from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://shop_user:shop_pass@localhost:5432/moj_accessory"
    TEST_DATABASE_URL: str = "postgresql://shop_user:shop_pass@localhost:5432/moj_accessory_test"
    REDIS_URL: str = "redis://localhost:6379/0"
    GOLD_API_KEY: str = ""

    SECRET_KEY: str = "change-me-in-production-32-characters-long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ZARINPAL_MERCHANT_ID: "00000000-0000-0000-0000-000000000000"
    ZARINPAL_SANDBOX: bool = True
    FRONTEND_URL: str = "http://192.168.1.144:8000"  # used to build the ZarinPal callback_url
    # FRONTEND_URL: str = "http://10.209.61.91:3000"  # used to build the ZarinPal callback_url

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@mojshop.local"
    SMTP_FROM_NAME: str = "موج گالری"


    class Config:
        env_file = ".env"


settings = Settings()