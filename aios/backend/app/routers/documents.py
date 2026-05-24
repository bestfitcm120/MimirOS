from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as UploadFileType
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.document import Document
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class DocumentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID]
    title: str
    doc_type: Optional[str]
    summary: Optional[str]
    word_count: Optional[int]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    user_id: uuid.UUID,
    project_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(Document).where(Document.user_id == user_id)
    if project_id:
        q = q.where(Document.project_id == project_id)
    q = q.order_by(desc(Document.updated_at))
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
