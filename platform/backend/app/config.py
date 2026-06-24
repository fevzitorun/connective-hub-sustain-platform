from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://sustain:sustain_dev_2026@localhost:5432/sustaindb"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "dev_secret_change_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 gün
    anthropic_api_key: str = ""
    environment: str = "development"

    # SMTP e-posta
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    # Rate limiting (istek/dk)
    rate_limit_per_minute: int = 100
    rate_limit_ai_per_hour: int = 20  # AI rapor üretimi

    # Stripe ödeme
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_publishable_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
