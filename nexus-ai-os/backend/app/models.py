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
