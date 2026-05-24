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
