from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.decision import Decision
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class DecisionCreate(BaseModel):
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    title: str
    description: str
    rationale: Optional[str] = None
    alternatives: Optional[str] = None

class DecisionUpdate(BaseModel):
    outcome: Optional[str] = None
    outcome_assessment: Optional[str] = None

class DecisionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID]
    title: str
    description: str
    rationale: Optional[str]
    alternatives: Optional[str]
    outcome: Optional[str]
    outcome_assessment: Optional[str]
    decided_at: datetime
    class Config:
        from_attributes = True

@router.post("/", response_model=DecisionResponse)
async def create_decision(data: DecisionCreate, db: AsyncSession = Depends(get_db)):
    d = Decision(**data.model_dump())
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return d

@router.get("/", response_model=List[DecisionResponse])
async def list_decisions(user_id: uuid.UUID, project_id: Optional[uuid.UUID] = None, db: AsyncSession = Depends(get_db)):
    q = select(Decision).where(Decision.user_id == user_id)
    if project_id:
        q = q.where(Decision.project_id == project_id)
    q = q.order_by(desc(Decision.decided_at))
    result = await db.execute(q)
    return result.scalars().all()

@router.patch("/{decision_id}", response_model=DecisionResponse)
async def update_decision(decision_id: uuid.UUID, data: DecisionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Decision).where(Decision.id == decision_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    await db.commit()
    await db.refresh(d)
    return d
