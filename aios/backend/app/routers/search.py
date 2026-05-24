"""
Search router — hybrid keyword + optional semantic search.
Semantic search is active only when EMBEDDING_PROVIDER != none.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.memory import Memory
from app.models.document import Document, DocumentChunk
from app.models.decision import Decision
from app.models.failure import Failure
from app.services.embedding_service import EmbeddingService
from typing import List, Dict, Any, Optional
import uuid

router = APIRouter()

_emb_svc: Optional[EmbeddingService] = None

def _get_emb() -> EmbeddingService:
    global _emb_svc
    if _emb_svc is None:
        _emb_svc = EmbeddingService()
    return _emb_svc


@router.get("/")
async def search(
    q: str,
    user_id: uuid.UUID,
    types: Optional[str] = None,
    semantic: bool = True,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Hybrid search across all entity types.
    - Always runs keyword (ILIKE) search.
    - Also runs semantic (vector cosine) search when semantic=true
      and EMBEDDING_PROVIDER != none.
    Results are merged and deduplicated.
    """
    results: List[Dict[str, Any]] = []
    search_types = types.split(",") if types else [
        "project", "task", "memory", "document", "decision", "failure"
    ]
    like = f"%{q.lower()}%"

    # ── Keyword search ────────────────────────────────────────────────────────
    if "project" in search_types:
        r = await db.execute(
            select(Project).where(
                Project.user_id == user_id,
                or_(
                    Project.name.ilike(like),
                    Project.description.ilike(like),
                    Project.summary.ilike(like),
                ),
            ).limit(limit)
        )
        for p in r.scalars():
            results.append({
                "type": "project", "id": str(p.id),
                "title": p.name, "summary": p.summary, "status": p.status,
                "score": 1.0,
            })

    if "task" in search_types:
        r = await db.execute(
            select(Task).where(
                Task.user_id == user_id,
                or_(Task.title.ilike(like), Task.description.ilike(like)),
            ).limit(limit)
        )
        for t in r.scalars():
            results.append({
                "type": "task", "id": str(t.id),
                "title": t.title, "summary": t.description, "status": t.status,
                "score": 1.0,
            })

    if "memory" in search_types:
        r = await db.execute(
            select(Memory).where(
                Memory.user_id == user_id,
                or_(
                    Memory.title.ilike(like),
                    Memory.content.ilike(like),
                    Memory.summary.ilike(like),
                ),
            ).limit(limit)
        )
        for m in r.scalars():
            results.append({
                "type": "memory", "id": str(m.id),
                "title": m.title, "summary": m.summary,
                "status": m.memory_type, "score": 1.0,
            })

    if "decision" in search_types:
        r = await db.execute(
            select(Decision).where(
                Decision.user_id == user_id,
                or_(Decision.title.ilike(like), Decision.description.ilike(like)),
            ).limit(limit)
        )
        for d in r.scalars():
            results.append({
                "type": "decision", "id": str(d.id),
                "title": d.title, "summary": d.rationale,
                "status": d.outcome_assessment, "score": 1.0,
            })

    if "failure" in search_types:
        r = await db.execute(
            select(Failure).where(
                Failure.user_id == user_id,
                or_(Failure.title.ilike(like), Failure.description.ilike(like)),
            ).limit(limit)
        )
        for f in r.scalars():
            results.append({
                "type": "failure", "id": str(f.id),
                "title": f.title, "summary": f.lesson_learned,
                "status": "resolved" if f.is_resolved else "open",
                "score": 1.0,
            })

    # ── Semantic search on document chunks ────────────────────────────────────
    emb_svc = _get_emb()
    if semantic and emb_svc.is_available() and "document" in search_types:
        query_vec = await emb_svc.embed(q)
        if query_vec is not None:
            # pgvector cosine similarity via raw SQL
            from sqlalchemy import text as sa_text
            vec_str = "[" + ",".join(str(x) for x in query_vec) + "]"
            raw = await db.execute(
                sa_text(
                    """
                    SELECT dc.id, dc.content, dc.document_id,
                           1 - (dc.embedding <=> :vec::vector) AS score
                    FROM   document_chunks dc
                    JOIN   documents d ON d.id = dc.document_id
                    WHERE  d.user_id = :uid
                      AND  dc.embedding IS NOT NULL
                      AND  1 - (dc.embedding <=> :vec::vector) > 0.5
                    ORDER  BY score DESC
                    LIMIT  :lim
                    """
                ),
                {"vec": vec_str, "uid": str(user_id), "lim": limit},
            )
            seen_docs: set = set()
            for row in raw.fetchall():
                doc_id = str(row.document_id)
                if doc_id not in seen_docs:
                    seen_docs.add(doc_id)
                    results.append({
                        "type": "document_chunk",
                        "id": doc_id,
                        "title": f"Passage from document",
                        "summary": row.content[:200],
                        "status": "matched",
                        "score": float(row.score),
                    })

    # Deduplicate by (type, id), keep highest score
    seen: dict = {}
    for r in results:
        key = (r["type"], r["id"])
        if key not in seen or r["score"] > seen[key]["score"]:
            seen[key] = r

    final = sorted(seen.values(), key=lambda x: x["score"], reverse=True)[:limit]
    return {
        "query": q,
        "count": len(final),
        "semantic_enabled": emb_svc.is_available(),
        "embed_provider": emb_svc.provider,
        "results": final,
    }


@router.get("/status")
async def search_status() -> Dict[str, Any]:
    """Returns embedding provider status — useful for debugging."""
    svc = _get_emb()
    return {
        "embedding_provider": svc.provider,
        "embedding_available": svc.is_available(),
        "embedding_dim": svc.vector_dim(),
    }
