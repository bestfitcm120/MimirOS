from sqlalchemy import Column, String, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Decision(Base, TimestampMixin):
    __tablename__ = "decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    alternatives = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    outcome_assessment = Column(String, nullable=True)
    decided_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="decisions")
