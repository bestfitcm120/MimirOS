from sqlalchemy import Column, String, ForeignKey, Float, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String, nullable=False)
    source = Column(String, nullable=True)
    actor = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    content = Column(JSON, default=dict)
    related_entities = Column(JSON, default=list)
    confidence = Column(Float, default=1.0)
    status = Column(String, default="processed")

    project = relationship("Project", back_populates="events")
