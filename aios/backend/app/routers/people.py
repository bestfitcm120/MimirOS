from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.person import Person
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class PersonCreate(BaseModel):
    user_id: uuid.UUID
    name: str
    role: Optional[str] = None
    email: Optional[str] = None
    relationship_type: Optional[str] = None

class PersonResponse(BaseModel):
    id: uuid.UUID
    name: str
    role: Optional[str]
    email: Optional[str]
    relationship_type: Optional[str]
    class Config:
        from_attributes = True

@router.post("/", response_model=PersonResponse)
async def create_person(data: PersonCreate, db: AsyncSession = Depends(get_db)):
    p = Person(**data.model_dump())
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p

@router.get("/", response_model=List[PersonResponse])
async def list_people(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Person).where(Person.user_id == user_id))
    return result.scalars().all()
