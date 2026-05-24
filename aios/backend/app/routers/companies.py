from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.company import Company
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class CompanyCreate(BaseModel):
    user_id: uuid.UUID
    name: str
    industry: Optional[str] = None
    status: Optional[str] = None
    website: Optional[str] = None

class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str
    industry: Optional[str]
    status: Optional[str]
    website: Optional[str]
    class Config:
        from_attributes = True

@router.post("/", response_model=CompanyResponse)
async def create_company(data: CompanyCreate, db: AsyncSession = Depends(get_db)):
    c = Company(**data.model_dump())
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return c

@router.get("/", response_model=List[CompanyResponse])
async def list_companies(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.user_id == user_id))
    return result.scalars().all()
