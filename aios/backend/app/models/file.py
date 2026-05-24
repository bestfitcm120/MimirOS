from sqlalchemy import Column, String, ForeignKey, BigInteger, Boolean, Integer, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class File(Base, TimestampMixin):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    storage_key = Column(String, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=True)
    checksum = Column(String, nullable=True)
    version = Column(Integer, default=1)
    is_latest = Column(Boolean, default=True)
    parent_file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    project = relationship("Project", back_populates="files")
    document = relationship("Document", back_populates="files")
    versions = relationship("File", remote_side="File.id", foreign_keys=[parent_file_id])
