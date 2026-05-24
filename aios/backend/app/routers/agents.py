from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.agent import Agent, AgentRun, ToolCall
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

class AgentResponse(BaseModel):
    id: uuid.UUID
    name: str
    agent_type: str
    status: str
    performance_score: float
    class Config:
        from_attributes = True

class AgentRunResponse(BaseModel):
    id: uuid.UUID
    agent_id: uuid.UUID
    task_description: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    result: Optional[str]
    error: Optional[str]
    tool_calls_count: int
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AgentResponse])
async def list_agents(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.user_id == user_id))
    return result.scalars().all()

@router.get("/runs", response_model=List[AgentRunResponse])
async def list_runs(user_id: uuid.UUID, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentRun).where(AgentRun.user_id == user_id)
        .order_by(desc(AgentRun.created_at)).limit(limit)
    )
    return result.scalars().all()

@router.get("/{agent_id}/runs", response_model=List[AgentRunResponse])
async def get_agent_runs(agent_id: uuid.UUID, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentRun).where(AgentRun.agent_id == agent_id)
        .order_by(desc(AgentRun.created_at)).limit(limit)
    )
    return result.scalars().all()
