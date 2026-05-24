from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base
from app.models.mixins import TimestampMixin


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    professor_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String, default="active")
    grade = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
