from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Project, Task, File, Memory, DocumentChunk
from app.schemas import SearchResult

router = APIRouter()

@router.get("")
async def search(
    q: str,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    results = []
    q_lower = f"%{q}%"

    # Projects
    proj_result = await db.execute(
        select(Project).where(
            or_(Project.title.ilike(q_lower), Project.description.ilike(q_lower))
        ).limit(10)
    )
    for p in proj_result.scalars().all():
        results.append(SearchResult(
            id=p.id,
            type="project",
            title=p.title,
            content=p.description or "",
            score=1.0,
            meta_data={"status": p.status, "phase": p.current_phase}
        ))

    # Tasks
    task_result = await db.execute(
        select(Task).where(
            or_(Task.title.ilike(q_lower), Task.description.ilike(q_lower))
        ).limit(10)
    )
    for t in task_result.scalars().all():
        results.append(SearchResult(
            id=t.id,
            type="task",
            title=t.title,
            content=t.description or "",
            score=0.9,
            meta_data={"status": t.status, "priority": t.priority}
        ))

    # Memories
    mem_result = await db.execute(
        select(Memory).where(
            or_(Memory.title.ilike(q_lower), Memory.content.ilike(q_lower))
        ).limit(10)
    )
    for m in mem_result.scalars().all():
        results.append(SearchResult(
            id=m.id,
            type="memory",
            title=m.title,
            content=m.content[:200],
            score=0.8,
            meta_data={"memory_type": m.memory_type}
        ))

    # Files
    file_result = await db.execute(
        select(File).where(
            or_(File.filename.ilike(q_lower), File.summary.ilike(q_lower))
        ).limit(10)
    )
    for f in file_result.scalars().all():
        results.append(SearchResult(
            id=f.id,
            type="file",
            title=f.filename,
            content=f.summary or "",
            score=0.7,
            meta_data={"file_type": f.file_type}
        ))

    return {"query": q, "results": results, "count": len(results)}
