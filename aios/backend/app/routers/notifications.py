from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.notification import Notification
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    body: Optional[str]
    priority: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(user_id: uuid.UUID, unread_only: bool = False, db: AsyncSession = Depends(get_db)):
    q = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        q = q.where(Notification.is_read == False)
    q = q.order_by(desc(Notification.created_at)).limit(50)
    result = await db.execute(q)
    return result.scalars().all()

@router.patch("/{notif_id}/read")
async def mark_read(notif_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.id == notif_id))
    n = result.scalar_one_or_none()
    if n:
        n.is_read = True
        await db.commit()
    return {"status": "ok"}

@router.patch("/read-all")
async def mark_all_read(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.is_read == False))
    for n in result.scalars():
        n.is_read = True
    await db.commit()
    return {"status": "ok"}
