# ═══════════════════════════════════════════════════════════
#  AIOS Backend Dockerfile
#  Multi-stage: base → deps → production
# ═══════════════════════════════════════════════════════════

# ── Stage 1: base ─────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Stage 2: deps ──────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the sentence-transformers model so the first
# request does not timeout waiting for a 22 MB download.
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
SentenceTransformer('all-MiniLM-L6-v2'); \
print('Embedding model cached')"

# ── Stage 3: production ────────────────────────────────────
FROM deps AS production

COPY . .

# Create storage directory for uploaded files
RUN mkdir -p /app/storage

EXPOSE 8000

# Healthcheck for docker compose depends_on
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--log-level", "info"]
