from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.project import Project
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import date

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    type: str = "personal"
    status: str = "active"
    phase: Optional[str] = None
    description: Optional[str] = None
    goal: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    color: str = "#3b82f6"
    user_id: uuid.UUID

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    phase: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    goal: Optional[str] = None
    color: Optional[str] = None
    end_date: Optional[date] = None

class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    status: str
    phase: Optional[str]
    description: Optional[str]
    summary: Optional[str]
    goal: Optional[str]
    color: str
    user_id: uuid.UUID

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    user_id: uuid.UUID,
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(Project).where(Project.user_id == user_id)
    if status:
        q = q.where(Project.status == status)
    if type:
        q = q.where(Project.type == type)
    q = q.order_by(desc(Project.updated_at))
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: uuid.UUID, data: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(project, k, v)
    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return {"status": "deleted"}
