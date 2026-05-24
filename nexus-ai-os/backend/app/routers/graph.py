from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Project, Task, File, Memory, Relationship, Decision, Failure, Agent, Workflow
from app.schemas import GraphData, GraphNode, GraphEdge

router = APIRouter()

NODE_TYPE_COLORS = {
    "project": "#118AB2",
    "task": "#06D6A0",
    "file": "#C5C6C7",
    "memory": "#9D4EDD",
    "decision": "#FFD166",
    "failure": "#EF476F",
    "agent": "#9D4EDD",
    "workflow": "#F4A261",
    "person": "#F4A261",
}

STATUS_COLORS = {
    "active": "#118AB2",
    "completed": "#06D6A0",
    "blocked": "#EF476F",
    "waiting": "#FFD166",
    "todo": "#C5C6C7",
    "in_progress": "#66FCF1",
    "failed": "#EF476F",
}

@router.get("", response_model=GraphData)
async def get_graph(
    project_id: Optional[UUID] = None,
    node_types: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db)
):
    nodes = []
    edges = []

    # Projects
    proj_result = await db.execute(select(Project))
    projects = proj_result.scalars().all()
    for p in projects:
        if project_id and p.id != project_id:
            continue
        color = STATUS_COLORS.get(p.status, NODE_TYPE_COLORS.get("project", "#118AB2"))
        nodes.append(GraphNode(
            id=str(p.id),
            type="project",
            label=p.title,
            status=p.status,
            data={"summary": p.summary, "phase": p.current_phase, "color": color}
        ))

    # Tasks
    task_result = await db.execute(select(Task))
    tasks = task_result.scalars().all()
    for t in tasks:
        if project_id and t.project_id != project_id:
            continue
        color = STATUS_COLORS.get(t.status, NODE_TYPE_COLORS.get("task", "#06D6A0"))
        nodes.append(GraphNode(
            id=str(t.id),
            type="task",
            label=t.title,
            status=t.status,
            data={"priority": t.priority, "due_date": str(t.due_date) if t.due_date else None, "color": color}
        ))

    # Files
    file_result = await db.execute(select(File))
    files = file_result.scalars().all()
    for f in files:
        if project_id and f.project_id != project_id:
            continue
        nodes.append(GraphNode(
            id=str(f.id),
            type="file",
            label=f.filename,
            data={"file_type": f.file_type, "color": NODE_TYPE_COLORS.get("file", "#C5C6C7")}
        ))

    # Memories
    mem_result = await db.execute(select(Memory).limit(50))
    memories = mem_result.scalars().all()
    for m in memories:
        if project_id and m.project_id != project_id:
            continue
        nodes.append(GraphNode(
            id=str(m.id),
            type="memory",
            label=m.title,
            data={"memory_type": m.memory_type, "color": NODE_TYPE_COLORS.get("memory", "#9D4EDD")}
        ))

    # Relationships
    rel_result = await db.execute(select(Relationship))
    relationships = rel_result.scalars().all()
    for r in relationships:
        nodes_dict = {n.id for n in nodes}
        if str(r.source_id) in nodes_dict and str(r.target_id) in nodes_dict:
            edges.append(GraphEdge(
                id=str(r.id),
                source=str(r.source_id),
                target=str(r.target_id),
                label=r.relationship_type,
                type=r.relationship_type
            ))

    # Auto-generate project-task edges if no explicit relationships
    for t in tasks:
        if t.project_id:
            has_edge = any(e.source == str(t.project_id) and e.target == str(t.id) for e in edges)
            if not has_edge:
                edges.append(GraphEdge(
                    id=f"auto-{t.project_id}-{t.id}",
                    source=str(t.project_id),
                    target=str(t.id),
                    label="belongs_to",
                    type="belongs_to"
                ))

    # Auto-generate project-file edges
    for f in files:
        if f.project_id:
            has_edge = any(e.source == str(f.project_id) and e.target == str(f.id) for e in edges)
            if not has_edge:
                edges.append(GraphEdge(
                    id=f"auto-file-{f.project_id}-{f.id}",
                    source=str(f.project_id),
                    target=str(f.id),
                    label="uses_file",
                    type="uses_file"
                ))

    if node_types:
        nodes = [n for n in nodes if n.type in node_types]
        node_ids = {n.id for n in nodes}
        edges = [e for e in edges if e.source in node_ids and e.target in node_ids]

    return GraphData(nodes=nodes, edges=edges)

@router.get("/node/{node_id}")
async def get_node_details(node_id: UUID, node_type: str, db: AsyncSession = Depends(get_db)):
    from app.models import Event

    # Get related events
    events_result = await db.execute(
        select(Event).where(
            Event.related_entities.contains([node_id])
        ).order_by(Event.created_at.desc()).limit(10)
    )
    events = events_result.scalars().all()

    # Get direct relationships
    rel_result = await db.execute(
        select(Relationship).where(
            (Relationship.source_id == node_id) | (Relationship.target_id == node_id)
        )
    )
    relationships = rel_result.scalars().all()

    return {
        "node_id": str(node_id),
        "node_type": node_type,
        "events": [{"id": str(e.id), "type": e.event_type, "content": e.content, "created_at": str(e.created_at)} for e in events],
        "relationships": [{"id": str(r.id), "type": r.relationship_type, "reason": r.reason} for r in relationships]
    }
