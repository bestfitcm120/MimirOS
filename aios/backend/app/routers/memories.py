from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.memory import Memory
from pydantic import BaseModel
from typing import Optional, List, Any
import uuid

router = APIRouter()

class MemoryCreate(BaseModel):
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    memory_type: str
    title: str
    content: str
    summary: Optional[str] = None
    source: Optional[str] = None
    importance: float = 0.5
    is_private: bool = False

class MemoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID]
    memory_type: str
    title: str
    content: str
    summary: Optional[str]
    source: Optional[str]
    importance: float
    is_private: bool
    linked_entities: Optional[Any]

    class Config:
        from_attributes = True

@router.post("/", response_model=MemoryResponse)
async def create_memory(data: MemoryCreate, db: AsyncSession = Depends(get_db)):
    memory = Memory(**data.model_dump())
    db.add(memory)
    await db.commit()
    await db.refresh(memory)
    return memory

@router.get("/", response_model=List[MemoryResponse])
async def list_memories(
    user_id: uuid.UUID,
    project_id: Optional[uuid.UUID] = None,
    memory_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    q = select(Memory).where(Memory.user_id == user_id)
    if project_id:
        q = q.where(Memory.project_id == project_id)
    if memory_type:
        q = q.where(Memory.memory_type == memory_type)
    q = q.order_by(desc(Memory.importance), desc(Memory.updated_at)).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()

@router.delete("/{memory_id}")
async def delete_memory(memory_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    await db.delete(mem)
    await db.commit()
    return {"status": "deleted"}
