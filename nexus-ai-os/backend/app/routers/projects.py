from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Project
from app.schemas import ProjectCreate, Project

router = APIRouter()

@router.get("", response_model=List[Project])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.updated_at.desc()))
    return result.scalars().all()

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("", response_model=Project)
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    db_project = Project(**project.dict(), user_id=None)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: UUID, project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    db_project = result.scalar_one_or_none()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project.dict().items():
        setattr(db_project, key, value)

    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
async def delete_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Project).where(Project.id == project_id))
    await db.commit()
    return {"deleted": True}
