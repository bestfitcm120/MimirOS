from sqlalchemy import Column, String, ForeignKey, Integer, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    doc_type = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    storage_key = Column(String, nullable=True)
    content_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    word_count = Column(Integer, nullable=True)
    # 1536 accommodates both local (384) and openai (1536) embeddings.
    embedding = Column(Vector(1536), nullable=True)
    embed_dim = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    project = relationship("Project", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    files = relationship("File", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=True)
    embed_dim = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    document = relationship("Document", back_populates="chunks")
