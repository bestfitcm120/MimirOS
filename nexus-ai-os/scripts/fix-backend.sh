#!/bin/bash
set -e

echo "🔧 Fixing Nexus AI OS backend files..."

cd ~/nexus-ai-os

# Stop containers
docker-compose down 2>/dev/null || true

# Remove corrupted files
sudo rm -rf backend/app backend/__pycache__ 2>/dev/null || true
sudo find backend -name "*.pyc" -delete 2>/dev/null || true

# Recreate structure
mkdir -p backend/app/routers backend/app/services
touch backend/app/__init__.py
touch backend/app/routers/__init__.py

echo "✅ Structure recreated. Now writing files..."

# database.py
cat > backend/app/database.py << 'PYEOF'
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://nexus:nexus@localhost:5432/nexus")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
PYEOF

echo "📄 database.py"

# models.py
cat > backend/app/models.py << 'PYEOF'
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON, ARRAY, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    preferences = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    project_type = Column(String, default="personal")
    status = Column(String, default="active")
    priority = Column(Integer, default=3)
    summary = Column(Text)
    current_phase = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="todo")
    priority = Column(Integer, default=3)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    next_action = Column(String)
    source = Column(String, default="manual")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class File(Base):
    __tablename__ = "files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    size_bytes = Column(Integer)
    checksum = Column(String)
    summary = Column(Text)
    indexed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"))
    title = Column(String)
    author = Column(String)
    document_type = Column(String)
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    chunk_index = Column(Integer)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    embedding = Column(Vector(384))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Memory(Base):
    __tablename__ = "memories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    memory_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    source = Column(String)
    importance = Column(Integer, default=3)
    confidence = Column(Float, default=1.0)
    embedding = Column(Vector(384))
    meta_data = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    source_type = Column(String, nullable=False)
    source_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False)
    relationship_type = Column(String, nullable=False)
    reason = Column(Text)
    confidence = Column(Float, default=1.0)
    created_by = Column(String, default="system")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('source_id', 'target_id', 'relationship_type', name='unique_relationship'),)

class Event(Base):
    __tablename__ = "events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    actor = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    related_entities = Column(ARRAY(UUID(as_uuid=True)))
    confidence = Column(Float, default=1.0)
    status = Column(String, default="completed")
    meta_data = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Agent(Base):
    __tablename__ = "agents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    purpose = Column(Text, nullable=False)
    allowed_tools = Column(JSONB, default=list)
    memory_scope = Column(JSONB, default=dict)
    approval_rules = Column(JSONB, default=list)
    status = Column(String, default="idle")
    config = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    status = Column(String, default="running")
    input_data = Column(JSONB, default=dict)
    output_data = Column(JSONB, default=dict)
    error = Column(Text)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True))

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    workflow_type = Column(String)
    definition = Column(JSONB, nullable=False)
    requires_approval = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    status = Column(String, default="running")
    current_step = Column(String)
    next_step = Column(String)
    input_data = Column(JSONB, default=dict)
    output_data = Column(JSONB, default=dict)
    error = Column(Text)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    workflow_run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_runs.id"))
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id"))
    action_type = Column(String, nullable=False)
    proposed_action = Column(JSONB, nullable=False)
    reason = Column(Text)
    status = Column(String, default="pending")
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    decision = Column(Text, nullable=False)
    reason = Column(Text)
    alternatives = Column(JSONB, default=list)
    outcome = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Failure(Base):
    __tablename__ = "failures"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    title = Column(String, nullable=False)
    what_failed = Column(Text, nullable=False)
    why_failed = Column(Text)
    fix = Column(Text)
    lesson_learned = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text)
    related_entity_type = Column(String)
    related_entity_id = Column(UUID(as_uuid=True))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
PYEOF

echo "📄 models.py"

# schemas.py
cat > backend/app/schemas.py << 'PYEOF'
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    preferences: Dict[str, Any] = {}
    created_at: datetime
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_type: str = "personal"
    status: str = "active"
    priority: int = 3
    summary: Optional[str] = None
    current_phase: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: int = 3
    due_date: Optional[datetime] = None
    next_action: Optional[str] = None
    project_id: Optional[UUID] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: UUID
    user_id: UUID
    completed_at: Optional[datetime] = None
    source: str = "manual"
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class FileBase(BaseModel):
    filename: str
    file_path: str
    file_type: Optional[str] = None
    size_bytes: Optional[int] = None
    project_id: Optional[UUID] = None

class FileCreate(FileBase):
    pass

