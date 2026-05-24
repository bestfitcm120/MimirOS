from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List
from app.models import DocumentChunk, Memory

class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def semantic_search(self, query: str, limit: int = 10) -> List[dict]:
        """Placeholder for semantic search - will use pgvector cosine similarity"""
        # For now, return recent memories as placeholder
        result = await self.db.execute(
            select(Memory).order_by(Memory.created_at.desc()).limit(limit)
        )
        memories = result.scalars().all()
        return [
            {
                "id": str(m.id),
                "type": "memory",
                "title": m.title,
                "content": m.content[:300],
                "score": 0.95
            }
            for m in memories
        ]
