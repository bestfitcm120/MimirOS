from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.relationship import Relationship
from app.models.project import Project
from app.models.task import Task
from app.models.memory import Memory
from app.models.decision import Decision
from app.models.failure import Failure
from app.models.file import File
from typing import Optional, List, Dict, Any
import uuid

router = APIRouter()


async def build_nodes_from_projects(db, user_id):
    result = await db.execute(select(Project).where(Project.user_id == user_id))
    return [
        {"id": str(p.id), "type": "project", "label": p.name,
         "data": {"status": p.status, "phase": p.phase, "color": p.color or "#3b82f6"}}
        for p in result.scalars().all()
    ]

async def build_nodes_from_tasks(db, user_id):
    result = await db.execute(select(Task).where(Task.user_id == user_id))
    return [
        {"id": str(t.id), "type": "task", "label": t.title,
         "data": {"status": t.status, "priority": t.priority}}
        for t in result.scalars().all()
    ]

async def build_nodes_from_decisions(db, user_id):
    result = await db.execute(select(Decision).where(Decision.user_id == user_id))
    return [
        {"id": str(d.id), "type": "decision", "label": d.title,
         "data": {"outcome_assessment": d.outcome_assessment}}
        for d in result.scalars().all()
    ]

async def build_nodes_from_failures(db, user_id):
    result = await db.execute(select(Failure).where(Failure.user_id == user_id))
    return [
        {"id": str(f.id), "type": "failure", "label": f.title,
         "data": {"severity": f.severity, "is_resolved": f.is_resolved}}
        for f in result.scalars().all()
    ]

async def build_nodes_from_files(db, user_id):
    result = await db.execute(select(File).where(File.user_id == user_id, File.is_latest == True))
    return [
        {"id": str(f.id), "type": "file", "label": f.filename,
         "data": {"file_type": f.file_type}}
        for f in result.scalars().all()
    ]


@router.get("/")
async def get_graph(
    user_id: uuid.UUID,
    project_id: Optional[uuid.UUID] = None,
    node_types: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Return nodes and edges for the memory graph."""
    nodes = []
    types = node_types.split(",") if node_types else ["project", "task", "decision", "failure", "file"]

    if "project" in types:
        nodes += await build_nodes_from_projects(db, user_id)
    if "task" in types:
        nodes += await build_nodes_from_tasks(db, user_id)
    if "decision" in types:
        nodes += await build_nodes_from_decisions(db, user_id)
    if "failure" in types:
        nodes += await build_nodes_from_failures(db, user_id)
    if "file" in types:
        nodes += await build_nodes_from_files(db, user_id)

    # Get edges
    result = await db.execute(select(Relationship))
    rels = result.scalars().all()
    edges = [
        {
            "id": str(r.id),
            "source": str(r.source_node_id),
            "target": str(r.target_node_id),
            "label": r.relationship_type,
            "data": {"confidence": r.confidence, "reason": r.reason}
        }
        for r in rels
    ]

    return {"nodes": nodes, "edges": edges}


@router.post("/relationship")
async def create_relationship(
    source_type: str,
    source_id: uuid.UUID,
    target_type: str,
    target_id: uuid.UUID,
    rel_type: str,
    reason: Optional[str] = None,
    confidence: float = 1.0,
    created_by: str = "user",
    db: AsyncSession = Depends(get_db)
):
    rel = Relationship(
        source_node_type=source_type,
        source_node_id=source_id,
        target_node_type=target_type,
        target_node_id=target_id,
        relationship_type=rel_type,
        reason=reason,
        confidence=confidence,
        created_by=created_by,
    )
    db.add(rel)
    await db.commit()
    return {"status": "created", "id": str(rel.id)}
