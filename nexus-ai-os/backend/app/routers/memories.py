from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Memory
from app.schemas import MemoryCreate, Memory

router = APIRouter()

@router.get("", response_model=List[Memory])
async def list_memories(
    memory_type: Optional[str] = None,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Memory).order_by(Memory.created_at.desc())
    if memory_type:
        query = query.where(Memory.memory_type == memory_type)
    if project_id:
        query = query.where(Memory.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{memory_id}", response_model=Memory)
async def get_memory(memory_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

@router.post("", response_model=Memory)
async def create_memory(memory: MemoryCreate, db: AsyncSession = Depends(get_db)):
    db_memory = Memory(**memory.dict(), user_id=None)
    db.add(db_memory)
    await db.commit()
    await db.refresh(db_memory)
    return db_memory

@router.delete("/{memory_id}")
async def delete_memory(memory_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Memory).where(Memory.id == memory_id))
    await db.commit()
    return {"deleted": True}
