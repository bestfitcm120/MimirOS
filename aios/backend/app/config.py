from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_env: str = "development"
    app_secret_key: str = "dev_secret_key_change_in_production"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://aios:aios_secret@localhost:5432/aios_db"
    database_url_sync: str = "postgresql://aios:aios_secret@localhost:5432/aios_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "aios_minio"
    minio_secret_key: str = "aios_minio_secret"
    minio_bucket: str = "aios-files"
    minio_secure: bool = False

    # ── OpenRouter ───────────────────────────────────────────────────────────
    # Get your key at https://openrouter.ai/keys
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    # Model for chat/completions — any OpenRouter model ID works here.
    # Free options:  meta-llama/llama-3.1-8b-instruct:free
    #                mistralai/mistral-7b-instruct:free
    #                google/gemma-2-9b-it:free
    # Paid options:  anthropic/claude-sonnet-4-5
    #                openai/gpt-4o-mini
    #                google/gemini-flash-1.5
    llm_model: str = "meta-llama/llama-3.1-8b-instruct:free"

    # ── Embeddings ───────────────────────────────────────────────────────────
    # OpenRouter does NOT support embeddings.
    # Options (pick one):
    #   "openai"   — requires EMBEDDING_OPENAI_API_KEY (direct OpenAI call)
    #   "local"    — uses sentence-transformers, no API key needed (slower)
    #   "none"     — disables embeddings, keyword search only
    embedding_provider: str = "local"
    embedding_model: str = "all-MiniLM-L6-v2"          # used when provider=local
    embedding_openai_api_key: str = ""                   # used when provider=openai
    embedding_openai_model: str = "text-embedding-3-small"

    # App site name sent in OpenRouter headers (identifies your app)
    app_site_name: str = "AIOS Command Center"
    app_site_url: str = "http://localhost:5173"

    # Linux
    watch_directories: str = ""
    shell_command_whitelist: str = "git,python3,ls,cat,find,grep"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def watch_directories_list(self) -> List[str]:
        if not self.watch_directories:
            return []
        return [d.strip() for d in self.watch_directories.split(",")]

    @property
    def shell_whitelist(self) -> List[str]:
        return [c.strip() for c in self.shell_command_whitelist.split(",")]


settings = Settings()
