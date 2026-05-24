from sqlalchemy import Column, String, ForeignKey, Float, Integer, JSON, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Agent(Base, TimestampMixin):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    agent_type = Column(String, nullable=False)
    status = Column(String, default="idle")
    allowed_tools = Column(ARRAY(String), default=list)
    memory_access_rules = Column(JSON, default=dict)
    approval_required_for = Column(ARRAY(String), default=list)
    performance_score = Column(Float, default=1.0)
    metadata_ = Column("metadata", JSON, default=dict)

    runs = relationship("AgentRun", back_populates="agent", cascade="all, delete-orphan")


class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    task_description = Column(Text, nullable=False)
    status = Column(String, default="running")
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    result = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    memory_used = Column(JSON, default=list)
    tool_calls_count = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)

    agent = relationship("Agent", back_populates="runs")
    tool_calls = relationship("ToolCall", back_populates="agent_run", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="agent_run")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String, nullable=False)
    input_ = Column("input", JSON, nullable=False)
    output = Column(JSON, nullable=True)
    status = Column(String, default="success")
    duration_ms = Column(Integer, nullable=True)
    called_at = Column(DateTime(timezone=True), nullable=True)

    agent_run = relationship("AgentRun", back_populates="tool_calls")
