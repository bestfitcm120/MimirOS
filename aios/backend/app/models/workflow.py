from sqlalchemy import Column, String, ForeignKey, Boolean, Integer, JSON, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Workflow(Base, TimestampMixin):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String, nullable=True)
    trigger_config = Column(JSON, default=dict)
    steps = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True)
    metadata_ = Column("metadata", JSON, default=dict)

    runs = relationship("WorkflowRun", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowRun(Base, TimestampMixin):
    __tablename__ = "workflow_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="running")
    current_step = Column(Integer, default=0)
    state = Column(JSON, default=dict)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    workflow = relationship("Workflow", back_populates="runs")
    approvals = relationship("Approval", back_populates="workflow_run")