class File(FileBase):
    id: UUID
    user_id: UUID
    checksum: Optional[str] = None
    summary: Optional[str] = None
    indexed: bool = False
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class MemoryBase(BaseModel):
    memory_type: str
    title: str
    content: str
    summary: Optional[str] = None
    source: Optional[str] = None
    importance: int = 3
    confidence: float = 1.0
    project_id: Optional[UUID] = None
    meta_data: Dict[str, Any] = {}

class MemoryCreate(MemoryBase):
    pass

class Memory(MemoryBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class RelationshipBase(BaseModel):
    source_type: str
    source_id: UUID
    target_type: str
    target_id: UUID
    relationship_type: str
    reason: Optional[str] = None
    confidence: float = 1.0

class RelationshipCreate(RelationshipBase):
    pass

class Relationship(RelationshipBase):
    id: UUID
    user_id: UUID
    created_by: str = "system"
    created_at: datetime
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    actor: str
    event_type: str
    content: str
    summary: Optional[str] = None
    project_id: Optional[UUID] = None
    related_entities: Optional[List[UUID]] = None
    confidence: float = 1.0
    status: str = "completed"
    meta_data: Dict[str, Any] = {}

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    status: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    data: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    type: Optional[str] = None

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class SearchResult(BaseModel):
    id: UUID
    type: str
    title: str
    content: str
    score: float
    meta_data: Dict[str, Any] = {}

class CommandRequest(BaseModel):
    command: str
    mode: Optional[str] = None

class CommandResponse(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[UUID] = None
    message: str
    data: Dict[str, Any] = {}

class DashboardData(BaseModel):
    today_tasks: List[Task]
    overdue_tasks: List[Task]
    active_projects: List[Project]
    recent_events: List[Event]
    pending_approvals: int
    active_agents: int
PYEOF

echo "📄 schemas.py"

# main.py
cat > backend/app/main.py << 'PYEOF'
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

    today_tasks_result = await db.execute(
        select(Task).where(
            and_(Task.due_date >= today, Task.due_date < today + timedelta(days=1), Task.status != "completed")
        ).order_by(Task.priority)
    )
    today_tasks = today_tasks_result.scalars().all()

    overdue_result = await db.execute(
        select(Task).where(
            and_(Task.due_date < today, Task.status != "completed")
        ).order_by(Task.priority)
    )
    overdue_tasks = overdue_result.scalars().all()

    projects_result = await db.execute(
        select(Project).where(Project.status == "active").order_by(Project.updated_at.desc()).limit(5)
    )
    active_projects = projects_result.scalars().all()

    events_result = await db.execute(
        select(Event).order_by(Event.created_at.desc()).limit(20)
    )
    recent_events = events_result.scalars().all()

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
PYEOF

echo "📄 main.py"

# routers/projects.py
cat > backend/app/routers/projects.py << 'PYEOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Project
from app.schemas import ProjectCreate, Project

router = APIRouter()

@router.get("", response_model=List[Project])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.updated_at.desc()))
    return result.scalars().all()

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("", response_model=Project)
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    db_project = Project(**project.dict(), user_id=None)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: UUID, project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    db_project = result.scalar_one_or_none()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project.dict().items():
        setattr(db_project, key, value)

    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
async def delete_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Project).where(Project.id == project_id))
    await db.commit()
    return {"deleted": True}
PYEOF

echo "📄 routers/projects.py"

# routers/tasks.py
cat > backend/app/routers/tasks.py << 'PYEOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, Task

router = APIRouter()

@router.get("", response_model=List[Task])
async def list_tasks(
    status: Optional[str] = None,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).order_by(Task.priority, Task.due_date)
    if status:
        query = query.where(Task.status == status)
    if project_id:
        query = query.where(Task.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/today", response_model=List[Task])
async def get_today_tasks(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    result = await db.execute(
        select(Task).where(
            and_(Task.due_date >= today, Task.due_date < tomorrow, Task.status != "completed")
        ).order_by(Task.priority)
    )
    return result.scalars().all()

@router.get("/overdue", response_model=List[Task])
async def get_overdue_tasks(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(Task).where(
            and_(Task.due_date < today, Task.status != "completed")
        ).order_by(Task.priority)
    )
    return result.scalars().all()

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("", response_model=Task)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    db_task = Task(**task.dict(), user_id=None)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: UUID, task: TaskCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task.dict().items():
        setattr(db_task, key, value)

    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.patch("/{task_id}/complete")
async def complete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.status = "completed"
    db_task.completed_at = datetime.utcnow()
    await db.commit()
    return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Task).where(Task.id == task_id))
    await db.commit()
    return {"deleted": True}
