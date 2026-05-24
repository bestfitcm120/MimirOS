from sqlalchemy import Column, String, Float, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Relationship(Base):
    __tablename__ = "relationships"
    __table_args__ = (
        UniqueConstraint(
            "source_node_type", "source_node_id",
            "target_node_type", "target_node_id",
            "relationship_type",
            name="uq_relationship"
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_type = Column(String, nullable=False)
    source_node_id = Column(UUID(as_uuid=True), nullable=False)
    target_node_type = Column(String, nullable=False)
    target_node_id = Column(UUID(as_uuid=True), nullable=False)
    relationship_type = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    confidence = Column(Float, default=1.0)
    created_by = Column(String, default="system")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
