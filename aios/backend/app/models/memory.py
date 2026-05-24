from sqlalchemy import Column, String, ForeignKey, Float, Boolean, JSON, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Memory(Base, TimestampMixin):
    __tablename__ = "memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    memory_type = Column(String, nullable=False)
    # types: raw, summary, project, decision, failure, preference, task, agent
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    source = Column(String, nullable=True)
    # sources: user_input, agent, file_ingestion, system
    importance = Column(Float, default=0.5)
    confidence = Column(Float, default=1.0)
    is_private = Column(Boolean, default=False)
    # Dimension 768 — large enough for both all-MiniLM-L6-v2 (384)
    # and text-embedding-3-small (1536).  We store zero-padded vectors.
    # If you only ever use one provider you can shrink this.
    embedding = Column(Vector(1536), nullable=True)
    embed_dim = Column(Integer, nullable=True)   # actual dimension stored
    linked_entities = Column(JSON, default=list)
    metadata_ = Column("metadata", JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="memories")
    project = relationship("Project", back_populates="memories")
