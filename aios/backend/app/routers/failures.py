from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.failure import Failure
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class FailureCreate(BaseModel):
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    title: str
    description: str
    root_cause: Optional[str] = None
    fix_applied: Optional[str] = None
    lesson_learned: Optional[str] = None
    severity: str = "medium"

class FailureResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID]
    title: str
    description: str
    root_cause: Optional[str]
    fix_applied: Optional[str]
    lesson_learned: Optional[str]
    severity: str
    is_resolved: bool
    occurred_at: datetime
    class Config:
        from_attributes = True

@router.post("/", response_model=FailureResponse)
async def create_failure(data: FailureCreate, db: AsyncSession = Depends(get_db)):
    f = Failure(**data.model_dump())
    db.add(f)
    await db.commit()
    await db.refresh(f)
    return f

@router.get("/", response_model=List[FailureResponse])
async def list_failures(user_id: uuid.UUID, project_id: Optional[uuid.UUID] = None, db: AsyncSession = Depends(get_db)):
    q = select(Failure).where(Failure.user_id == user_id)
    if project_id:
        q = q.where(Failure.project_id == project_id)
    q = q.order_by(desc(Failure.occurred_at))
    result = await db.execute(q)
    return result.scalars().all()

@router.patch("/{failure_id}/resolve")
async def resolve_failure(failure_id: uuid.UUID, lesson: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Failure).where(Failure.id == failure_id))
    f = result.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="Failure not found")
    f.is_resolved = True
    f.resolved_at = datetime.utcnow()
    if lesson:
        f.lesson_learned = lesson
    await db.commit()
    return {"status": "resolved"}
