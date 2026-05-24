import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import engine, Base, async_session_maker, get_db
from app.routers import projects, tasks, files, memories, graph, search
from app.schemas import CommandRequest, CommandResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="Nexus AI OS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(memories.router, prefix="/api/memories", tags=["memories"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "nexus-ai-os"}

@app.get("/api/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select, func, and_
    from datetime import datetime, timedelta
    from app.models import Task, Project, Event, Approval

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Today tasks
    today_tasks_result = await db.execute(
        select(Task).where(
            and_(Task.due_date >= today, Task.due_date < today + timedelta(days=1), Task.status != "completed")
        ).order_by(Task.priority)
    )
    today_tasks = today_tasks_result.scalars().all()

    # Overdue
    overdue_result = await db.execute(
        select(Task).where(
            and_(Task.due_date < today, Task.status != "completed")
        ).order_by(Task.priority)
    )
    overdue_tasks = overdue_result.scalars().all()

    # Active projects
    projects_result = await db.execute(
        select(Project).where(Project.status == "active").order_by(Project.updated_at.desc()).limit(5)
    )
    active_projects = projects_result.scalars().all()

    # Recent events
    events_result = await db.execute(
        select(Event).order_by(Event.created_at.desc()).limit(20)
    )
    recent_events = events_result.scalars().all()

    # Pending approvals count
    approvals_result = await db.execute(
        select(func.count()).where(Approval.status == "pending")
    )
    pending_approvals = approvals_result.scalar()

    return {
        "today_tasks": today_tasks,
        "overdue_tasks": overdue_tasks,
        "active_projects": active_projects,
        "recent_events": recent_events,
        "pending_approvals": pending_approvals or 0,
        "active_agents": 0
    }

@app.post("/api/command")
async def process_command(req: CommandRequest, db: AsyncSession = Depends(get_db)):
    cmd = req.command.lower().strip()

    if "project" in cmd or "open" in cmd:
        return CommandResponse(action="navigate", target_type="project", message=f"Opening projects view for: {req.command}")
    elif "task" in cmd or "todo" in cmd:
        return CommandResponse(action="navigate", target_type="task", message=f"Showing tasks for: {req.command}")
    elif "file" in cmd or "document" in cmd:
        return CommandResponse(action="navigate", target_type="file", message=f"Searching files for: {req.command}")
    elif "agent" in cmd:
        return CommandResponse(action="navigate", target_type="agent", message="Opening agent console")
    elif "workflow" in cmd:
        return CommandResponse(action="navigate", target_type="workflow", message="Opening workflow panel")
    else:
        return CommandResponse(action="search", message=f"Searching across all memory for: {req.command}")