PYEOF

echo "📄 routers/tasks.py"

# routers/files.py
cat > backend/app/routers/files.py << 'PYEOF'
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID
import os
import hashlib
import aiofiles

from app.database import get_db
from app.models import File
from app.schemas import FileCreate, File as FileSchema

router = APIRouter()

FILE_STORAGE = os.getenv("FILE_STORAGE_PATH", "./files")
os.makedirs(FILE_STORAGE, exist_ok=True)

@router.get("", response_model=List[FileSchema])
async def list_files(project_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    query = select(File).order_by(File.created_at.desc())
    if project_id:
        query = query.where(File.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/upload")
async def upload_file(
    upload_file: UploadFile = FastAPIFile(...),
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    file_hash = hashlib.md5()
    content = await upload_file.read()
    file_hash.update(content)
    checksum = file_hash.hexdigest()

    file_path = os.path.join(FILE_STORAGE, f"{checksum}_{upload_file.filename}")
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    db_file = File(
        filename=upload_file.filename,
        file_path=file_path,
        file_type=upload_file.content_type,
        size_bytes=len(content),
        checksum=checksum,
        project_id=project_id,
        user_id=None
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file

@router.get("/{file_id}", response_model=FileSchema)
async def get_file(file_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@router.delete("/{file_id}")
async def delete_file(file_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalar_one_or_none()
    if file and os.path.exists(file.file_path):
        os.remove(file.file_path)
    await db.execute(delete(File).where(File.id == file_id))
    await db.commit()
    return {"deleted": True}
PYEOF

echo "📄 routers/files.py"

# routers/memories.py
cat > backend/app/routers/memories.py << 'PYEOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Memory
from app.schemas import MemoryCreate, Memory

router = APIRouter()

@router.get("", response_model=List[Memory])
async def list_memories(
    memory_type: Optional[str] = None,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Memory).order_by(Memory.created_at.desc())
    if memory_type:
        query = query.where(Memory.memory_type == memory_type)
    if project_id:
        query = query.where(Memory.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{memory_id}", response_model=Memory)
async def get_memory(memory_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

@router.post("", response_model=Memory)
async def create_memory(memory: MemoryCreate, db: AsyncSession = Depends(get_db)):
    db_memory = Memory(**memory.dict(), user_id=None)
    db.add(db_memory)
    await db.commit()
    await db.refresh(db_memory)
    return db_memory

@router.delete("/{memory_id}")
async def delete_memory(memory_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Memory).where(Memory.id == memory_id))
    await db.commit()
    return {"deleted": True}
PYEOF

echo "📄 routers/memories.py"

# routers/graph.py
cat > backend/app/routers/graph.py << 'PYEOF'
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

    events_result = await db.execute(
        select(Event).where(
            Event.related_entities.contains([node_id])
        ).order_by(Event.created_at.desc()).limit(10)
    )
    events = events_result.scalars().all()

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
PYEOF

echo "📄 routers/graph.py"

# routers/search.py
cat > backend/app/routers/search.py << 'PYEOF'
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
PYEOF

echo "📄 routers/search.py"

# services/ingestion.py
cat > backend/app/services/ingestion.py << 'PYEOF'
import os
import hashlib
from typing import Optional
from uuid import UUID

class IngestionService:
    def __init__(self, file_storage_path: str = "./files"):
        self.file_storage_path = file_storage_path
        os.makedirs(file_storage_path, exist_ok=True)

    async def process_file(self, file_path: str, file_id: UUID) -> dict:
        result = {
            "file_id": str(file_id),
            "chunks": [],
            "summary": None,
            "error": None
        }

        try:
            if file_path.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            elif file_path.endswith('.md'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                text = f"[Binary file: {os.path.basename(file_path)}]"

            chunks = self._chunk_text(text, chunk_size=1000, overlap=100)
            result["chunks"] = [{"index": i, "content": c[:200] + "..."} for i, c in enumerate(chunks)]
            result["summary"] = text[:500] + "..." if len(text) > 500 else text

        except Exception as e:
            result["error"] = str(e)

        return result

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> list:
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        return chunks
PYEOF

echo "📄 services/ingestion.py"

# services/search.py
cat > backend/app/services/search.py << 'PYEOF'
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.models import Memory

class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def semantic_search(self, query: str, limit: int = 10) -> List[dict]:
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
PYEOF

echo "📄 services/search.py"

echo ""
echo "✅ All backend files written successfully!"
echo "🚀 Starting Docker containers..."
docker-compose up --build
