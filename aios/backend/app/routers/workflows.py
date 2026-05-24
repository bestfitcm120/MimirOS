from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.workflow import Workflow, WorkflowRun
from pydantic import BaseModel
from typing import Optional, List, Any
import uuid
from datetime import datetime

router = APIRouter()

class WorkflowCreate(BaseModel):
    user_id: uuid.UUID
    name: str
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: dict = {}
    steps: List[dict] = []

class WorkflowResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    trigger_type: Optional[str]
    is_active: bool
    class Config:
        from_attributes = True

class WorkflowRunResponse(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    status: str
    current_step: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error: Optional[str]
    retry_count: int
    class Config:
        from_attributes = True

@router.post("/", response_model=WorkflowResponse)
async def create_workflow(data: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    wf = Workflow(**data.model_dump())
    db.add(wf)
    await db.commit()
    await db.refresh(wf)
    return wf

@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.user_id == user_id))
    return result.scalars().all()

@router.get("/runs", response_model=List[WorkflowRunResponse])
async def list_runs(user_id: uuid.UUID, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkflowRun).where(WorkflowRun.user_id == user_id)
        .order_by(desc(WorkflowRun.created_at)).limit(limit)
    )
    return result.scalars().all()
