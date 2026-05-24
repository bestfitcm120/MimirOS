"""
Embedding Service — three providers, selected via EMBEDDING_PROVIDER in .env:

  local   (default) — sentence-transformers, no API key, runs on CPU.
                      Model: all-MiniLM-L6-v2  (384-dim, ~22 MB).
                      Install: pip install sentence-transformers
                      Vectors stored as 384-dim in pgvector.

  openai            — direct OpenAI embeddings call (NOT through OpenRouter,
                      which doesn't support /embeddings).
                      Requires: EMBEDDING_OPENAI_API_KEY in .env
                      Model: text-embedding-3-small (1536-dim)

  none              — disables embeddings entirely.
                      Keyword search still works; semantic search disabled.
"""
from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import List, Optional
import structlog

from app.config import settings

log = structlog.get_logger()

# Dimension per provider — must match pgvector column definition
EMBEDDING_DIM = {
    "local": 384,
    "openai": 1536,
    "none": 0,
}


# ── Local provider (sentence-transformers) ────────────────────────────────────

@lru_cache(maxsize=1)
def _load_local_model():
    """Load once, cache for process lifetime."""
    try:
        from sentence_transformers import SentenceTransformer
        log.info("Loading local embedding model", model=settings.embedding_model)
        model = SentenceTransformer(settings.embedding_model)
        log.info("Local embedding model loaded")
        return model
    except ImportError:
        log.error(
            "sentence-transformers not installed. "
            "Run: pip install sentence-transformers"
        )
        return None
    except Exception as e:
        log.error("Failed to load local embedding model", error=str(e))
        return None


def _embed_local(text: str) -> Optional[List[float]]:
    model = _load_local_model()
    if model is None:
        return None
    try:
        vec = model.encode(text[:2000], normalize_embeddings=True)
        return vec.tolist()
    except Exception as e:
        log.error("Local embedding failed", error=str(e))
        return None


# ── OpenAI provider (direct, not through OpenRouter) ──────────────────────────

@lru_cache(maxsize=1)
def _get_openai_client():
    if not settings.embedding_openai_api_key:
        log.warning("EMBEDDING_OPENAI_API_KEY not set — OpenAI embeddings disabled")
        return None
    try:
        import openai
        return openai.AsyncOpenAI(api_key=settings.embedding_openai_api_key)
    except ImportError:
        log.error("openai package not installed")
        return None


async def _embed_openai(text: str) -> Optional[List[float]]:
    client = _get_openai_client()
    if client is None:
        return None
    try:
        resp = await client.embeddings.create(
            input=text[:8000],
            model=settings.embedding_openai_model,
        )
        return resp.data[0].embedding
    except Exception as e:
        log.error("OpenAI embedding failed", error=str(e))
        return None


# ── Public API ────────────────────────────────────────────────────────────────

class EmbeddingService:
    """
    Unified embedding interface.  Provider is selected from settings at import time.
    All public methods are async even for the local provider (runs in executor).
    """

    def __init__(self):
        self.provider = settings.embedding_provider.lower()
        self.dim = EMBEDDING_DIM.get(self.provider, 0)
        log.info("EmbeddingService initialised", provider=self.provider, dim=self.dim)

    async def embed(self, text: str) -> Optional[List[float]]:
        """Return embedding vector for a single text, or None if unavailable."""
        if not text or not text.strip():
            return None

        if self.provider == "none":
            return None

        if self.provider == "openai":
            return await _embed_openai(text)

        # local (default) — run blocking call in thread executor
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _embed_local, text)

    async def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Embed multiple texts.  Local provider batches efficiently."""
        if self.provider == "none":
            return [None] * len(texts)

        if self.provider == "local":
            model = _load_local_model()
            if model is None:
                return [None] * len(texts)
            loop = asyncio.get_event_loop()

            def _batch():
                vecs = model.encode(
                    [t[:2000] for t in texts],
                    normalize_embeddings=True,
                    show_progress_bar=False,
                )
                return [v.tolist() for v in vecs]

            return await loop.run_in_executor(None, _batch)

        # openai — sequential (rate-limit friendly)
        results = []
        for text in texts:
            results.append(await _embed_openai(text))
        return results

    def is_available(self) -> bool:
        return self.provider != "none"

    def vector_dim(self) -> int:
        return self.dim
