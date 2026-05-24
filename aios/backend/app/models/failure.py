from sqlalchemy import Column, String, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Failure(Base, TimestampMixin):
    __tablename__ = "failures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=True)
    fix_applied = Column(Text, nullable=True)
    lesson_learned = Column(Text, nullable=True)
    severity = Column(String, default="medium")
    is_resolved = Column(Boolean, default=False)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="failures")
