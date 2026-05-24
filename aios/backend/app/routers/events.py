from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.event import Event
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class EventResponse(BaseModel):
    id: uuid.UUID
    event_type: str
    source: Optional[str]
    actor: Optional[str]
    summary: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

@router.get("/", response_model=List[EventResponse])
async def list_events(user_id: uuid.UUID, project_id: Optional[uuid.UUID] = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    q = select(Event).where(Event.user_id == user_id)
    if project_id:
        q = q.where(Event.project_id == project_id)
    q = q.order_by(desc(Event.created_at)).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()
