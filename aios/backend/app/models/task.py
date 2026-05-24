from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="pending")
    # statuses: pending, in_progress, blocked, done, cancelled
    priority = Column(String, default="medium")
    # priorities: low, medium, high, urgent
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    blocked_by = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    assignee = Column(String, nullable=True)
    tags = Column(ARRAY(String), default=list)
    metadata_ = Column("metadata", JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    blocking_task = relationship("Task", remote_side="Task.id", foreign_keys=[blocked_by])
