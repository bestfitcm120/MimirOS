"""
Celery workflow runner.
Background tasks for embeddings, daily briefing, etc.
All LLM calls go through OpenRouter via LLMService.
All embeddings go through EmbeddingService (local/openai/none).
"""
from celery import Celery
from app.config import settings

celery_app = Celery(
    "aios",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, name="aios.embed_document_chunks")
def embed_document_chunks_task(self, document_id: str):
    """
    Embed all un-embedded chunks for a document.
    Called after file upload when embedding provider is available.
    """
    import asyncio

    async def _run():
        from app.database import AsyncSessionLocal
        from app.models.document import DocumentChunk
        from app.services.embedding_service import EmbeddingService
        from sqlalchemy import select
        import uuid as uuid_mod

        svc = EmbeddingService()
        if not svc.is_available():
            return {"skipped": True, "reason": "embedding_provider=none"}

        doc_uuid = uuid_mod.UUID(document_id)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(DocumentChunk)
                .where(DocumentChunk.document_id == doc_uuid)
                .where(DocumentChunk.embedding.is_(None))
            )
            chunks = result.scalars().all()
            if not chunks:
                return {"embedded": 0}

            texts = [c.content for c in chunks]
            embeddings = await svc.embed_batch(texts)
            for chunk, emb in zip(chunks, embeddings):
                if emb is not None:
                    chunk.embedding = emb
            await db.commit()
            return {"embedded": sum(1 for e in embeddings if e is not None)}

    return asyncio.run(_run())


@celery_app.task(bind=True, name="aios.daily_briefing")
def daily_briefing_task(self, user_id: str):
    """
    Generate a morning briefing for the user using the configured LLM (OpenRouter).
    """
    import asyncio

    async def _run():
        from app.database import AsyncSessionLocal
        from app.models.task import Task
        from app.models.notification import Notification
        from app.services.llm_service import LLMService
        from sqlalchemy import select
        from datetime import datetime, timedelta
        import uuid as uuid_mod

        uid = uuid_mod.UUID(user_id)
        now = datetime.utcnow()
        week_end = now + timedelta(days=7)

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Task).where(
                    Task.user_id == uid,
                    Task.status.in_(["pending", "in_progress", "blocked"]),
                    Task.due_date <= week_end,
                )
            )
            tasks = result.scalars().all()
            task_lines = "\n".join(
                f"- [{t.priority}] {t.title} (due {t.due_date})"
                for t in tasks
            ) or "No upcoming tasks."

            svc = LLMService()
            briefing = await svc.generate_daily_briefing(
                tasks=task_lines,
                events="No calendar events imported yet.",
            )

            notif = Notification(
                user_id=uid,
                type="daily_briefing",
                title="Morning briefing ready",
                body=briefing,
                priority="medium",
            )
            db.add(notif)
            await db.commit()
            return {"briefing": briefing}

    return asyncio.run(_run())
