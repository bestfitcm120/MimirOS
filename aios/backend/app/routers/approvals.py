from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.approval import Approval
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class ApprovalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    action_type: str
    description: str
    payload: dict
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]
    class Config:
        from_attributes = True

class ApprovalResolve(BaseModel):
    status: str  # approved | rejected
    resolved_by: str = "user"

@router.get("/", response_model=List[ApprovalResponse])
async def list_approvals(user_id: uuid.UUID, status: str = "pending", db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Approval).where(Approval.user_id == user_id, Approval.status == status)
        .order_by(desc(Approval.created_at))
    )
    return result.scalars().all()

@router.patch("/{approval_id}", response_model=ApprovalResponse)
async def resolve_approval(approval_id: uuid.UUID, data: ApprovalResolve, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Approval).where(Approval.id == approval_id))
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = data.status
    approval.resolved_at = datetime.utcnow()
    approval.resolved_by = data.resolved_by
    await db.commit()
    await db.refresh(approval)
    return approval
