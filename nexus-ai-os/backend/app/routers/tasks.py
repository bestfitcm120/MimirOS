from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, Task

router = APIRouter()

@router.get("", response_model=List[Task])
async def list_tasks(
    status: Optional[str] = None,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).order_by(Task.priority, Task.due_date)
    if status:
        query = query.where(Task.status == status)
    if project_id:
        query = query.where(Task.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/today", response_model=List[Task])
async def get_today_tasks(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    result = await db.execute(
        select(Task).where(
            and_(Task.due_date >= today, Task.due_date < tomorrow, Task.status != "completed")
        ).order_by(Task.priority)
    )
    return result.scalars().all()

@router.get("/overdue", response_model=List[Task])
async def get_overdue_tasks(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(Task).where(
            and_(Task.due_date < today, Task.status != "completed")
        ).order_by(Task.priority)
    )
    return result.scalars().all()

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("", response_model=Task)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    db_task = Task(**task.dict(), user_id=None)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: UUID, task: TaskCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task.dict().items():
        setattr(db_task, key, value)

    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.patch("/{task_id}/complete")
async def complete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.status = "completed"
    db_task.completed_at = datetime.utcnow()
    await db.commit()
    return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Task).where(Task.id == task_id))
    await db.commit()
    return {"deleted": True}
